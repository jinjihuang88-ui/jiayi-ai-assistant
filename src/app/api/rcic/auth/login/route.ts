import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { createRCICSession, generateVerificationCode } from '@/lib/rcic-auth';

const RCIC_SESSION_COOKIE = 'rcic_session_token';

// 发送验证码
export async function POST(request: NextRequest) {
  try {
    const { email, code, step } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: '请输入邮箱' },
        { status: 400 }
      );
    }

    // 检查顾问是否存在
    const rcic = await prisma.rCIC.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!rcic) {
      return NextResponse.json(
        { success: false, message: '该邮箱未注册为移民顾问' },
        { status: 404 }
      );
    }

    if (!rcic.isActive) {
      return NextResponse.json(
        { success: false, message: '该账户已被禁用' },
        { status: 403 }
      );
    }

    // Step 1: 发送验证码
    if (step === 'send_code') {
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // 保存验证码
      await prisma.rCICVerificationCode.create({
        data: {
          rcicId: rcic.id,
          email: email.toLowerCase(),
          code: verificationCode,
          expiresAt,
        },
      });

      // 在开发环境下直接返回验证码（生产环境应发送邮件）
      console.log(`RCIC Verification code for ${email}: ${verificationCode}`);

      return NextResponse.json({
        success: true,
        message: '验证码已发送',
        // 开发环境返回验证码，生产环境删除此行
        devCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
      });
    }

    // Step 2: 验证验证码并登录
    if (step === 'verify') {
      if (!code) {
        return NextResponse.json(
          { success: false, message: '请输入验证码' },
          { status: 400 }
        );
      }

      // 查找有效的验证码
      const verification = await prisma.rCICVerificationCode.findFirst({
        where: {
          email: email.toLowerCase(),
          code,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!verification) {
        return NextResponse.json(
          { success: false, message: '验证码无效或已过期' },
          { status: 400 }
        );
      }

      // 标记验证码为已使用
      await prisma.rCICVerificationCode.update({
        where: { id: verification.id },
        data: { used: true },
      });

      // 创建会话
      const userAgent = request.headers.get('user-agent') || undefined;
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
      const { token, expiresAt } = await createRCICSession(rcic.id, userAgent, ipAddress);

      // 设置 cookie
      const cookieStore = await cookies();
      cookieStore.set(RCIC_SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });

      return NextResponse.json({
        success: true,
        message: '登录成功',
        rcic: {
          id: rcic.id,
          email: rcic.email,
          name: rcic.name,
          licenseNo: rcic.licenseNo,
          avatar: rcic.avatar,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: '无效的请求' },
      { status: 400 }
    );
  } catch (error) {
    console.error('RCIC login error:', error);
    return NextResponse.json(
      { success: false, message: '登录失败' },
      { status: 500 }
    );
  }
}
