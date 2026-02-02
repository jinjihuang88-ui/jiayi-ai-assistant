import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "邮箱不能为空" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "该邮箱已注册，请直接登录" },
        { status: 400 }
      );
    }

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 保存验证码到数据库（5分钟有效期）
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // TODO: 发送邮件（这里暂时返回验证码用于开发测试）
    console.log(`Verification code for ${email}: ${code}`);

    // 开发模式返回验证码
    const isDev = process.env.NODE_ENV === "development";

    return NextResponse.json({
      success: true,
      message: "验证码已发送",
      ...(isDev && { devCode: code }),
    });
  } catch (error) {
    console.error("Send register code error:", error);
    return NextResponse.json(
      { success: false, message: "发送失败，请稍后重试" },
      { status: 500 }
    );
  }
}
