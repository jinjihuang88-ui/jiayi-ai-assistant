// src/app/api/auth/verify-email/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: '验证令牌缺失' },
        { status: 400 }
      );
    }

    // 查找验证令牌
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: '无效的验证令牌' },
        { status: 400 }
      );
    }

    // 检查令牌是否过期
    if (verificationToken.expiresAt < new Date()) {
      // 删除过期令牌
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        { error: '验证令牌已过期，请重新发送验证邮件' },
        { status: 400 }
      );
    }

    // 检查令牌类型
    if (verificationToken.type !== 'email_verification') {
      return NextResponse.json(
        { error: '令牌类型不匹配' },
        { status: 400 }
      );
    }

    const email = verificationToken.email;

    // 尝试查找用户或顾问
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const rcic = await prisma.rCIC.findUnique({
      where: { email },
    });

    if (!user && !rcic) {
      return NextResponse.json(
        { error: '账户不存在' },
        { status: 404 }
      );
    }

    // 更新邮箱验证状态
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      // 发送欢迎邮件
      await sendWelcomeEmail(user.email, user.name);

      // 删除已使用的令牌
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json({
        message: '邮箱验证成功！现在可以登录了',
        success: true,
        userType: 'user',
      });
    }

    if (rcic) {
      await prisma.rCIC.update({
        where: { id: rcic.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          // 邮箱验证后，将状态从 pending 改为 under_review
          approvalStatus: rcic.approvalStatus === 'pending' ? 'under_review' : rcic.approvalStatus,
        },
      });

      // 删除已使用的令牌
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json({
        message: '邮箱验证成功！您的账户正在审核中，请耐心等待',
        success: true,
        userType: 'rcic',
        approvalStatus: 'under_review',
      });
    }

    return NextResponse.json(
      { error: '验证失败' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
