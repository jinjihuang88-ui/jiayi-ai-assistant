import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentRCIC } from '@/lib/rcic-auth';

// 获取案件详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            avatar: true,
            profile: true,
          },
        },
        documents: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            attachments: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: '案件不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Get case detail error:', error);
    return NextResponse.json(
      { success: false, message: '获取案件详情失败' },
      { status: 500 }
    );
  }
}

// 更新案件审核状态
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { status, comment, fieldReviews } = await request.json();

    // 验证状态值
    const validStatuses = ['under_review', 'needs_revision', 'approved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: '无效的状态值' },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: '案件不存在' },
        { status: 404 }
      );
    }

    // 更新申请
    const updateData: any = {
      rcicId: rcic.id,
      rcicName: rcic.name,
      rcicReviewedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    if (comment) {
      updateData.rcicComment = comment;
    }

    // 如果有字段审核数据，合并到 formData
    if (fieldReviews) {
      const formData = JSON.parse(application.formData || '{}');
      formData._rcicReviews = fieldReviews;
      updateData.formData = JSON.stringify(formData);
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
    });

    // 记录状态变更历史
    if (status && status !== application.status) {
      await prisma.statusHistory.create({
        data: {
          applicationId: id,
          fromStatus: application.status,
          toStatus: status,
          comment: comment || `顾问 ${rcic.name} 审核`,
          changedBy: 'rcic',
        },
      });

      // 创建通知给用户
      const notificationTitle = status === 'approved' 
        ? '申请已通过审核' 
        : status === 'needs_revision'
        ? '申请需要修改'
        : '申请状态更新';

      await prisma.notification.create({
        data: {
          userId: application.userId,
          type: 'status_change',
          title: notificationTitle,
          content: comment || `您的${application.typeName}申请状态已更新`,
          link: `/member/applications/${id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Update case error:', error);
    return NextResponse.json(
      { success: false, message: '更新案件失败' },
      { status: 500 }
    );
  }
}
