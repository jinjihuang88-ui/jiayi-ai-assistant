import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "邮箱和密码必须填写" },
        { status: 400 }
      );
    }

    // 动态导入 Prisma 和 bcrypt
    const { PrismaClient } = await import("@prisma/client");
    const bcrypt = await import("bcryptjs");
    const prisma = new PrismaClient();

    try {
      // 检查邮箱是否已注册
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "该邮箱已注册" },
          { status: 400 }
        );
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split("@")[0], // 使用提供的姓名或邮箱前缀
        },
      });

      // 生成 JWT
      const token = await new SignJWT({ userId: user.id, email: user.email })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      // 设置 cookie
      const response = NextResponse.json({
        success: true,
        message: "注册成功",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });

      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}