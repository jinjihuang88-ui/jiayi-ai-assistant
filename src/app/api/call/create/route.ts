import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentRCIC } from "@/lib/rcic-auth";
import { createRoom } from "@/lib/call-store";
import type { CallType } from "@/lib/call-store";

/** 创建通话房间（会员发起或顾问/文案发起均可） */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const caseId = body.caseId as string | undefined;
    const type = (body.type === "voice" ? "voice" : "video") as CallType;

    if (!caseId || typeof caseId !== "string") {
      return NextResponse.json(
        { success: false, message: "缺少 caseId" },
        { status: 400 }
      );
    }

    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      return NextResponse.json(
        { success: false, message: "案件不存在" },
        { status: 404 }
      );
    }

    // 会员
    const user = await getCurrentUser();
    if (user) {
      if (caseItem.userId !== user.id) {
        return NextResponse.json(
          { success: false, message: "无权操作该案件" },
          { status: 403 }
        );
      }
      const room = createRoom({
        caseId,
        type,
        initiatorRole: "member",
        initiatorId: user.id,
      });
      return NextResponse.json({
        success: true,
        roomId: room.roomId,
        type: room.type,
        role: "member",
      });
    }

    // 顾问
    const rcic = await getCurrentRCIC();
    if (rcic) {
      if (caseItem.rcicId !== rcic.id) {
        return NextResponse.json(
          { success: false, message: "无权操作该案件" },
          { status: 403 }
        );
      }
      const room = createRoom({
        caseId,
        type,
        initiatorRole: "rcic",
        initiatorId: rcic.id,
      });
      return NextResponse.json({
        success: true,
        roomId: room.roomId,
        type: room.type,
        role: "rcic",
      });
    }

    // 团队成员
    const cookieStore = await cookies();
    const teamToken = cookieStore.get("team_member_session_token")?.value;
    if (teamToken) {
      const session = await prisma.rCICTeamMemberSession.findUnique({
        where: { token: teamToken },
      });
      if (session && new Date(session.expiresAt) > new Date()) {
        const member = await prisma.rCICTeamMember.findUnique({
          where: { id: session.memberId },
        });
        if (member && caseItem.rcicId === member.rcicId) {
          const room = createRoom({
            caseId,
            type,
            initiatorRole: "team",
            initiatorId: member.id,
          });
          return NextResponse.json({
            success: true,
            roomId: room.roomId,
            type: room.type,
            role: "team",
          });
        }
      }
    }

    return NextResponse.json(
      { success: false, message: "未登录或无权操作" },
      { status: 401 }
    );
  } catch (e) {
    console.error("[call/create]", e);
    return NextResponse.json(
      { success: false, message: "创建通话失败" },
      { status: 500 }
    );
  }
}
