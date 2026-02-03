import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

// 默认测试顾问列表
const DEFAULT_RCICS = [
  {
    email: 'rcic@example.com',
    password: 'password123',
    name: '张顾问',
    phone: '+1 604-123-4567',
    consultantType: 'A',
    licenseNumber: 'R123456',
    licenseVerified: true,
    approvalStatus: 'approved',
    emailVerified: true,
    country: 'Canada',
    city: 'Vancouver',
    organization: 'ABC Immigration Services',
    idDocument: '/uploads/default-id.jpg',
    licenseDocument: '/uploads/default-license.jpg',
  },
  {
    email: 'consultant@example.com',
    password: 'password123',
    name: '李移民',
    phone: '+1 416-987-6543',
    consultantType: 'B',
    yearsOfExperience: 7,
    approvalStatus: 'approved',
    emailVerified: true,
    country: 'Canada',
    city: 'Toronto',
    idDocument: '/uploads/default-id.jpg',
    experienceProof: '/uploads/default-experience.jpg',
    bio: '专注留学申请、学签续签、工签申请，成功办理超过500个留学案例',
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
        // 加密密码
        const hashedPassword = await bcrypt.hash(rcicData.password, 10);
        
        const rcic = await prisma.rCIC.upsert({
          where: { email: rcicData.email },
          update: {},
          create: {
            ...rcicData,
            password: hashedPassword,
            emailVerifiedAt: new Date(),
            approvedAt: new Date(),
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

    return NextResponse.json({
      success: true,
      message: '数据库初始化完成',
      stats: {
        users: userCount,
        rcics: rcicCount,
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
