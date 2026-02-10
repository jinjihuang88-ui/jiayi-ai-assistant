import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 验证团队成员登录
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("team_member_session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "未登录" },
        { status: 401 }
      );
    }

    // 查找session（使用token字段）
    const session = await prisma.rCICTeamMemberSession.findUnique({
      where: { token: sessionToken },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: "会话已过期" },
        { status: 401 }
      );
    }

    // 获取团队成员信息
    const member = await prisma.rCICTeamMember.findUnique({
      where: { id: session.memberId },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "团队成员不存在" },
        { status: 404 }
      );
    }

    // 获取团队成员所属RCIC的所有案件对话
    const cases = await prisma.case.findMany({
      where: { rcicId: member.rcicId },
      include: {
        user: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // 构建对话列表
    const conversations = await Promise.all(
      cases
        .filter((c) => c.messages.length > 0)
        .map(async (c) => {
          const unreadCount = await prisma.message.count({
            where: {
              caseId: c.id,
              senderType: "user",
              read: false,
            },
          });

          return {
            caseId: c.id,
            case: {
              id: c.id,
              type: c.type,
              title: c.title,
            },
            user: {
              id: c.user.id,
              email: c.user.email,
              name: c.user.name,
              avatar: c.user.avatar,
            },
            lastMessage: c.messages[0],
            unreadCount,
          };
        })
    );

    // 按最后消息时间排序
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("[Team Conversations] Error:", error);
    return NextResponse.json(
      { success: false, message: "获取对话列表失败" },
      { status: 500 }
    );
  }
}
