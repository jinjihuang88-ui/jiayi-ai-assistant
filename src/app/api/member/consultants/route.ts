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

    // 获取所有顾问，优先显示持牌顾问
    const consultants = await prisma.rCIC.findMany({
      where: {
        // 只要求账号激活，其他条件放宽
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        profilePhoto: true,
        consultantType: true,
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
        approvalStatus: true,
        licenseVerified: true,
      },
      orderBy: [
        { consultantType: 'asc' }, // A类（持牌顾问）排前面
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
      // 添加类型标签
      typeLabel: consultant.consultantType === 'A' ? '持牌顾问' : 
                 consultant.consultantType === 'B' ? '留学顾问' : '文案辅助',
      // 添加状态标签
      statusLabel: consultant.approvalStatus === 'approved' ? '已认证' :
                   consultant.approvalStatus === 'under_review' ? '审核中' :
                   consultant.approvalStatus === 'pending' ? '待审核' : '未认证',
    }));

    return NextResponse.json({
      success: true,
      consultants: formattedConsultants,
      total: formattedConsultants.length,
    });
  } catch (error) {
    console.error('[Member Consultants] Error:', error);
    return NextResponse.json(
      { success: false, message: '获取顾问列表失败' },
      { status: 500 }
    );
  }
}
