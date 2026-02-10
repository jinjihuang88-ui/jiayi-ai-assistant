// 管理员：将已审核通过的顾问设为可登录（补标邮箱已验证）
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");
    if (!adminToken || adminToken.value !== "authenticated") {
      return NextResponse.json({ success: false, message: "未授权" }, { status: 401 });
    }

    const { rcicId } = await request.json();
    if (!rcicId) {
      return NextResponse.json({ success: false, message: "缺少 rcicId" }, { status: 400 });
    }

    const rcic = await prisma.rCIC.findUnique({ where: { id: rcicId } });
    if (!rcic) {
      return NextResponse.json({ success: false, message: "顾问不存在" }, { status: 404 });
    }
    if (rcic.approvalStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "仅可对已审核通过的顾问操作" },
        { status: 400 }
      );
    }

    await prisma.rCIC.update({
      where: { id: rcicId },
      data: { emailVerified: true },
    });

    return NextResponse.json({
      success: true,
      message: "已设为可登录，该顾问现在可以登录",
    });
  } catch (error) {
    console.error("Set loginable error:", error);
    return NextResponse.json({ success: false, message: "操作失败" }, { status: 500 });
  }
}
