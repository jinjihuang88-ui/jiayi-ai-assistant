import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const rcicSession = cookieStore.get("rcic_session_token")?.value;
    const teamSession = cookieStore.get("team_member_session_token")?.value;

    let currentUserId: string;
    let currentUserType: "rcic" | "team_member";

    // 验证RCIC session
    if (rcicSession) {
      const session = await prisma.rCICSession.findUnique({
        where: { token: rcicSession },
      });

      if (!session || session.expiresAt < new Date()) {
        return NextResponse.json(
          { success: false, error: "会话已过期" },
          { status: 401 }
        );
      }

      currentUserId = session.rcicId;
      currentUserType = "rcic";
    }
    // 验证团队成员session
    else if (teamSession) {
      const session = await prisma.rCICTeamMemberSession.findUnique({
        where: { token: teamSession },
      });

      if (!session || session.expiresAt < new Date()) {
        return NextResponse.json(
          { success: false, error: "会话已过期" },
          { status: 401 }
        );
      }

      currentUserId = session.memberId;
      currentUserType = "team_member";
    } else {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    // 获取所有相关对话
    const conversations = await prisma.internalConversation.findMany({
      where: {
        OR: [
          { participant1Id: currentUserId, participant1Type: currentUserType },
          { participant2Id: currentUserId, participant2Type: currentUserType },
        ],
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    // 获取对话参与者信息
    const conversationsWithParticipants = await Promise.all(
      conversations.map(async (conv) => {
        // 确定对方是谁
        const isParticipant1 =
          conv.participant1Id === currentUserId &&
          conv.participant1Type === currentUserType;
        const otherUserId = isParticipant1
          ? conv.participant2Id
          : conv.participant1Id;
        const otherUserType = isParticipant1
          ? conv.participant2Type
          : conv.participant1Type;

        // 获取对方信息
        let otherUser;
        if (otherUserType === "rcic") {
          otherUser = await prisma.rCIC.findUnique({
            where: { id: otherUserId },
            select: { id: true, name: true, email: true, avatar: true },
          });
        } else {
          otherUser = await prisma.rCICTeamMember.findUnique({
            where: { id: otherUserId },
            select: { id: true, name: true, email: true, role: true },
          });
        }

        // 获取未读消息数
        const unreadCount = await prisma.internalMessage.count({
          where: {
            conversationId: conv.id,
            receiverId: currentUserId,
            receiverType: currentUserType,
            isRead: false,
          },
        });

        return {
          ...conv,
          otherUser: {
            ...otherUser,
            userType: otherUserType,
          },
          unreadCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: conversationsWithParticipants,
    });
  } catch (error) {
    console.error("获取对话列表失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
