// src/app/api/auth/send-verification/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '邮箱地址不能为空' },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查用户是否已验证
    if (user.emailVerified) {
      return NextResponse.json(
        { error: '邮箱已验证' },
        { status: 400 }
      );
    }

    // 删除该邮箱的旧验证令牌
    await prisma.verificationToken.deleteMany({
      where: {
        email,
        type: 'email_verification',
      },
    });

    // 生成新的验证令牌
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    // 保存令牌到数据库
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        type: 'email_verification',
        expiresAt,
      },
    });

    // 发送验证邮件
    const result = await sendVerificationEmail(email, token);

    if (!result.success) {
      // 如果发送失败，删除令牌
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: '发送验证邮件失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '验证邮件已发送，请查收邮箱',
      success: true,
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
