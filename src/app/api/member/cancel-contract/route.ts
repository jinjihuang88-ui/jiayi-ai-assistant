import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 会员取消合约：将本人名下已签约案件（contractedAt 非空）置为未签约（contractedAt = null）。
 * 取消后可再次选择其他顾问。
 * 可传 caseId 取消指定案件，不传则取消该会员所有已签约案件。
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    let body: { caseId?: string } = {};
    try {
      body = await request.json();
    } catch {
      // 无 body 则取消全部
    }

    const where: { userId: string; contractedAt: { not: null }; id?: string } = {
      userId: user.id,
      contractedAt: { not: null },
    };
    if (body.caseId) where.id = body.caseId;

    const updated = await prisma.case.updateMany({
      where,
      data: { contractedAt: null },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, message: "没有可取消的合约或案件不存在" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "合约已取消，您可以重新选择顾问",
      count: updated.count,
    });
  } catch (e) {
    console.error("[member/cancel-contract]", e);
    return NextResponse.json(
      { success: false, message: "取消合约失败" },
      { status: 500 }
    );
  }
}
