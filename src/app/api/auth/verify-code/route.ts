import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSession, isValidEmail } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // 验证输入
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { success: false, message: '请输入6位验证码' },
        { status: 400 }
      );
    }

    // 查找验证码
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, message: '验证码无效或已过期' },
        { status: 400 }
      );
    }

    // 标记验证码已使用
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // 新用户注册
      user = await prisma.user.create({
        data: {
          email,
          profile: {
            create: {},
          },
        },
      });
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 创建会话
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const session = await createSession(user.id, userAgent, ipAddress);

    // 设置Cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: session.expiresAt,
      path: '/',
    });

    // 创建欢迎通知（新用户）
    if (verificationCode.type === 'register') {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'system',
          title: '欢迎加入加移AI助理',
          content: '感谢您注册加移AI助理！您可以开始填写移民申请表格，我们的AI助手和持牌移民顾问将全程为您服务。',
          link: '/member',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: verificationCode.type === 'register' ? '注册成功' : '登录成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { success: false, message: '验证失败，请稍后重试' },
      { status: 500 }
    );
  }
}
