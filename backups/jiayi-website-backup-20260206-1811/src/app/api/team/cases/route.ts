import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 验证团队成员登录
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("team_member_session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    // 验证session
    const session = await prisma.rCICTeamMemberSession.findUnique({
      where: { token: sessionToken },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "会话已过期" },
        { status: 401 }
      );
    }

    // 获取团队成员信息
    const member = await prisma.rCICTeamMember.findUnique({
      where: { id: session.memberId },
    });

    if (!member || !member.isActive) {
      return NextResponse.json(
        { success: false, error: "账号已被禁用" },
        { status: 403 }
      );
    }

    // 获取URL参数
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    // 构建查询条件（使用团队成员所属RCIC的ID）
    const where: any = {
      rcicId: member.rcicId,
    };

    if (status) {
      where.status = status;
    }

    // 获取案件列表
    const cases = await prisma.case.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
                senderType: "user",
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // 获取统计数据
    const stats = {
      pending: await prisma.case.count({
        where: { rcicId: member.rcicId, status: "submitted" },
      }),
      underReview: await prisma.case.count({
        where: { rcicId: member.rcicId, status: "under_review" },
      }),
      needsRevision: await prisma.case.count({
        where: { rcicId: member.rcicId, status: "needs_revision" },
      }),
      approved: await prisma.case.count({
        where: { rcicId: member.rcicId, status: "approved" },
      }),
    };

    // 格式化案件数据
    const typeNameMap: Record<string, string> = {
      "study-permit": "学习许可",
      "visitor-visa": "访客签证",
      "work-permit": "工作许可",
      "express-entry": "快速通道",
      "provincial-nominee": "省提名",
    };

    const applications = cases.map((c) => ({
      id: c.id,
      type: c.type,
      typeName: typeNameMap[c.type] || c.type,
      status: c.status,
      title: c.title,
      submittedAt: c.createdAt.toISOString(),
      user: c.user,
      _count: c._count,
    }));

    return NextResponse.json({
      success: true,
      applications,
      stats,
    });
  } catch (error) {
    console.error("获取案件列表失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
