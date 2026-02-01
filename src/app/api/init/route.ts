import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 默认测试顾问列表
const DEFAULT_RCICS = [
  {
    email: 'rcic@example.com',
    name: '张顾问',
    licenseNo: 'R123456',
    phone: '+1 604-123-4567',
  },
  {
    email: 'consultant@example.com',
    name: '李移民',
    licenseNo: 'R789012',
    phone: '+1 416-987-6543',
  },
];

export async function GET() {
  try {
    // 检查数据库连接
    await prisma.$connect();

    // 创建默认顾问
    const results = [];
    for (const rcicData of DEFAULT_RCICS) {
      try {
        const rcic = await prisma.rCIC.upsert({
          where: { email: rcicData.email },
          update: {},
          create: {
            ...rcicData,
            isActive: true,
            isOnline: false,
          },
        });
        results.push({ email: rcic.email, status: 'created/exists' });
      } catch (error) {
        results.push({ email: rcicData.email, status: 'failed', error: String(error) });
      }
    }

    // 统计数据
    const userCount = await prisma.user.count();
    const rcicCount = await prisma.rCIC.count();
    const applicationCount = await prisma.application.count();

    return NextResponse.json({
      success: true,
      message: '数据库初始化完成',
      stats: {
        users: userCount,
        rcics: rcicCount,
        applications: applicationCount,
      },
      rcicResults: results,
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '数据库初始化失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
