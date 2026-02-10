import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("team_member_session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const session = await prisma.rCICTeamMemberSession.findUnique({
      where: { token: sessionToken },
    });
    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, message: "会话已过期" }, { status: 401 });
    }

    const member = await prisma.rCICTeamMember.findUnique({
      where: { id: session.memberId },
    });
    if (!member || !member.isActive) {
      return NextResponse.json({ success: false, message: "账号不可用" }, { status: 403 });
    }

    const { id } = await params;
    const caseItem = await prisma.case.findFirst({
      where: { id, rcicId: member.rcicId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        _count: { select: { messages: true } },
      },
    });

    if (!caseItem) {
      return NextResponse.json({ success: false, message: "案件不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      case: {
        id: caseItem.id,
        type: caseItem.type,
        status: caseItem.status,
        title: caseItem.title,
        description: caseItem.description,
        assignedTeamMemberId: caseItem.assignedTeamMemberId,
        rcicReviewedAt: caseItem.rcicReviewedAt?.toISOString() ?? null,
        user: caseItem.user,
        _count: caseItem._count,
      },
    });
  } catch (error) {
    console.error("[team/cases/[id] GET]", error);
    return NextResponse.json(
      { success: false, message: "获取案件失败" },
      { status: 500 }
    );
  }
}
