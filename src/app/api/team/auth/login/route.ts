import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "邮箱和密码为必填项" },
        { status: 400 }
      );
    }

    // 统一邮箱格式为小写
    const normalizedEmail = email.toLowerCase().trim();
    console.log('[Team Login] Attempting login for:', normalizedEmail);

    // 查找团队成员
    const member = await prisma.rCICTeamMember.findUnique({
      where: { email: normalizedEmail },
    });

    console.log('[Team Login] Member found:', member ? `Yes (ID: ${member.id}, Active: ${member.isActive})` : 'No');

    if (!member) {
      return NextResponse.json(
        { success: false, error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 检查是否被禁用
    if (!member.isActive) {
      return NextResponse.json(
        { success: false, error: "账号已被禁用，请联系管理员" },
        { status: 403 }
      );
    }

    // 验证密码
    console.log('[Team Login] Checking password for:', member.email);
    const isPasswordValid = await bcrypt.compare(password, member.password);
    console.log('[Team Login] Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 创建session
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天

    await prisma.rCICTeamMemberSession.create({
      data: {
        memberId: member.id,
        token,
        expiresAt,
        userAgent: request.headers.get("user-agent"),
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      },
    });

    // 更新最后登录时间
    await prisma.rCICTeamMember.update({
      where: { id: member.id },
      data: { lastLoginAt: new Date() },
    });

    // 设置cookie
    const cookieStore = await cookies();
    cookieStore.set("team_member_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        role: member.role,
      },
    });
  } catch (error) {
    console.error("团队成员登录失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
