import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentRCIC } from "@/lib/rcic-auth";
import { getRoomsByCaseId } from "@/lib/call-store";
import { cookies } from "next/headers";

/** 获取某案件的来电列表（顾问/团队用，用于显示「用户来电」） */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");
    if (!caseId) {
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

    // 顾问
    const rcic = await getCurrentRCIC();
    if (rcic && caseItem.rcicId === rcic.id) {
      const rooms = getRoomsByCaseId(caseId);
      return NextResponse.json({
        success: true,
        rooms: rooms.map((r) => ({
          roomId: r.roomId,
          type: r.type,
          status: r.status,
          initiatorRole: r.initiatorRole,
          createdAt: r.createdAt,
        })),
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
          const rooms = getRoomsByCaseId(caseId);
          return NextResponse.json({
            success: true,
            rooms: rooms.map((r) => ({
              roomId: r.roomId,
              type: r.type,
              status: r.status,
              initiatorRole: r.initiatorRole,
              createdAt: r.createdAt,
            })),
          });
        }
      }
    }

    return NextResponse.json(
      { success: false, message: "未登录或无权查看" },
      { status: 401 }
    );
  } catch (e) {
    console.error("[call/rooms]", e);
    return NextResponse.json(
      { success: false, message: "获取失败" },
      { status: 500 }
    );
  }
}
