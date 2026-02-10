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

    // 获取caseId
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json(
        { success: false, message: "缺少caseId参数" },
        { status: 400 }
      );
    }

    // 验证案件是否属于该团队成员的RCIC
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData || caseData.rcicId !== member.rcicId) {
      return NextResponse.json(
        { success: false, message: "无权访问该案件" },
        { status: 403 }
      );
    }

    // 获取消息列表
    const messages = await prisma.message.findMany({
      where: { caseId },
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

    const body = await request.json();
    const { caseId, content, fileUrl, fileName, fileType } = body;

    if (!caseId || !content) {
      return NextResponse.json(
        { success: false, message: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 验证案件是否属于该团队成员的RCIC
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData || caseData.rcicId !== member.rcicId) {
      return NextResponse.json(
        { success: false, message: "无权访问该案件" },
        { status: 403 }
      );
    }

    // 准备附件数据
    let attachments = null;
    if (fileUrl) {
      attachments = JSON.stringify([
        {
          url: fileUrl,
          name: fileName || "未命名文件",
          type: fileType || "file",
        },
      ]);
    }

    // 创建消息（使用rcicId作为senderId，senderType为rcic）
    const message = await prisma.message.create({
      data: {
        caseId,
        senderId: member.rcicId, // 使用RCIC的ID作为发送者
        senderType: "rcic", // 团队成员代表RCIC发送
        content,
        attachments,
        read: true, // 自己发送的消息标记为已读
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
