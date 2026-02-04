import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { consultantId, caseId } = await request.json();

    if (!consultantId) {
      return NextResponse.json(
        { success: false, message: '请选择顾问' },
        { status: 400 }
      );
    }

    // 验证顾问是否存在且可用
    const consultant = await prisma.rCIC.findUnique({
      where: { id: consultantId },
    });

    if (!consultant) {
      return NextResponse.json(
        { success: false, message: '顾问不存在' },
        { status: 404 }
      );
    }

    if (consultant.consultantType !== 'A') {
      return NextResponse.json(
        { success: false, message: '只能选择持牌顾问' },
        { status: 400 }
      );
    }

    if (consultant.approvalStatus !== 'approved') {
      return NextResponse.json(
        { success: false, message: '该顾问未通过审核' },
        { status: 400 }
      );
    }

    if (!consultant.isAcceptingCases) {
      return NextResponse.json(
        { success: false, message: '该顾问暂不接收新案件' },
        { status: 400 }
      );
    }

    // 如果指定了案件ID，分配到该案件
    if (caseId) {
      // 验证案件是否属于该用户
      const existingCase = await prisma.case.findFirst({
        where: {
          id: caseId,
          userId: user.id,
        },
      });

      if (!existingCase) {
        return NextResponse.json(
          { success: false, message: '案件不存在或无权访问' },
          { status: 404 }
        );
      }

      // 更新案件的顾问
      await prisma.case.update({
        where: { id: caseId },
        data: { rcicId: consultantId },
      });

      return NextResponse.json({
        success: true,
        message: '顾问分配成功',
        case: existingCase,
      });
    } else {
      // 如果没有指定案件，将顾问分配给用户的所有未分配案件
      const unassignedCases = await prisma.case.findMany({
        where: {
          userId: user.id,
          rcicId: null,
        },
      });

      if (unassignedCases.length === 0) {
        return NextResponse.json(
          { success: false, message: '没有需要分配的案件' },
          { status: 400 }
        );
      }

      // 批量更新
      await prisma.case.updateMany({
        where: {
          userId: user.id,
          rcicId: null,
        },
        data: { rcicId: consultantId },
      });

      return NextResponse.json({
        success: true,
        message: `已将 ${unassignedCases.length} 个案件分配给顾问`,
        assignedCount: unassignedCases.length,
      });
    }
  } catch (error) {
    console.error('[Assign Consultant] Error:', error);
    return NextResponse.json(
      { success: false, message: '分配顾问失败' },
      { status: 500 }
    );
  }
}
