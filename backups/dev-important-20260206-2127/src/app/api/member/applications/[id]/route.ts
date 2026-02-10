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
  consultation: "咨询会话",
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

/** 会员申请详情 = 单条案件 + 解析 description 为 formData */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const { id } = await params;
    const caseItem = await prisma.case.findFirst({
      where: { id, userId: user.id },
      include: {
        rcic: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            senderType: true,
            senderId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!caseItem) {
      return NextResponse.json(
        { success: false, message: "申请不存在" },
        { status: 404 }
      );
    }

    let formData: Record<string, unknown> = {};
    if (caseItem.description) {
      try {
        formData = JSON.parse(caseItem.description) as Record<string, unknown>;
      } catch (_) {}
    }

    const application = {
      id: caseItem.id,
      type: caseItem.type,
      typeName: TYPE_NAMES[caseItem.type] || caseItem.type,
      status: toFrontendStatus(caseItem.status),
      formData,
      rcicId: caseItem.rcicId,
      rcicName: caseItem.rcic?.name ?? null,
      rcicComment: null,
      rcicReviewedAt: caseItem.rcicReviewedAt?.toISOString() ?? null,
      createdAt: caseItem.createdAt.toISOString(),
      updatedAt: caseItem.updatedAt.toISOString(),
      submittedAt: caseItem.createdAt.toISOString(),
      statusHistory: [],
      messages: caseItem.messages.map((m) => ({
        id: m.id,
        content: m.content,
        senderType: m.senderType,
        senderName: m.senderType === "user" ? "我" : "顾问",
        createdAt: m.createdAt.toISOString(),
      })),
      documents: [],
    };

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("[member/applications/[id] GET]", error);
    return NextResponse.json(
      { success: false, message: "获取申请详情失败" },
      { status: 500 }
    );
  }
}
