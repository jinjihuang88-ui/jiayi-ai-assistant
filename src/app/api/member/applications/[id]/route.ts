import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 获取单个申请详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const application = await prisma.application.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: '申请不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        formData: JSON.parse(application.formData || '{}'),
      },
    });
  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { success: false, message: '获取申请详情失败' },
      { status: 500 }
    );
  }
}

// 更新申请（保存草稿或修改）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { formData, action } = await request.json();

    // 验证申请所有权
    const application = await prisma.application.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: '申请不存在' },
        { status: 404 }
      );
    }

    // 检查状态是否允许修改
    if (!['draft', 'needs_revision'].includes(application.status)) {
      return NextResponse.json(
        { success: false, message: '当前状态不允许修改' },
        { status: 400 }
      );
    }

    const updateData: any = {
      formData: JSON.stringify(formData),
      updatedAt: new Date(),
    };

    // 如果是提交操作
    if (action === 'submit') {
      updateData.status = 'submitted';
      updateData.submittedAt = new Date();

      // 记录状态变更
      await prisma.statusHistory.create({
        data: {
          applicationId: params.id,
          fromStatus: application.status,
          toStatus: 'submitted',
          changedBy: 'user',
          comment: application.status === 'needs_revision' ? '修改后重新提交' : '首次提交',
        },
      });

      // 创建通知
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'status_change',
          title: '申请已提交',
          content: `您的${application.typeName}申请已成功提交，我们的移民顾问将尽快审核。`,
          link: `/member/applications/${params.id}`,
        },
      });
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: action === 'submit' ? '申请已提交' : '保存成功',
      application: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { success: false, message: '更新申请失败' },
      { status: 500 }
    );
  }
}

// 删除申请（仅草稿可删除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const application = await prisma.application.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: '申请不存在' },
        { status: 404 }
      );
    }

    if (application.status !== 'draft') {
      return NextResponse.json(
        { success: false, message: '只能删除草稿状态的申请' },
        { status: 400 }
      );
    }

    await prisma.application.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: '申请已删除',
    });
  } catch (error) {
    console.error('Delete application error:', error);
    return NextResponse.json(
      { success: false, message: '删除申请失败' },
      { status: 500 }
    );
  }
}
