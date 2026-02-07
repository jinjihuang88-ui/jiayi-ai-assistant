import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** 消息（文字、图片、文件）保留天数，超期自动清除；只清理「与顾问沟通」线程内的消息，申请案件内消息保留 */
const MESSAGE_RETENTION_DAYS = 90;

/**
 * 清理超期消息内容（与顾问沟通线程内、超过保留期的消息）。供 Vercel Cron 或外部定时任务调用。
 * 会话/案件不删除，仅删除其中的旧消息，用户仍可在消息页看到近期记录。
 * 鉴权：请求头 Authorization: Bearer <CRON_SECRET> 或 query ?secret=<CRON_SECRET>。
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
      const querySecret = request.nextUrl.searchParams.get("secret");
      if (bearer !== cronSecret && querySecret !== cronSecret) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MESSAGE_RETENTION_DAYS);

    const consultationCaseIds = await prisma.case.findMany({
      where: { type: "consultation" },
      select: { id: true },
    });
    const ids = consultationCaseIds.map((c) => c.id);
    if (ids.length === 0) {
      return NextResponse.json({
        success: true,
        message: "无需清理",
        deletedMessages: 0,
      });
    }

    const deletedMessages = await prisma.message.deleteMany({
      where: {
        caseId: { in: ids },
        createdAt: { lt: cutoff },
      },
    });

    return NextResponse.json({
      success: true,
      message: `已清除与顾问沟通线程中超过 ${MESSAGE_RETENTION_DAYS} 天的消息`,
      deletedMessages: deletedMessages.count,
    });
  } catch (e) {
    console.error("[cron/cleanup-consultations]", e);
    return NextResponse.json(
      { success: false, message: "清理失败" },
      { status: 500 }
    );
  }
}
