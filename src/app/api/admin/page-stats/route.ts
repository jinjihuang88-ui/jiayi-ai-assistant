import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const PATH_LABELS: Record<string, string> = {
  "/": "首页 www.jiayi.co",
  "/risk-compass": "风险罗盘 www.jiayi.co/risk-compass",
};

/** 管理后台：查询全站页面点击率（首页、risk-compass） */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");
    if (!adminToken || adminToken.value !== "authenticated") {
      return NextResponse.json({ success: false, message: "未授权" }, { status: 401 });
    }

    const rows = await prisma.$queryRaw<{ path: string; viewCount?: number; viewcount?: number }[]>`
      SELECT path, viewCount FROM page_view_stats
      WHERE path IN ('/', '/risk-compass')
      ORDER BY path
    `;

    const stats = rows.map((r) => {
      const count = r.viewCount ?? (r as Record<string, unknown>).viewcount;
      return {
        path: r.path,
        label: PATH_LABELS[r.path] ?? r.path,
        viewCount: Number(count) || 0,
      };
    });

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("[admin/page-stats]", error);
    return NextResponse.json({ success: false, message: "获取失败" }, { status: 500 });
  }
}
