import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    // 获取所有持牌顾问（consultantType = 'A'）且已审核通过的顾问
    const consultants = await prisma.rCIC.findMany({
      where: {
        consultantType: 'A', // 只显示持牌顾问
        approvalStatus: 'approved', // 只显示已审核通过的
        isActive: true, // 账号激活状态
        licenseVerified: true, // 执照已验证
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        profilePhoto: true,
        licenseNumber: true,
        yearsOfExperience: true,
        country: true,
        city: true,
        organization: true,
        bio: true,
        specialties: true,
        serviceRegions: true,
        successRate: true,
        totalCases: true,
        successfulCases: true,
        averageRating: true,
        totalReviews: true,
        languages: true,
        certifications: true,
        isAcceptingCases: true,
        isOnline: true,
        lastActiveAt: true,
      },
      orderBy: [
        { isOnline: 'desc' }, // 在线的排前面
        { averageRating: 'desc' }, // 评分高的排前面
        { successRate: 'desc' }, // 成功率高的排前面
      ],
    });

    // 解析JSON字段
    const formattedConsultants = consultants.map(consultant => ({
      ...consultant,
      specialties: consultant.specialties ? JSON.parse(consultant.specialties) : [],
      serviceRegions: consultant.serviceRegions ? JSON.parse(consultant.serviceRegions) : [],
      languages: consultant.languages ? JSON.parse(consultant.languages) : [],
      certifications: consultant.certifications ? JSON.parse(consultant.certifications) : [],
    }));

    return NextResponse.json({
      success: true,
      consultants: formattedConsultants,
    });
  } catch (error) {
    console.error('[Member Consultants] Error:', error);
    return NextResponse.json(
      { success: false, message: '获取顾问列表失败' },
      { status: 500 }
    );
  }
}
