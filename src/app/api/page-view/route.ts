import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_PATHS = ["/", "/risk-compass"];

/** 前端页面加载时调用，统计 www.jiayi.co 与 /risk-compass 的访问量 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path.trim() : "";
    if (!path || !ALLOWED_PATHS.includes(path)) {
      return NextResponse.json({ success: false, message: "invalid path" }, { status: 400 });
    }

    await prisma.$executeRaw`
      INSERT INTO page_view_stats (id, path, viewCount, updatedAt)
      VALUES (UUID(), ${path}, 1, NOW())
      ON DUPLICATE KEY UPDATE viewCount = viewCount + 1, updatedAt = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[page-view]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
