import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentRCIC } from "@/lib/rcic-auth";
import { getRoomWithSignals } from "@/lib/call-store";
import { cookies } from "next/headers";

async function canAccessRoom(roomId: string): Promise<"member" | "rcic" | "team" | null> {
  const room = getRoomWithSignals(roomId);
  if (!room) return null;

  const caseItem = await prisma.case.findUnique({ where: { id: room.caseId } });
  if (!caseItem) return null;

  const user = await getCurrentUser();
  if (user && caseItem.userId === user.id) return "member";

  const rcic = await getCurrentRCIC();
  if (rcic && caseItem.rcicId === rcic.id) return "rcic";

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
      if (member && caseItem.rcicId === member.rcicId) return "team";
    }
  }
  return null;
}

/** 获取房间信息与信令（轮询用） */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const role = await canAccessRoom(roomId);
    if (!role) {
      return NextResponse.json(
        { success: false, message: "无权访问或房间不存在" },
        { status: 403 }
      );
    }
    const room = getRoomWithSignals(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, message: "房间不存在" },
        { status: 404 }
      );
    }
    const after = request.nextUrl.searchParams.get("after");
    const afterIndex = after ? parseInt(after, 10) : 0;
    const signals = Number.isNaN(afterIndex) ? room.signals : room.signals.slice(afterIndex);
    return NextResponse.json({
      success: true,
      room: {
        roomId: room.roomId,
        caseId: room.caseId,
        type: room.type,
        status: room.status,
        initiatorRole: room.initiatorRole,
      },
      signals,
      signalsLength: room.signals.length,
    });
  } catch (e) {
    console.error("[call/[roomId] GET]", e);
    return NextResponse.json(
      { success: false, message: "获取失败" },
      { status: 500 }
    );
  }
}
