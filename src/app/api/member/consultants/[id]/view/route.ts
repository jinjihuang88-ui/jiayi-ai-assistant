import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/** 会员查看顾问详情时调用，用于统计点击率（管理后台可见） */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }
    const { id: consultantId } = await params;
    if (!consultantId) {
      return NextResponse.json({ success: false, message: "缺少顾问ID" }, { status: 400 });
    }

    const rcic = await prisma.rCIC.findUnique({
      where: { id: consultantId },
      select: { id: true },
    });
    if (!rcic) {
      return NextResponse.json({ success: false, message: "顾问不存在" }, { status: 404 });
    }

    // 用 raw 更新，不依赖 Prisma 客户端是否已 regenerate
    await prisma.$executeRaw`
      UPDATE rcics SET profileViewCount = COALESCE(profileViewCount, 0) + 1 WHERE id = ${consultantId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[member/consultants/[id]/view]", error);
    return NextResponse.json(
      { success: false, message: "记录失败" },
      { status: 500 }
    );
  }
}
