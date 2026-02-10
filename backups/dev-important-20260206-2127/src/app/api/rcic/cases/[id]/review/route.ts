import { NextRequest, NextResponse } from "next/server";
import { getCurrentRCIC } from "@/lib/rcic-auth";
import { prisma } from "@/lib/prisma";

/** 持牌顾问审核：标记为已审核（对外统一显示为持牌顾问审核） */
export async function POST(
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
    });
    if (!caseItem) {
      return NextResponse.json({ success: false, message: "案件不存在" }, { status: 404 });
    }

    await prisma.case.update({
      where: { id },
      data: { rcicReviewedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "用户申请资料已审核（持牌顾问）" });
  } catch (error) {
    console.error("[rcic/cases/[id]/review]", error);
    return NextResponse.json(
      { success: false, message: "操作失败" },
      { status: 500 }
    );
  }
}
