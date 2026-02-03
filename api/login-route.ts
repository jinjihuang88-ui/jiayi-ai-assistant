// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json();

    // 验证必填字段
    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: '邮箱、密码和用户类型不能为空' },
        { status: 400 }
      );
    }

    // 验证用户类型
    if (!['user', 'rcic'].includes(userType)) {
      return NextResponse.json(
        { error: '用户类型必须为 user 或 rcic' },
        { status: 400 }
      );
    }

    let account;
    let accountType;

    // 根据用户类型查找账户
    if (userType === 'user') {
      account = await prisma.user.findUnique({
        where: { email },
      });
      accountType = 'user';
    } else {
      account = await prisma.rCIC.findUnique({
        where: { email },
      });
      accountType = 'rcic';
    }

    // 检查账户是否存在
    if (!account) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 检查邮箱是否已验证
    if (!account.emailVerified) {
      return NextResponse.json(
        { error: '请先验证邮箱后再登录' },
        { status: 403 }
      );
    }

    // 如果是顾问，检查审核状态
    if (accountType === 'rcic') {
      if (account.approvalStatus === 'pending') {
        return NextResponse.json(
          { error: '您的账户正在审核中，请耐心等待' },
          { status: 403 }
        );
      }
      if (account.approvalStatus === 'rejected') {
        return NextResponse.json(
          { error: '您的账户审核未通过，请联系客服' },
          { status: 403 }
        );
      }
      if (account.approvalStatus === 'suspended') {
        return NextResponse.json(
          { error: '您的账户已被暂停，请联系客服' },
          { status: 403 }
        );
      }
      if (account.approvalStatus !== 'approved') {
        return NextResponse.json(
          { error: '账户状态异常，请联系客服' },
          { status: 403 }
        );
      }
    }

    // 生成 JWT token
    const token = jwt.sign(
      {
        id: account.id,
        email: account.email,
        name: account.name,
        type: accountType,
        ...(accountType === 'rcic' && {
          consultantType: account.consultantType,
        }),
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回用户信息和 token
    const response = NextResponse.json({
      message: '登录成功',
      token,
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        type: accountType,
        ...(accountType === 'rcic' && {
          consultantType: account.consultantType,
          approvalStatus: account.approvalStatus,
        }),
      },
    });

    // 设置 HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
