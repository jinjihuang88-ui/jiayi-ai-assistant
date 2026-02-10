import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('[Assign Consultant] API called'); // 调试日志
    // 验证用户登录
    const user = await getCurrentUser();
    console.log('[Assign Consultant] Current user:', user?.id, user?.email); // 调试日志
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { consultantId, caseId } = await request.json();
    console.log('[Assign Consultant] Consultant ID:', consultantId, 'Case ID:', caseId); // 调试日志

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

    // 放宽限制，允许选择任何激活的顾问
    if (!consultant.isActive) {
      return NextResponse.json(
        { success: false, message: '该顾问账号已停用' },
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
        consultant: {
          id: consultant.id,
          name: consultant.name,
          email: consultant.email,
          avatar: consultant.avatar || consultant.profilePhoto,
          consultantType: consultant.consultantType,
        },
      });
    } else {
      // 没有指定案件，直接将顾问分配给用户（用于咨询）
      // 已签约用户不可再选其他顾问，需先取消合约
      const contractedCase = await prisma.case.findFirst({
        where: { userId: user.id, contractedAt: { not: null } },
      });
      if (contractedCase) {
        return NextResponse.json(
          {
            success: false,
            message: '您已与顾问签约，无法更换顾问。如需更换请先取消合约。',
          },
          { status: 400 }
        );
      }

      console.log('[Assign Consultant] Assigning consultant to user...'); // 调试日志
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { assignedRcicId: consultantId },
      });
      console.log('[Assign Consultant] User updated:', updatedUser.id, updatedUser.assignedRcicId); // 调试日志

      // 同时更新用户的所有未分配案件
      await prisma.case.updateMany({
        where: {
          userId: user.id,
          rcicId: null,
        },
        data: { rcicId: consultantId },
      });

      return NextResponse.json({
        success: true,
        message: '顾问分配成功，现在可以开始咨询了',
        consultant: {
          id: consultant.id,
          name: consultant.name,
          email: consultant.email,
          avatar: consultant.avatar || consultant.profilePhoto,
          consultantType: consultant.consultantType,
          organization: consultant.organization,
          isOnline: consultant.isOnline,
        },
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
