// src/lib/wechat.ts
// 通过企业微信群机器人 Webhook 发送通知（新用户/新顾问注册等）

const WECHAT_WEBHOOK_URL = process.env.WECHAT_WEBHOOK_URL || "";

/**
 * 向企业微信群机器人发送文本消息。
 * 未配置 WECHAT_WEBHOOK_URL 时直接返回，不报错。
 * 文本最长 2048 字节，超长会被截断。
 */
export async function sendWechatText(content: string): Promise<{ success: boolean; error?: string }> {
  if (!WECHAT_WEBHOOK_URL.trim()) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[WeChat] WECHAT_WEBHOOK_URL 未配置，跳过发送");
    }
    return { success: false, error: "WECHAT_WEBHOOK_URL 未配置" };
  }
  const maxLen = 2048;
  const body = content.length > maxLen ? content.slice(0, maxLen - 3) + "..." : content;
  try {
    const res = await fetch(WECHAT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msgtype: "text",
        text: { content: body },
      }),
    });
    const data = (await res.json()) as { errcode?: number; errmsg?: string };
    if (res.ok && (data.errcode === 0 || data.errcode === undefined)) {
      return { success: true };
    }
    return { success: false, error: data.errmsg || `HTTP ${res.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}

/** 新会员注册：发送到微信群，返回发送结果（失败不影响注册） */
export async function notifyWechatNewUser(payload: {
  email: string;
  name: string;
  phone?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const text = `【加移】新会员注册\n姓名：${payload.name}\n邮箱：${payload.email}${payload.phone ? `\n电话：${payload.phone}` : ""}`;
  return sendWechatText(text);
}

/** 新顾问注册：发送到微信群（不阻塞注册流程） */
export function notifyWechatNewRCIC(payload: {
  email: string;
  name: string;
  phone?: string | null;
  consultantType: string;
}) {
  const text = `【加移】新顾问注册（待审核）\n姓名：${payload.name}\n邮箱：${payload.email}\n类型：${payload.consultantType}${payload.phone ? `\n电话：${payload.phone}` : ""}`;
  sendWechatText(text).catch((err) => console.error("[WeChat] notifyWechatNewRCIC failed:", err));
}
