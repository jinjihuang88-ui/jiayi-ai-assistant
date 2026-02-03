// src/app/api/admin/rcic/approve/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { rcicId, action, notes, adminId } = await request.json();

    // 验证必填字段
    if (!rcicId || !action || !adminId) {
      return NextResponse.json(
        { error: '顾问ID、操作和管理员ID不能为空' },
        { status: 400 }
      );
    }

    // 验证操作类型
    if (!['approve', 'reject', 'suspend'].includes(action)) {
      return NextResponse.json(
        { error: '操作类型必须为 approve、reject 或 suspend' },
        { status: 400 }
      );
    }

    // 查找顾问
    const rcic = await prisma.rCIC.findUnique({
      where: { id: rcicId },
    });

    if (!rcic) {
      return NextResponse.json(
        { error: '顾问不存在' },
        { status: 404 }
      );
    }

    // 检查邮箱是否已验证
    if (!rcic.emailVerified) {
      return NextResponse.json(
        { error: '顾问邮箱未验证' },
        { status: 400 }
      );
    }

    let approvalStatus: string;
    let approvedAt: Date | null = null;
    let nextReviewDate: Date | null = null;

    switch (action) {
      case 'approve':
        approvalStatus = 'approved';
        approvedAt = new Date();
        
        // 如果是A类顾问，设置下次审核日期（6个月后）
        if (rcic.consultantType === 'A') {
          nextReviewDate = new Date();
          nextReviewDate.setMonth(nextReviewDate.getMonth() + 6);
        }
        break;
      
      case 'reject':
        approvalStatus = 'rejected';
        break;
      
      case 'suspend':
        approvalStatus = 'suspended';
        break;
      
      default:
        approvalStatus = rcic.approvalStatus;
    }

    // 更新顾问状态
    const updatedRCIC = await prisma.rCIC.update({
      where: { id: rcicId },
      data: {
        approvalStatus,
        approvalNotes: notes || null,
        approvedAt,
        approvedBy: adminId,
        lastReviewDate: new Date(),
        nextReviewDate,
      },
    });

    // TODO: 发送审核结果通知邮件

    return NextResponse.json({
      message: `顾问审核${action === 'approve' ? '通过' : action === 'reject' ? '拒绝' : '暂停'}`,
      rcic: {
        id: updatedRCIC.id,
        name: updatedRCIC.name,
        email: updatedRCIC.email,
        consultantType: updatedRCIC.consultantType,
        approvalStatus: updatedRCIC.approvalStatus,
        approvedAt: updatedRCIC.approvedAt,
        nextReviewDate: updatedRCIC.nextReviewDate,
      },
    });
  } catch (error) {
    console.error('RCIC approval error:', error);
    return NextResponse.json(
      { error: '审核操作失败，请稍后重试' },
      { status: 500 }
    );
  }
}
