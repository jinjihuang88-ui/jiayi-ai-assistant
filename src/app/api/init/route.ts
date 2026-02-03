import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

// 默认测试顾问列表
const DEFAULT_RCICS = [
  {
    email: 'rcic@example.com',
    password: 'password123',
    name: '张顾问',
    nameEn: 'Zhang Consultant',
    licenseNo: 'R123456',
    phone: '+1 604-123-4567',
    idDocumentUrl: '/uploads/default-id.jpg',
    country: 'Canada',
    city: 'Vancouver',
    level: 'A',
    organization: 'ABC Immigration Services',
    verificationLink: 'https://college-ic.ca/protecting-the-public/find-an-immigration-consultant',
    licenseCertificateUrl: '/uploads/default-license.jpg',
  },
  {
    email: 'consultant@example.com',
    password: 'password123',
    name: '李移民',
    nameEn: 'Li Immigration',
    phone: '+1 416-987-6543',
    idDocumentUrl: '/uploads/default-id.jpg',
    country: 'Canada',
    city: 'Toronto',
    level: 'B',
    yearsOfExperience: '5-10年',
    serviceScope: '留学申请、学签续签、工签申请',
    pastCases: '成功办理超过500个留学案例',
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
            verificationStatus: 'approved',
            isActive: true,
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