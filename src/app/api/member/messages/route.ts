import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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

    return NextResponse.json({
      success: true,
      messages,
      unreadCount,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { success: false, message: '获取消息失败' },
      { status: 500 }
    );
  }
}

// 发送消息
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { applicationId, content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: '消息内容不能为空' },
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

    const message = await prisma.message.create({
      data: {
        userId: user.id,
        applicationId,
        content: content.trim(),
        senderType: 'user',
        senderName: user.name || user.email,
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
