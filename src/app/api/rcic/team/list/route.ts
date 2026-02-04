import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
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

    // 获取该RCIC的所有团队成员
    const teamMembers = await prisma.rCICTeamMember.findMany({
      where: { rcicId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      members: teamMembers,
    });
  } catch (error) {
    console.error("获取团队成员列表失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
