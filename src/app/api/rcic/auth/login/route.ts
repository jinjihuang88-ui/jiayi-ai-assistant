import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createRCICSession } from "@/lib/rcic-auth";



export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const trimmedPassword = typeof password === "string" ? password.trim() : "";

    if (!email || !trimmedPassword) {
      return NextResponse.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 顾问登录只查 RCIC 表；团队成员请用 /api/team/auth/login
    // 查找顾问：先精确匹配（与注册时存的小写一致），再兜底不区分大小写（兼容生产环境）
    let consultant = await prisma.rCIC.findUnique({
      where: { email: normalizedEmail },
    });
    if (!consultant) {
      consultant = await prisma.rCIC.findFirst({
        where: { email: { equals: normalizedEmail, mode: "insensitive" } },
      });
    }

    if (!consultant || !consultant.password) {
      return NextResponse.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 必须先验证邮箱
    if (!consultant.emailVerified) {
      return NextResponse.json(
        { error: "请先验证您的邮箱地址（点击注册邮件中的验证链接）" },
        { status: 403 }
      );
    }

    // 必须审核通过
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
    const isPasswordValid = await bcrypt.compare(trimmedPassword, consultant.password);

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

    const response = NextResponse.json({
      success: true,
      message: "登录成功",
      userType: 'rcic',
      redirectTo: '/rcic/dashboard',
    });

    // 与会员一致：设置 rcic_id cookie（无 domain，与 user_id 相同）
    response.cookies.set("rcic_id", consultant.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
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
