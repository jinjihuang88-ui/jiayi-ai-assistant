import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // 查找团队成员
    const teamMember = await prisma.rCICTeamMember.findUnique({
      where: { id },
    });

    if (!teamMember) {
      return NextResponse.json(
        { success: false, error: "团队成员不存在" },
        { status: 404 }
      );
    }

    // 验证该成员是否属于当前RCIC
    if (teamMember.rcicId !== rcicId) {
      return NextResponse.json(
        { success: false, error: "无权操作此成员" },
        { status: 403 }
      );
    }

    // 切换状态
    const updatedMember = await prisma.rCICTeamMember.update({
      where: { id },
      data: {
        isActive: !teamMember.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      member: {
        id: updatedMember.id,
        isActive: updatedMember.isActive,
      },
    });
  } catch (error) {
    console.error("切换团队成员状态失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
