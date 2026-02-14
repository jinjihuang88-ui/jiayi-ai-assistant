// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { notifyWechatNewUser } from '@/lib/wechat';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, phone } = await request.json();

    // 验证必填字段
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: '邮箱、姓名和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度（至少8位）
    if (password.length < 8) {
      return NextResponse.json(
        { error: '密码长度至少为8位' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone: phone || null,
        emailVerified: false,
      },
    });

    // 生成验证令牌
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    // 保存验证令牌
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        type: 'email_verification',
        expiresAt,
      },
    });

    // 发送验证邮件
    const emailResult = await sendVerificationEmail(email, token);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // 即使邮件发送失败，用户也已创建成功
    }

    // 新用户注册通知到微信群（失败不影响注册，仅打日志便于排查）
    const wechatResult = await notifyWechatNewUser({ email, name, phone: phone || null });
    if (wechatResult.success) {
      console.log('[WeChat] 新会员注册通知已发送:', email);
    } else {
      console.warn('[WeChat] 新会员注册通知未发送:', wechatResult.error, 'email:', email);
    }

    return NextResponse.json({
      message: '注册成功！请查收验证邮件以激活账户',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
