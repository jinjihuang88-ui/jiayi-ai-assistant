import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TYPE_NAMES: Record<string, string> = {
  study_permit: "学习签证",
  "study-permit": "学习签证",
  visitor_visa: "访客签证",
  "visitor-visa": "访客签证",
  work_permit: "工作签证",
  "work-permit": "工作签证",
  express_entry: "EE技术移民",
  "express-entry": "EE技术移民",
  provincial_nominee: "省提名项目",
  "provincial-nominee": "省提名项目",
  immigration: "移民申请",
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

/** 会员申请列表 = 该用户提交的申请。业务规则：一般咨询不算案件；签合同收费后才算案件。与顾问沟通（type=consultation）仅用于消息，默认不列入申请列表。 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const includeConsultation = searchParams.get("includeConsultation") === "true";

    const toDb: Record<string, string> = {
      draft: "pending",
      submitted: "pending",
      under_review: "in_progress",
      needs_revision: "in_progress",
      approved: "completed",
      rejected: "cancelled",
    };
    const dbStatus = statusFilter && statusFilter !== "all" ? toDb[statusFilter] : undefined;
    const where = {
      userId: user.id,
      ...(includeConsultation ? {} : { type: { not: "consultation" as const } }),
      ...(dbStatus ? { status: dbStatus } : {}),
    };

    const cases = await prisma.case.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        rcic: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
    });

    const applications = cases.map((c) => ({
      id: c.id,
      type: c.type,
      typeName: TYPE_NAMES[c.type] || c.type,
      status: toFrontendStatus(c.status),
      rcicName: c.rcic?.name ?? null,
      rcicComment: null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      submittedAt: c.createdAt.toISOString(),
      messageCount: c._count.messages,
      documentCount: 0,
    }));

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("[member/applications GET]", error);
    return NextResponse.json(
      { success: false, message: "获取申请列表失败" },
      { status: 500 }
    );
  }
}
