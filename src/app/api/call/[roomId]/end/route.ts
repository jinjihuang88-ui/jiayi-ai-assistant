import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentRCIC } from "@/lib/rcic-auth";
import { getRoom, endRoom } from "@/lib/call-store";
import { getCaseFollowerWithStatus } from "@/lib/case-follower";
import { sendCaseFollowerMissedCallNotification } from "@/lib/email";
import { sendCaseFollowerOfflineNotification } from "@/lib/wechat";

/** 结束通话。若为会员发起且未接听（仍 ringing），则发邮件通知该案件跟进人。 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = getRoom(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, message: "房间不存在或已结束" },
        { status: 404 }
      );
    }

    const caseItem = await prisma.case.findUnique({ where: { id: room.caseId } });
    if (!caseItem) {
      endRoom(roomId);
      return NextResponse.json({ success: true });
    }

    // 校验调用方是否有权操作该房间（会员/顾问/团队）
    const user = await getCurrentUser();
    if (user && caseItem.userId === user.id) {
      // 会员结束：若未接听则通知跟进人
      if (room.initiatorRole === "member" && room.status === "ringing") {
        getCaseFollowerWithStatus(prisma, room.caseId)
          .then(async (follower) => {
            if (follower?.email) {
              await sendCaseFollowerMissedCallNotification(follower.email, room.type, {
                caseTitle: follower.caseTitle,
              }).catch((e) => console.error("[call/end] Notify missed call:", e));
              if (!follower.isOnline) {
                sendCaseFollowerOfflineNotification({
                  caseTitle: follower.caseTitle,
                  followerName: follower.name,
                  type: "missed_call",
                  callType: room.type === "video" ? "video" : "voice",
                }).catch((e) => console.error("[call/end] WeChat offline notify:", e));
              }
            }
          })
          .catch((e) => console.error("[call/end] getCaseFollowerWithStatus:", e));
      }
      endRoom(roomId);
      return NextResponse.json({ success: true });
    }

    const rcic = await getCurrentRCIC();
    if (rcic && caseItem.rcicId === rcic.id) {
      endRoom(roomId);
      return NextResponse.json({ success: true });
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
          endRoom(roomId);
          return NextResponse.json({ success: true });
        }
      }
    }

    return NextResponse.json(
      { success: false, message: "未登录或无权操作" },
      { status: 401 }
    );
  } catch (e) {
    console.error("[call/[roomId]/end]", e);
    return NextResponse.json(
      { success: false, message: "结束失败" },
      { status: 500 }
    );
  }
}
