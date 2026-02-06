// 管理员查看某邮箱的 RCIC 状态，便于排查无法登录
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");
    if (!adminToken || adminToken.value !== "authenticated") {
      return NextResponse.json({ success: false, message: "未授权" }, { status: 401 });
    }

    const email = request.nextUrl.searchParams.get("email")?.trim();
    if (!email) {
      return NextResponse.json({ success: false, message: "缺少 email 参数" }, { status: 400 });
    }

    const rcic = await prisma.rCIC.findFirst({
      where: { email: { equals: email.toLowerCase(), mode: "insensitive" } },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        approvalStatus: true,
        isActive: true,
        createdAt: true,
        approvedAt: true,
      },
    });

    if (!rcic) {
      return NextResponse.json({ success: false, message: "未找到该邮箱的顾问" }, { status: 404 });
    }

    const canLogin =
      rcic.emailVerified === true &&
      rcic.approvalStatus === "approved" &&
      rcic.isActive === true;

    return NextResponse.json({
      success: true,
      rcic: {
        ...rcic,
        canLogin,
        blockReason: !rcic.emailVerified
          ? "邮箱未验证"
          : rcic.approvalStatus !== "approved"
            ? "审核未通过或未审核"
            : !rcic.isActive
              ? "账号已禁用"
              : null,
      },
    });
  } catch (error) {
    console.error("Admin RCIC status error:", error);
    return NextResponse.json({ success: false, message: "查询失败" }, { status: 500 });
  }
}
