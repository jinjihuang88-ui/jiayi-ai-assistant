import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// 临时硬编码密码（生产环境应使用环境变量）
const ADMIN_PASSWORD = "admin123";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      // 设置管理员cookie
      const cookieStore = await cookies();
      cookieStore.set("admin_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24小时
      });

      return NextResponse.json({
        success: true,
        message: "登录成功",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "密码错误",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "登录失败",
      },
      { status: 500 }
    );
  }
}
