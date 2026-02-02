import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// 动态导入 prisma，避免构建时错误
let prisma: any;
try {
  prisma = require("@/lib/prisma").default;
} catch (error) {
  console.error("Failed to load prisma:", error);
}

// 测试模式：免登录API
export async function POST(request: NextRequest) {
  console.log("=== Test Login API Called ===");
  
  try {
    const body = await request.json();
    console.log("Request body:", body);
    
    const { email } = body;

    if (!email) {
      console.log("Error: Email is empty");
      return NextResponse.json(
        { success: false, message: "邮箱不能为空" },
        { status: 400 }
      );
    }

    console.log("Email:", email);

    // 检查 prisma 是否可用
    if (!prisma) {
      console.error("Prisma is not available");
      return NextResponse.json(
        { success: false, message: "数据库连接失败" },
        { status: 500 }
      );
    }

    console.log("Checking if user exists...");
    
    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("Creating new user...");
      // 自动创建测试用户
      user = await prisma.user.create({
        data: {
          email,
          name: `测试用户_${email.split("@")[0]}`,
          lastLoginAt: new Date(),
        },
      });
      console.log("User created:", user.id);
    } else {
      console.log("Updating existing user...");
      // 更新最后登录时间
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      console.log("User updated");
    }

    console.log("Creating session...");
    
    // 创建会话
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天有效期

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        userAgent: request.headers.get("user-agent") || undefined,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      },
    });

    console.log("Session created, setting cookie...");

    // 设置 Cookie
    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    console.log("Login successful!");

    return NextResponse.json({
      success: true,
      message: "登录成功",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("=== Test Login Error ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error details:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "登录失败：" + (error.message || "未知错误"),
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
