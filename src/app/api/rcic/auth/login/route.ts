import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createRCICSession } from "@/lib/rcic-auth";



export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    // 查找顾问（使用RCIC表）
    const consultant = await prisma.rCIC.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!consultant || !consultant.password) {
      return NextResponse.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 检查邮箱是否验证
    if (!consultant.emailVerified) {
      return NextResponse.json(
        { error: "请先验证您的邮箱地址" },
        { status: 403 }
      );
    }

    // 检查审核状态
    if (consultant.approvalStatus !== 'approved') {
      const statusMessages: Record<string, string> = {
        pending: '您的账号正在等待审核',
        under_review: '您的账号正在审核中',
        rejected: '您的账号审核未通过，请联系管理员',
        suspended: '您的账号已被暂停',
      };
      return NextResponse.json(
        { error: statusMessages[consultant.approvalStatus] || '您的账号无法登录' },
        { status: 403 }
      );
    }

    // 检查账号是否被禁用
    if (!consultant.isActive) {
      return NextResponse.json(
        { error: "您的账号已被禁用" },
        { status: 403 }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, consultant.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 创建session
    const { token, expiresAt } = await createRCICSession(
      consultant.id,
      request.headers.get("user-agent") || undefined,
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined
    );

    // 更新最后登录时间
    await prisma.rCIC.update({
      where: { id: consultant.id },
      data: {
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        isOnline: true,
      },
    });

    // 设置 cookie
    const response = NextResponse.json({
      success: true,
      message: "登录成功",
    });

    // 设置session cookie
    response.cookies.set("rcic_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("RCIC login error:", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
