import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/** 文案/操作员也可标记「持牌顾问审核」，对外统一显示为持牌顾问审核 */
export async function POST(
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
    });
    if (!caseItem) {
      return NextResponse.json({ success: false, message: "案件不存在" }, { status: 404 });
    }

    await prisma.case.update({
      where: { id },
      data: { rcicReviewedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "已标记为持牌顾问审核" });
  } catch (error) {
    console.error("[team/cases/[id]/review]", error);
    return NextResponse.json(
      { success: false, message: "操作失败" },
      { status: 500 }
    );
  }
}
