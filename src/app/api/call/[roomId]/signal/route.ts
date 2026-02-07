import { NextRequest, NextResponse } from "next/server";
import { getRoomWithSignals, addSignal } from "@/lib/call-store";

async function canAccessRoomForSignal(roomId: string): Promise<boolean> {
  const room = getRoomWithSignals(roomId);
  if (!room) return false;
  const { cookies } = await import("next/headers");
  const { prisma } = await import("@/lib/prisma");
  const { getCurrentUser } = await import("@/lib/auth");
  const { getCurrentRCIC } = await import("@/lib/rcic-auth");

  const caseItem = await prisma.case.findUnique({ where: { id: room.caseId } });
  if (!caseItem) return false;

  const user = await getCurrentUser();
  if (user && caseItem.userId === user.id) return true;

  const rcic = await getCurrentRCIC();
  if (rcic && caseItem.rcicId === rcic.id) return true;

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
      if (member && caseItem.rcicId === member.rcicId) return true;
    }
  }
  return false;
}

/** 发送信令（offer / answer / ice） */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const allowed = await canAccessRoomForSignal(roomId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "无权操作或房间不存在" },
        { status: 403 }
      );
    }
    const body = await request.json().catch(() => ({}));
    const type = (body.type as string) || "";
    const data = body.data;
    if (!type || (type !== "offer" && type !== "answer" && type !== "ice")) {
      return NextResponse.json(
        { success: false, message: "无效 type，应为 offer/answer/ice" },
        { status: 400 }
      );
    }
    const ok = addSignal(roomId, type, data);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "房间已结束" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[call/[roomId]/signal]", e);
    return NextResponse.json(
      { success: false, message: "发送失败" },
      { status: 500 }
    );
  }
}
