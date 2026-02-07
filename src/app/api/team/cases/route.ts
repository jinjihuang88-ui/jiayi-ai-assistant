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
    const assignedToMe = searchParams.get("assignedToMe") === "1" || searchParams.get("assignedToMe") === "true";

    // 咨询不算案件：只列正式案件（type !== consultation）
    const where: any = {
      rcicId: member.rcicId,
      type: { not: "consultation" },
    };

    if (status) {
      where.status = status;
    }
    if (assignedToMe) {
      where.assignedTeamMemberId = member.id;
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

    // 咨询不算案件；统计仅含正式案件
    const statsWhere = { rcicId: member.rcicId, type: { not: "consultation" } };
    const stats = {
      pending: await prisma.case.count({
        where: { ...statsWhere, status: "pending" },
      }),
      underReview: await prisma.case.count({
        where: { ...statsWhere, status: "in_progress" },
      }),
      needsRevision: 0,
      approved: await prisma.case.count({
        where: { ...statsWhere, status: "completed" },
      }),
    };

    // 格式化案件数据
    const typeNameMap: Record<string, string> = {
      "study-permit": "学习许可",
      "visitor-visa": "访客签证",
      "work-permit": "工作许可",
      "express-entry": "快速通道",
      "provincial-nominee": "省提名",
      consultation: "与顾问沟通",
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
      assignedTeamMemberId: c.assignedTeamMemberId,
      assignedToMe: c.assignedTeamMemberId === member.id,
      rcicReviewedAt: c.rcicReviewedAt?.toISOString() ?? null,
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
