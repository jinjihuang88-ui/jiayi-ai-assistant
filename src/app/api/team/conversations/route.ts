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

    // 查找session
    const session = await prisma.rCICTeamMemberSession.findUnique({
      where: { sessionToken },
      include: { member: true },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: "会话已过期" },
        { status: 401 }
      );
    }

    // 获取团队成员所属RCIC的所有案件对话
    const applications = await prisma.application.findMany({
      where: { rcicId: session.member.rcicId },
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
      applications
        .filter((app) => app.messages.length > 0)
        .map(async (app) => {
          const unreadCount = await prisma.message.count({
            where: {
              applicationId: app.id,
              senderType: "user",
              isRead: false,
            },
          });

          return {
            applicationId: app.id,
            application: {
              id: app.id,
              type: app.type,
              typeName: getTypeName(app.type),
            },
            user: {
              id: app.user.id,
              email: app.user.email,
              name: app.user.name,
              avatar: app.user.avatar,
            },
            lastMessage: app.messages[0],
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

function getTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    ee: "快速通道",
    pnp: "省提名",
    study: "学签",
    work: "工签",
    visit: "访问签证",
  };
  return typeMap[type] || type;
}
