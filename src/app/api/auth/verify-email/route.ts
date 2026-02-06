// src/app/api/auth/verify-email/route.ts
// 供程序化调用；用户点击邮件链接时请直接打开 /auth/verify?token=xxx（服务端验证，国内可访问）
import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/verify-email';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: '验证令牌缺失' }, { status: 400 });
    }
    const result = await verifyEmailToken(token);
    if (result.success) {
      return NextResponse.json({
        message: result.message,
        success: true,
      });
    }
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
