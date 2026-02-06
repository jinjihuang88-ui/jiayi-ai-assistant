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

    // 先尝试查找团队成员（邮箱不区分大小写）
    const teamMember = await prisma.rCICTeamMember.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });

    if (teamMember) {
      // 团队成员登录逻辑
      if (!teamMember.isActive) {
        return NextResponse.json(
          { error: "账号已被禁用，请联系管理员" },
          { status: 403 }
        );
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(trimmedPassword, teamMember.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "邮箱或密码错误" },
          { status: 401 }
        );
      }

      // 创建团队成员session
      const { randomBytes } = await import('crypto');
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.rCICTeamMemberSession.create({
        data: {
          memberId: teamMember.id,
          token,
          expiresAt,
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        },
      });

      // 更新最后登录时间
      await prisma.rCICTeamMember.update({
        where: { id: teamMember.id },
        data: { lastLoginAt: new Date() },
      });

      // 设置cookie
      const response = NextResponse.json({
        success: true,
        message: "登录成功",
        userType: 'team_member',
        redirectTo: '/team/dashboard',
      });

      response.cookies.set('team_member_session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });

      return response;
    }

    // 查找顾问（邮箱不区分大小写，避免注册时大小写与登录不一致）
    const consultant = await prisma.rCIC.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });

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

    // 设置 cookie
    const response = NextResponse.json({
      success: true,
      message: "登录成功",
      userType: 'rcic',
      redirectTo: '/rcic/dashboard',
    });

    // 设置 session cookie（生产环境用 .jiayi.co 保证 www / 根域都能带上）
    const isJiayi = process.env.NEXT_PUBLIC_APP_URL?.includes("jiayi.co");
    response.cookies.set("rcic_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
      ...(process.env.NODE_ENV === "production" && isJiayi ? { domain: ".jiayi.co" } : {}),
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
