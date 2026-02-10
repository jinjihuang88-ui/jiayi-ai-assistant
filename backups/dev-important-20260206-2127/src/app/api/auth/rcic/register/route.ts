// src/app/api/auth/rcic/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      name,
      password,
      phone,
      consultantType, // A, B, or C
      licenseNumber,
      yearsOfExperience,
      country,
      city,
      organization,
      bio,
    } = await request.json();

    // 验证必填字段
    if (!email || !name || !password || !consultantType) {
      return NextResponse.json(
        { error: '邮箱、姓名、密码和顾问类型不能为空' },
        { status: 400 }
      );
    }

    // 验证顾问类型
    if (!['A', 'B', 'C'].includes(consultantType)) {
      return NextResponse.json(
        { error: '顾问类型必须为 A、B 或 C' },
        { status: 400 }
      );
    }

    // A类顾问必须提供执照编号
    if (consultantType === 'A' && !licenseNumber) {
      return NextResponse.json(
        { error: 'A类顾问必须提供 RCIC 执照编号' },
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

    // 验证密码强度
    if (password.length < 8) {
      return NextResponse.json(
        { error: '密码长度至少为8位' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingRCIC = await prisma.rCIC.findUnique({
      where: { email },
    });

    if (existingRCIC) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建顾问账户
    const rcic = await prisma.rCIC.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone: phone || null,
        consultantType,
        licenseNumber: licenseNumber || null,
        yearsOfExperience: yearsOfExperience || null,
        country: country || null,
        city: city || null,
        organization: organization || null,
        bio: bio || null,
        emailVerified: false,
        approvalStatus: 'pending', // 待审核
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
    }

    return NextResponse.json({
      message: '注册成功！请查收验证邮件，验证后需等待平台审核',
      rcic: {
        id: rcic.id,
        email: rcic.email,
        name: rcic.name,
        consultantType: rcic.consultantType,
        approvalStatus: rcic.approvalStatus,
      },
    });
  } catch (error) {
    console.error('RCIC registration error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
