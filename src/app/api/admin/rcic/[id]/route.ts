import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/** 管理员更新顾问信息（当前仅支持 wechatUserId） */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");
    if (!adminToken || adminToken.value !== "authenticated") {
      return NextResponse.json({ success: false, message: "未授权访问" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const wechatUserId = typeof body.wechatUserId === "string" ? body.wechatUserId.trim() || null : undefined;

    if (wechatUserId === undefined) {
      return NextResponse.json({ success: false, message: "缺少 wechatUserId 字段" }, { status: 400 });
    }

    await prisma.rCIC.update({
      where: { id },
      data: { wechatUserId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin rcic PATCH]", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, message: `更新失败：${msg}` }, { status: 500 });
  }
}
