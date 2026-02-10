import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** 会员是否已与某顾问签约（存在 contractedAt 非空的案件） */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }
    const contractedCase = await prisma.case.findFirst({
      where: { userId: user.id, contractedAt: { not: null } },
      select: { id: true },
    });
    return NextResponse.json({ success: true, contracted: !!contractedCase });
  } catch (e) {
    console.error("[member/contract-status]", e);
    return NextResponse.json(
      { success: false, message: "获取签约状态失败" },
      { status: 500 }
    );
  }
}
