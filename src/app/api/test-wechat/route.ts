// 仅用于本地/开发环境测试企业微信 Webhook，生产环境请勿暴露或删除此接口
import { NextResponse } from "next/server";
import { sendWechatText } from "@/lib/wechat";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "仅开发环境可用" }, { status: 403 });
  }
  const configured = !!process.env.WECHAT_WEBHOOK_URL?.trim();
  const result = await sendWechatText(
    "【加移】本地测试\n这是一条测试消息，说明企业微信 Webhook 已接通。"
  );
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: "已发送，请到「企业微信」App 里的群聊查看（不是个人微信）",
      configured: true,
    });
  }
  const status = result.error === "WECHAT_WEBHOOK_URL 未配置" ? 400 : 500;
  return NextResponse.json(
    {
      success: false,
      error: result.error,
      configured,
      hint: !configured
        ? "请在项目根目录 .env.local 中配置 WECHAT_WEBHOOK_URL 并重启 pnpm dev"
        : "若已配置仍失败，请检查 Webhook 是否为企业微信群机器人（非个人微信、非 Smart 大模型机器人）",
    },
    { status }
  );
}
