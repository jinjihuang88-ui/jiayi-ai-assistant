import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "缺少applicationId参数" },
        { status: 400 }
      );
    }

    // 验证案件是否属于该团队成员的RCIC
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.rcicId !== session.member.rcicId) {
      return NextResponse.json(
        { success: false, message: "无权访问该案件" },
        { status: 403 }
      );
    }

    // 标记所有用户发送的消息为已读
    await prisma.message.updateMany({
      where: {
        applicationId,
        senderType: "user",
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[Team Messages Read] Error:", error);
    return NextResponse.json(
      { success: false, message: "标记已读失败" },
      { status: 500 }
    );
  }
}
