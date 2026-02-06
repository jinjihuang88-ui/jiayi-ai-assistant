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

    // 同一登录界面：持牌顾问与文案/操作员共用，通过账号区分；持牌顾问优先（同一邮箱时）
    // 1）先查持牌顾问（RCIC）
    let consultant = await prisma.rCIC.findUnique({
      where: { email: normalizedEmail },
    });
    if (!consultant) {
      consultant = await prisma.rCIC.findFirst({
        where: { email: { equals: normalizedEmail, mode: "insensitive" } },
      });
    }

    if (consultant?.password) {
      const rcicOk =
        consultant.emailVerified &&
        consultant.approvalStatus === "approved" &&
        consultant.isActive;
      if (rcicOk && (await bcrypt.compare(trimmedPassword, consultant.password))) {
        const { token, expiresAt } = await createRCICSession(
          consultant.id,
          request.headers.get("user-agent") || undefined,
          request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined
        );
        await prisma.rCIC.update({
          where: { id: consultant.id },
          data: { lastLoginAt: new Date(), lastActiveAt: new Date(), isOnline: true },
        });
        const response = NextResponse.json({
          success: true,
          message: "登录成功",
          userType: "rcic",
          redirectTo: "/rcic/dashboard",
        });
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
      }
    }

    // 2）再查文案/操作员（团队成员）
    const teamMember = await prisma.rCICTeamMember.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    if (teamMember?.password) {
      if (teamMember.isActive && (await bcrypt.compare(trimmedPassword, teamMember.password))) {
        const { randomBytes } = await import("crypto");
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await prisma.rCICTeamMemberSession.create({
          data: {
            memberId: teamMember.id,
            token,
            expiresAt,
            userAgent: request.headers.get("user-agent"),
            ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          },
        });
        await prisma.rCICTeamMember.update({
          where: { id: teamMember.id },
          data: { lastLoginAt: new Date() },
        });
        const response = NextResponse.json({
          success: true,
          message: "登录成功",
          userType: "team_member",
          redirectTo: "/team/dashboard",
        });
        response.cookies.set("team_member_session_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: expiresAt,
          path: "/",
        });
        return response;
      }
    }

    return NextResponse.json(
      { error: "邮箱或密码错误" },
      { status: 401 }
    );
  } catch (error) {
    console.error("RCIC login error:", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
