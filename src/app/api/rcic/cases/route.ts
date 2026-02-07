import { NextRequest, NextResponse } from "next/server";
import { getCurrentRCIC } from "@/lib/rcic-auth";
import { prisma } from "@/lib/prisma";

const TYPE_NAMES: Record<string, string> = {
  visitor_visa: "访问签证",
  study_permit: "学签",
  "study-permit": "学签",
  work_permit: "工签",
  "work-permit": "工签",
  express_entry: "快速通道",
  "express-entry": "快速通道",
  provincial_nominee: "省提名",
  "provincial-nominee": "省提名",
  immigration: "移民",
  consultation: "与顾问沟通",
};

function toFrontendStatus(dbStatus: string): string {
  const map: Record<string, string> = {
    pending: "submitted",
    in_progress: "under_review",
    completed: "approved",
    cancelled: "rejected",
  };
  return map[dbStatus] ?? dbStatus;
}

export async function GET(request: NextRequest) {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 100);
    const statusFilter = searchParams.get("status");

    // 咨询不算案件：只列签合同收费后的正式案件（type !== consultation）
    const baseWhere = { rcicId: rcic.id, type: { not: "consultation" as const } };
    const where: { rcicId: string; type: { not: string }; status?: string } = baseWhere;
    if (statusFilter && statusFilter !== "all") {
      const toDbStatus: Record<string, string> = {
        submitted: "pending",
        under_review: "in_progress",
        needs_revision: "in_progress",
        approved: "completed",
        rejected: "cancelled",
      };
      const dbStatus = toDbStatus[statusFilter];
      if (dbStatus) where.status = dbStatus;
    }

    const [cases, pending, inProgress, completed] = await Promise.all([
      prisma.case.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: limit,
        include: {
          user: { select: { id: true, email: true, name: true, phone: true } },
          _count: { select: { messages: true } },
        },
      }),
      prisma.case.count({ where: { ...baseWhere, status: "pending" } }),
      prisma.case.count({ where: { ...baseWhere, status: "in_progress" } }),
      prisma.case.count({ where: { ...baseWhere, status: "completed" } }),
    ]);

    const applications = cases.map((c) => ({
      id: c.id,
      type: c.type,
      typeName: TYPE_NAMES[c.type] || c.type,
      status: toFrontendStatus(c.status),
      submittedAt: c.createdAt.toISOString(),
      user: c.user,
      documents: [],
      _count: { messages: c._count.messages },
      assignedTeamMemberId: c.assignedTeamMemberId,
      rcicReviewedAt: c.rcicReviewedAt?.toISOString() ?? null,
    }));

    const stats = {
      pending,
      underReview: inProgress,
      needsRevision: 0,
      approved: completed,
    };

    return NextResponse.json({
      success: true,
      stats,
      applications,
    });
  } catch (error) {
    console.error("[rcic/cases]", error);
    return NextResponse.json(
      { success: false, message: "获取案件列表失败" },
      { status: 500 }
    );
  }
}
