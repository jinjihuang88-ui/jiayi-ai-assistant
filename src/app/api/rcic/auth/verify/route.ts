import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: '验证token缺失' },
        { status: 400 }
      );
    }

    // 查找token对应的RCIC
    const rcic = await prisma.rCIC.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gte: new Date(), // token未过期
        },
      },
    });

    if (!rcic) {
      return NextResponse.json(
        { success: false, message: '验证链接无效或已过期' },
        { status: 400 }
      );
    }

    // 更新RCIC为已验证
    await prisma.rCIC.update({
      where: { id: rcic.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    console.log('[RCIC Verify] Email verified for:', rcic.email);

    return NextResponse.json({
      success: true,
      message: '邮箱验证成功！您的申请已提交审核。',
    });
  } catch (error) {
    console.error('[RCIC Verify] Error:', error);
    return NextResponse.json(
      { success: false, message: '验证失败，请稍后重试' },
      { status: 500 }
    );
  }
}
