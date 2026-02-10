import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TYPE_NAMES: Record<string, string> = {
  "study-permit": "学签申请",
  "visitor-visa": "访客签证申请",
  "work-permit": "工签申请",
  "express-entry": "快速通道申请",
  "provincial-nominee": "省提名申请",
  immigration: "移民申请",
};

/** 用户提交申请资料时创建案件（案件 = 用户已填写的移民/留学/旅游等资料提交给顾问） */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    if (!user.assignedRcicId) {
      return NextResponse.json(
        { success: false, message: "请先选择顾问后再提交申请" },
        { status: 400 }
      );
    }

    // 签约/填写资料前须完善个人资料（至少姓、名）
    let profile: { familyName?: string; givenName?: string } | null = null;
    if (user.profileJson) {
      try {
        profile = JSON.parse(user.profileJson) as { familyName?: string; givenName?: string };
      } catch {
        profile = null;
      }
    }
    const familyName = (profile?.familyName ?? "").trim();
    const givenName = (profile?.givenName ?? "").trim();
    if (!familyName || !givenName) {
      return NextResponse.json(
        { success: false, message: "请先完善个人资料（至少填写姓、名）后再提交申请。请前往「个人资料」完善。" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, title, applicationData } = body as {
      type: string;
      title?: string;
      applicationData?: Record<string, unknown>;
    };

    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { success: false, message: "缺少申请类型 type" },
        { status: 400 }
      );
    }

    const caseTitle = title || TYPE_NAMES[type] || type;
    const description =
      applicationData != null ? JSON.stringify(applicationData) : null;

    const caseItem = await prisma.case.create({
      data: {
        userId: user.id,
        rcicId: user.assignedRcicId,
        type: type.replace(/-/g, "_") || type,
        title: caseTitle,
        description,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: "申请已提交，已形成案件供顾问跟进与审核",
      caseId: caseItem.id,
      application: {
        id: caseItem.id,
        type: caseItem.type,
        typeName: TYPE_NAMES[type] || caseTitle,
        status: "submitted",
        submittedAt: caseItem.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[member/applications/submit]", error);
    return NextResponse.json(
      { success: false, message: "提交失败" },
      { status: 500 }
    );
  }
}
