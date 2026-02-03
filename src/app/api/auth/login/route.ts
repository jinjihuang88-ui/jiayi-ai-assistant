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

    // 根据用户类型查找账户
    if (userType === 'user') {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      if (!user.emailVerified) {
        return NextResponse.json(
          { error: '请先验证邮箱后再登录' },
          { status: 403 }
        );
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          type: 'user',
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json({
        message: '登录成功',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: 'user',
        },
      });

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    } else {
      const rcic = await prisma.rCIC.findUnique({
        where: { email },
      });

      if (!rcic) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, rcic.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      if (!rcic.emailVerified) {
        return NextResponse.json(
          { error: '请先验证邮箱后再登录' },
          { status: 403 }
        );
      }

      if (rcic.approvalStatus === 'pending') {
        return NextResponse.json(
          { error: '您的账户正在审核中，请耐心等待' },
          { status: 403 }
        );
      }
      if (rcic.approvalStatus === 'rejected') {
        return NextResponse.json(
          { error: '您的账户审核未通过，请联系客服' },
          { status: 403 }
        );
      }
      if (rcic.approvalStatus === 'suspended') {
        return NextResponse.json(
          { error: '您的账户已被暂停，请联系客服' },
          { status: 403 }
        );
      }
      if (rcic.approvalStatus !== 'approved') {
        return NextResponse.json(
          { error: '账户状态异常，请联系客服' },
          { status: 403 }
        );
      }

      const token = jwt.sign(
        {
          id: rcic.id,
          email: rcic.email,
          name: rcic.name,
          type: 'rcic',
          consultantType: rcic.consultantType,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json({
        message: '登录成功',
        token,
        user: {
          id: rcic.id,
          email: rcic.email,
          name: rcic.name,
          type: 'rcic',
          consultantType: rcic.consultantType,
          approvalStatus: rcic.approvalStatus,
        },
      });

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
