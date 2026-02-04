import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    // 验证RCIC登录
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("rcic_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    // 验证session
    const session = await prisma.rCICSession.findUnique({
      where: { token: sessionToken },
      include: { rcic: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "会话已过期" },
        { status: 401 }
      );
    }

    const rcicId = session.rcicId;

    // 获取请求数据
    const body = await request.json();
    const { email, name, role } = body;

    // 验证必填字段
    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: "邮箱和姓名为必填项" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingMember = await prisma.rCICTeamMember.findUnique({
      where: { email },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "该邮箱已被使用" },
        { status: 400 }
      );
    }

    // 生成随机密码（8位）
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // 创建团队成员
    const teamMember = await prisma.rCICTeamMember.create({
      data: {
        rcicId,
        email,
        name,
        password: hashedPassword,
        role: role || "operator",
      },
    });

    // TODO: 发送邮件通知（包含登录信息和密码）
    // 这里暂时返回密码，实际应该通过邮件发送
    console.log(`团队成员创建成功: ${email}, 临时密码: ${randomPassword}`);

    return NextResponse.json({
      success: true,
      member: {
        id: teamMember.id,
        email: teamMember.email,
        name: teamMember.name,
        role: teamMember.role,
        isActive: teamMember.isActive,
        createdAt: teamMember.createdAt,
      },
      // 仅用于开发测试，生产环境应该通过邮件发送
      tempPassword: randomPassword,
    });
  } catch (error) {
    console.error("添加团队成员失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
