import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

// 测试模式：RCIC免登录API
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "邮箱不能为空" },
        { status: 400 }
      );
    }

    // 查找或创建顾问
    let rcic = await prisma.rCIC.findUnique({
      where: { email },
    });

    if (!rcic) {
      // 自动创建测试顾问（默认A类持牌顾问）
      rcic = await prisma.rCIC.create({
        data: {
          email,
          name: `测试顾问_${email.split("@")[0]}`,
          level: "A",
          licenseNo: `TEST-${Math.floor(Math.random() * 100000)}`,
          isActive: true, // 测试模式直接激活
          lastActiveAt: new Date(),
        },
      });
    } else {
      // 更新最后活跃时间
      await prisma.rCIC.update({
        where: { id: rcic.id },
        data: { 
          lastActiveAt: new Date(),
          isActive: true, // 确保激活状态
        },
      });
    }

    // 创建会话
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天有效期

    await prisma.rCICSession.create({
      data: {
        rcicId: rcic.id,
        token,
        expiresAt,
        userAgent: request.headers.get("user-agent") || undefined,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      },
    });

    // 设置 Cookie
    const cookieStore = await cookies();
    cookieStore.set("rcic_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "登录成功（测试模式）",
      rcic: {
        id: rcic.id,
        email: rcic.email,
        name: rcic.name,
        level: rcic.level,
        licenseNo: rcic.licenseNo,
      },
    });
  } catch (error) {
    console.error("RCIC test login error:", error);
    return NextResponse.json(
      { success: false, message: "登录失败" },
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
