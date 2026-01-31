import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 标记消息为已读
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { messageIds, applicationId, all } = await request.json();

    const where: any = {
      userId: user.id,
      isRead: false,
      senderType: { not: 'user' },
    };

    if (messageIds && messageIds.length > 0) {
      where.id = { in: messageIds };
    } else if (applicationId) {
      where.applicationId = applicationId;
    } else if (!all) {
      return NextResponse.json(
        { success: false, message: '请指定要标记的消息' },
        { status: 400 }
      );
    }

    await prisma.message.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: '已标记为已读',
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    return NextResponse.json(
      { success: false, message: '操作失败' },
      { status: 500 }
    );
  }
}
