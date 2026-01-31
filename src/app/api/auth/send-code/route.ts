import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVerificationCode, isValidEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 验证邮箱格式
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 检查是否在1分钟内已发送过验证码
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // 1分钟内
        },
      },
    });

    if (recentCode) {
      return NextResponse.json(
        { success: false, message: '请稍后再试，验证码发送过于频繁' },
        { status: 429 }
      );
    }

    // 生成验证码
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟有效期

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 保存验证码
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        type: user ? 'login' : 'register',
        expiresAt,
        userId: user?.id,
      },
    });

    // TODO: 实际发送邮件
    // 目前返回验证码用于测试（生产环境应移除）
    console.log(`[DEV] 验证码: ${code} 发送到 ${email}`);

    return NextResponse.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      // 开发模式下返回验证码，生产环境应移除
      devCode: process.env.NODE_ENV === 'development' ? code : undefined,
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json(
      { success: false, message: '发送验证码失败，请稍后重试' },
      { status: 500 }
    );
  }
}
