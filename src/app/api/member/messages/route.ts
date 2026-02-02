import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface AttachmentInput {
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

// 获取消息列表
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { userId: user.id };
    if (applicationId) where.applicationId = applicationId;

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
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

    // 获取未读消息数
    const unreadCount = await prisma.message.count({
      where: {
        userId: user.id,
        isRead: false,
        senderType: { not: 'user' },
      },
    });

    // 获取在线顾问数量
    const onlineRcicCount = await prisma.rCIC.count({
      where: { isOnline: true, isActive: true },
    });

    return NextResponse.json({
      success: true,
      messages,
      unreadCount,
      onlineRcicCount,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { success: false, message: '获取消息失败' },
      { status: 500 }
    );
  }
}

// 发送消息（支持附件）
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { applicationId, content, messageType = 'text', attachments = [] } = await request.json();

    // 验证消息内容
    if (messageType === 'text' && (!content || !content.trim())) {
      return NextResponse.json(
        { success: false, message: '消息内容不能为空' },
        { status: 400 }
      );
    }

    // 如果是文件/图片消息，必须有附件
    if ((messageType === 'image' || messageType === 'file') && attachments.length === 0) {
      return NextResponse.json(
        { success: false, message: '请上传文件' },
        { status: 400 }
      );
    }

    // 如果指定了申请，验证所有权
    if (applicationId) {
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          userId: user.id,
        },
      });

      if (!application) {
        return NextResponse.json(
          { success: false, message: '申请不存在' },
          { status: 404 }
        );
      }
    }

    // 创建消息和附件
    const message = await prisma.message.create({
      data: {
        userId: user.id,
        applicationId,
        content: content?.trim() || '',
        messageType,
        senderType: 'user',
        senderName: user.name || user.email,
        attachments: {
          create: attachments.map((att: AttachmentInput) => ({
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

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, message: '发送消息失败' },
      { status: 500 }
    );
  }
}
