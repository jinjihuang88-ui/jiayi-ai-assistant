import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const rcicSession = cookieStore.get("rcic_session_token")?.value;
    const teamSession = cookieStore.get("team_member_session_token")?.value;

    let currentUserId: string;
    let currentUserType: "rcic" | "team_member";

    // 验证session
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
    } else if (teamSession) {
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

    const body = await request.json();
    const {
      receiverId,
      receiverType,
      content,
      messageType = "text",
      fileUrl,
      fileName,
      fileSize,
      fileMimeType,
    } = body;

    if (!receiverId || !receiverType) {
      return NextResponse.json(
        { success: false, error: "接收者信息不完整" },
        { status: 400 }
      );
    }

    if (!content && !fileUrl) {
      return NextResponse.json(
        { success: false, error: "消息内容不能为空" },
        { status: 400 }
      );
    }

    // 查找或创建对话
    const participant1Id =
      currentUserId < receiverId ? currentUserId : receiverId;
    const participant1Type =
      currentUserId < receiverId ? currentUserType : receiverType;
    const participant2Id =
      currentUserId < receiverId ? receiverId : currentUserId;
    const participant2Type =
      currentUserId < receiverId ? receiverType : currentUserType;

    let conversation = await prisma.internalConversation.findFirst({
      where: {
        participant1Id,
        participant2Id,
      },
    });

    if (!conversation) {
      conversation = await prisma.internalConversation.create({
        data: {
          participant1Id,
          participant1Type,
          participant2Id,
          participant2Type,
          lastMessageAt: new Date(),
          lastMessageContent: content || "发送了一个文件",
        },
      });
    } else {
      // 更新对话的最后消息时间
      await prisma.internalConversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          lastMessageContent: content || "发送了一个文件",
        },
      });
    }

    // 创建消息
    const message = await prisma.internalMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: currentUserId,
        senderType: currentUserType,
        receiverId,
        receiverType,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        fileMimeType,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("发送消息失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 获取对话消息
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const rcicSession = cookieStore.get("rcic_session_token")?.value;
    const teamSession = cookieStore.get("team_member_session_token")?.value;

    let currentUserId: string;
    let currentUserType: "rcic" | "team_member";

    // 验证session
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
    } else if (teamSession) {
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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "对话ID不能为空" },
        { status: 400 }
      );
    }

    // 获取消息列表
    const messages = await prisma.internalMessage.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // 标记所有未读消息为已读
    await prisma.internalMessage.updateMany({
      where: {
        conversationId,
        receiverId: currentUserId,
        receiverType: currentUserType,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("获取消息列表失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
