import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentRCIC } from "@/lib/rcic-auth";
import { getRoom, joinRoom } from "@/lib/call-store";
import { cookies } from "next/headers";

/** 顾问/团队接听：将房间状态设为 active */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = getRoom(roomId);
    if (!room || room.status !== "ringing") {
      return NextResponse.json(
        { success: false, message: "房间不存在或已接听/已结束" },
        { status: 404 }
      );
    }

    const caseItem = await prisma.case.findUnique({ where: { id: room.caseId } });
    if (!caseItem) {
      return NextResponse.json(
        { success: false, message: "案件不存在" },
        { status: 404 }
      );
    }

    const rcic = await getCurrentRCIC();
    if (rcic && caseItem.rcicId === rcic.id) {
      const updated = joinRoom(roomId);
      return NextResponse.json({
        success: true,
        roomId: updated!.roomId,
        type: updated!.type,
        status: updated!.status,
      });
    }

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
          const updated = joinRoom(roomId);
          return NextResponse.json({
            success: true,
            roomId: updated!.roomId,
            type: updated!.type,
            status: updated!.status,
          });
        }
      }
    }

    return NextResponse.json(
      { success: false, message: "未登录或无权接听" },
      { status: 401 }
    );
  } catch (e) {
    console.error("[call/[roomId]/join]", e);
    return NextResponse.json(
      { success: false, message: "接听失败" },
      { status: 500 }
    );
  }
}
