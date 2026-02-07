import { NextRequest, NextResponse } from "next/server";
import { getCurrentRCIC } from "@/lib/rcic-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json({ success: false }, { status: 401 });
    }
    const { id } = await params;

    const caseItem = await prisma.case.findFirst({
      where: { id, rcicId: rcic.id },
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
        _count: { select: { messages: true } },
      },
    });

    if (!caseItem) {
      return NextResponse.json({ success: false, message: "案件不存在" }, { status: 404 });
    }

    let assignedTeamMember = null;
    if (caseItem.assignedTeamMemberId) {
      assignedTeamMember = await prisma.rCICTeamMember.findUnique({
        where: { id: caseItem.assignedTeamMemberId },
        select: { id: true, name: true, email: true, role: true },
      });
    }

    const teamMembers = await prisma.rCICTeamMember.findMany({
      where: { rcicId: rcic.id, isActive: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });

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
        createdAt: caseItem.createdAt.toISOString(),
        updatedAt: caseItem.updatedAt.toISOString(),
        user: caseItem.user,
        assignedTeamMember,
        _count: caseItem._count,
      },
      teamMembers,
    });
  } catch (error) {
    console.error("[rcic/cases/[id] GET]", error);
    return NextResponse.json(
      { success: false, message: "获取案件失败" },
      { status: 500 }
    );
  }
}

/** 指派跟进人 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json({ success: false }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const { assignedTeamMemberId } = body;

    const caseItem = await prisma.case.findFirst({
      where: { id, rcicId: rcic.id },
    });
    if (!caseItem) {
      return NextResponse.json({ success: false, message: "案件不存在" }, { status: 404 });
    }

    if (assignedTeamMemberId !== null && assignedTeamMemberId !== undefined) {
      const member = await prisma.rCICTeamMember.findFirst({
        where: { id: assignedTeamMemberId, rcicId: rcic.id },
      });
      if (!member) {
        return NextResponse.json({ success: false, message: "该团队成员不存在" }, { status: 400 });
      }
    }

    await prisma.case.update({
      where: { id },
      data: {
        assignedTeamMemberId: assignedTeamMemberId === "" ? null : assignedTeamMemberId,
      },
    });

    return NextResponse.json({ success: true, message: "指派已更新" });
  } catch (error) {
    console.error("[rcic/cases/[id] PATCH]", error);
    return NextResponse.json(
      { success: false, message: "更新指派失败" },
      { status: 500 }
    );
  }
}
