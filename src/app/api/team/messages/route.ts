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

    // 获取applicationId
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");

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

    // 获取消息列表
    const messages = await prisma.message.findMany({
      where: { applicationId },
      include: {
        user: true,
        application: true,
        attachments: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("[Team Messages GET] Error:", error);
    return NextResponse.json(
      { success: false, message: "获取消息失败" },
      { status: 500 }
    );
  }
}

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
    const { applicationId, content, messageType = "text", attachments = [] } = body;

    if (!applicationId || !content) {
      return NextResponse.json(
        { success: false, message: "缺少必要参数" },
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

    // 创建消息
    const message = await prisma.message.create({
      data: {
        applicationId,
        content,
        messageType,
        senderType: "team_member",
        senderName: session.member.name,
        isRead: true,
        attachments: {
          create: attachments.map((file: any) => ({
            fileName: file.filename || file.fileName || "未命名文件",
            fileType: messageType,
            fileSize: file.size || 0,
            mimeType: file.mimeType || "application/octet-stream",
            url: file.url,
          })),
        },
      },
      include: {
        user: true,
        application: true,
        attachments: true,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("[Team Messages POST] Error:", error);
    return NextResponse.json(
      { success: false, message: "发送消息失败" },
      { status: 500 }
    );
  }
}
