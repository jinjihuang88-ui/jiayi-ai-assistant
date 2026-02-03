import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 获取顾问在线状态
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    // 获取在线顾问列表
    const onlineRcics = await prisma.rCIC.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        lastLoginAt: true,
      },
    });

    // 获取所有活跃顾问数量
    const totalActiveRcics = await prisma.rCIC.count({
      where: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      onlineCount: onlineRcics.length,
      totalCount: totalActiveRcics,
      onlineRcics,
    });
  } catch (error) {
    console.error('Get RCIC status error:', error);
    return NextResponse.json(
      { success: false, message: '获取顾问状态失败' },
      { status: 500 }
    );
  }
}