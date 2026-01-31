import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentRCIC } from '@/lib/rcic-auth';

// 获取案件列表
export async function GET(request: NextRequest) {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {
      status: { in: ['submitted', 'under_review', 'needs_revision'] },
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // 获取案件总数
    const total = await prisma.application.count({ where });

    // 获取案件列表
    const applications = await prisma.application.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        documents: true,
        _count: {
          select: {
            messages: {
              where: {
                senderType: 'user',
                isRead: false,
              },
            },
          },
        },
      },
    });

    // 统计数据
    const stats = {
      pending: await prisma.application.count({ where: { status: 'submitted' } }),
      underReview: await prisma.application.count({ where: { status: 'under_review' } }),
      needsRevision: await prisma.application.count({ where: { status: 'needs_revision' } }),
      approved: await prisma.application.count({ where: { status: 'approved' } }),
    };

    return NextResponse.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json(
      { success: false, message: '获取案件失败' },
      { status: 500 }
    );
  }
}
