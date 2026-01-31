import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentRCIC } from '@/lib/rcic-auth';

// 标记消息为已读（顾问端）
export async function POST(request: NextRequest) {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { applicationId, userId, messageId } = await request.json();

    const where: any = {
      senderType: 'user',
      isRead: false,
    };

    if (applicationId) {
      where.applicationId = applicationId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (messageId) {
      where.id = messageId;
    }

    await prisma.message.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark RCIC messages read error:', error);
    return NextResponse.json(
      { success: false, message: '操作失败' },
      { status: 500 }
    );
  }
}
