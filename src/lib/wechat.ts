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
    console.warn("[WeChat] WECHAT_WEBHOOK_URL 未配置，跳过发送");
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
      console.log("[WeChat] send ok");
      return { success: true };
    }
    const err = data.errmsg || `HTTP ${res.status}`;
    console.warn("[WeChat] send failed:", err);
    return { success: false, error: err };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[WeChat] send error:", msg);
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

/** 案件跟进人不在线时：除邮件外，同步发企业微信，便于在群里沟通 */
export async function sendCaseFollowerOfflineNotification(payload: {
  caseTitle?: string;
  followerName?: string;
  type: "message" | "file" | "missed_call";
  memberName?: string;
  callType?: "video" | "voice";
}): Promise<{ success: boolean; error?: string }> {
  const appUrl =
    process.env.APP_URL?.trim()?.startsWith("http")
      ? process.env.APP_URL.trim()
      : process.env.NEXT_PUBLIC_APP_URL?.trim()?.startsWith("http")
        ? process.env.NEXT_PUBLIC_APP_URL.trim()
        : "https://www.jiayi.co";
  const messagesUrl = `${appUrl}/rcic/messages`;
  const caseLabel = payload.caseTitle ? `案件「${payload.caseTitle}」` : "案件";
  const followerLabel = payload.followerName ? `（跟进人：${payload.followerName}）` : "";
  let content: string;
  if (payload.type === "missed_call") {
    const callLabel = payload.callType === "video" ? "视频通话" : "语音通话";
    content = `【加移】${caseLabel}有会员发起了${callLabel}未接听${followerLabel}，当前跟进人不在线。请登录后台查看并回复：${messagesUrl}`;
  } else if (payload.type === "file") {
    content = `【加移】${caseLabel}有会员发送了文件/图片${followerLabel}，当前跟进人不在线。请登录后台查看：${messagesUrl}`;
  } else {
    content = `【加移】${caseLabel}有会员发送了消息${followerLabel}，当前跟进人不在线。请登录后台查看：${messagesUrl}`;
  }
  return sendWechatText(content);
}
