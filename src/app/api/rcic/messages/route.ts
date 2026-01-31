import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentRCIC } from '@/lib/rcic-auth';

// 获取消息列表（顾问端）
export async function GET(request: NextRequest) {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};

    if (applicationId) {
      where.applicationId = applicationId;
    }

    if (userId) {
      where.userId = userId;
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        application: {
          select: {
            id: true,
            type: true,
            typeName: true,
          },
        },
        attachments: true,
      },
    });

    // 获取未读消息数（来自用户的消息）
    const unreadCount = await prisma.message.count({
      where: {
        senderType: 'user',
        isRead: false,
        ...(applicationId ? { applicationId } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      messages: messages.reverse(),
      unreadCount,
    });
  } catch (error) {
    console.error('Get RCIC messages error:', error);
    return NextResponse.json(
      { success: false, message: '获取消息失败' },
      { status: 500 }
    );
  }
}

// 发送消息（顾问端）
export async function POST(request: NextRequest) {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { applicationId, userId, content, messageType = 'text', attachments = [] } = await request.json();

    // 必须指定用户或申请
    if (!userId && !applicationId) {
      return NextResponse.json(
        { success: false, message: '请指定消息接收者' },
        { status: 400 }
      );
    }

    // 验证消息内容
    if (messageType === 'text' && (!content || !content.trim())) {
      return NextResponse.json(
        { success: false, message: '消息内容不能为空' },
        { status: 400 }
      );
    }

    // 确定用户ID
    let targetUserId = userId;
    if (!targetUserId && applicationId) {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        select: { userId: true },
      });
      if (!application) {
        return NextResponse.json(
          { success: false, message: '申请不存在' },
          { status: 404 }
        );
      }
      targetUserId = application.userId;
    }

    // 创建消息
    const message = await prisma.message.create({
      data: {
        userId: targetUserId,
        applicationId,
        content: content?.trim() || '',
        messageType,
        senderType: 'rcic',
        senderName: rcic.name,
        senderId: rcic.id,
        attachments: {
          create: attachments.map((att: any) => ({
            fileName: att.fileName,
            fileType: att.fileType,
            fileSize: att.fileSize,
            mimeType: att.mimeType,
            url: att.url,
          })),
        },
      },
      include: {
        attachments: true,
      },
    });

    // 创建通知给用户
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'message',
        title: '收到顾问消息',
        content: `顾问 ${rcic.name} 给您发送了一条消息`,
        link: applicationId ? `/member/messages?applicationId=${applicationId}` : '/member/messages',
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send RCIC message error:', error);
    return NextResponse.json(
      { success: false, message: '发送消息失败' },
      { status: 500 }
    );
  }
}
