import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 获取通知列表
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: any = { userId: user.id };
    if (unreadOnly) where.isRead = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // 获取未读数量
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, message: '获取通知失败' },
      { status: 500 }
    );
  }
}

// 标记通知为已读
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { notificationIds, all } = await request.json();

    const where: any = {
      userId: user.id,
      isRead: false,
    };

    if (notificationIds && notificationIds.length > 0) {
      where.id = { in: notificationIds };
    } else if (!all) {
      return NextResponse.json(
        { success: false, message: '请指定要标记的通知' },
        { status: 400 }
      );
    }

    await prisma.notification.updateMany({
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
    console.error('Mark notifications read error:', error);
    return NextResponse.json(
      { success: false, message: '操作失败' },
      { status: 500 }
    );
  }
}

// 删除通知
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const deleteAll = searchParams.get('all') === 'true';

    if (notificationId) {
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId: user.id,
        },
      });
    } else if (deleteAll) {
      await prisma.notification.deleteMany({
        where: {
          userId: user.id,
          isRead: true,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: '请指定要删除的通知' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 }
    );
  }
}
