// src/lib/wechat.ts
// 1) 群机器人 Webhook：发到企业微信群（新用户/新顾问/跟进人离线通知）
// 2) 发送应用消息：发到指定成员的自建应用（会员回复时推送给顾问，与「接收消息」同应用）

const WECHAT_WEBHOOK_URL = process.env.WECHAT_WEBHOOK_URL || "";
const WECHAT_CORP_ID = (process.env.WECHAT_CORP_ID || "").trim();
const WECHAT_APP_SECRET = (process.env.WECHAT_APP_SECRET || "").trim();
const WECHAT_AGENT_ID = process.env.WECHAT_AGENT_ID || "";

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

/** 获取企业微信 access_token（自建应用 Secret），带内存缓存 */
async function getWechatAccessToken(): Promise<string | null> {
  if (!WECHAT_CORP_ID || !WECHAT_APP_SECRET) return null;
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60_000) {
    return cachedAccessToken.token;
  }
  try {
    const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${encodeURIComponent(WECHAT_CORP_ID)}&corpsecret=${encodeURIComponent(WECHAT_APP_SECRET)}`;
    const res = await fetch(url);
    const data = (await res.json()) as { access_token?: string; expires_in?: number; errcode?: number };
    if (data.errcode && data.errcode !== 0) {
      console.warn("[WeChat] gettoken err:", data);
      return null;
    }
    const token = data.access_token;
    const expiresIn = (data.expires_in || 7200) * 1000;
    if (token) {
      cachedAccessToken = { token, expiresAt: now + expiresIn };
      return token;
    }
  } catch (e) {
    console.warn("[WeChat] gettoken error:", e);
  }
  return null;
}

/**
 * 向指定成员的企业微信自建应用发送文本（与「接收消息」为同一应用时，顾问可在同一应用里收+回）。
 * 需配置 WECHAT_CORP_ID、WECHAT_APP_SECRET、WECHAT_AGENT_ID；顾问需已填 wechatUserId。
 */
export async function sendWechatAppMessage(
  toUserid: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const agentId = WECHAT_AGENT_ID.trim();
  if (!agentId) {
    console.warn("[WeChat] WECHAT_AGENT_ID 未配置，跳过应用消息");
    return { success: false, error: "WECHAT_AGENT_ID 未配置" };
  }
  const token = await getWechatAccessToken();
  if (!token) {
    console.warn("[WeChat] 获取 access_token 失败，跳过应用消息");
    return { success: false, error: "获取 access_token 失败" };
  }
  const maxLen = 2048;
  const body = content.length > maxLen ? content.slice(0, maxLen - 3) + "..." : content;
  try {
    const res = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        touser: toUserid,
        msgtype: "text",
        agentid: parseInt(agentId, 10) || agentId,
        text: { content: body },
      }),
    });
    const data = (await res.json()) as { errcode?: number; errmsg?: string };
    if (data.errcode === 0) {
      console.log("[WeChat] app message ok, touser:", toUserid);
      return { success: true };
    }
    console.warn("[WeChat] app message failed:", data.errmsg, "errcode:", data.errcode);
    return { success: false, error: data.errmsg || String(data.errcode) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[WeChat] app message error:", msg);
    return { success: false, error: msg };
  }
}

/** 会员在网站回复时，把内容推到顾问的企业微信应用（与接收消息同应用，对话集中） */
export async function sendMemberReplyToWechatApp(
  toUserid: string,
  memberContent: string,
  caseTitle?: string
): Promise<{ success: boolean; error?: string }> {
  const appUrl =
    process.env.APP_URL?.trim()?.startsWith("http")
      ? process.env.APP_URL.trim()
      : process.env.NEXT_PUBLIC_APP_URL?.trim()?.startsWith("http")
        ? process.env.NEXT_PUBLIC_APP_URL.trim()
        : "https://www.jiayi.co";
  const messagesUrl = `${appUrl}/rcic/messages`;
  const caseLabel = caseTitle ? `案件「${caseTitle}」` : "案件";
  const snippet = memberContent.replace(/\s+/g, " ").trim().slice(0, 200);
  const content = `【加移】${caseLabel} 会员回复：\n${snippet}${memberContent.length > 200 ? "…" : ""}\n\n登录后台查看并回复：${messagesUrl}`;
  return sendWechatAppMessage(toUserid, content);
}

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

/** 案件跟进人不在线时：除邮件外，同步发企业微信。type=message 时直接发会员的回复内容到群，不再发固定文案。 */
export async function sendCaseFollowerOfflineNotification(payload: {
  caseTitle?: string;
  followerName?: string;
  type: "message" | "file" | "missed_call";
  memberName?: string;
  callType?: "video" | "voice";
  /** type=message 时传入会员发送的原文，将直接发到群 */
  memberContent?: string;
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
    // 普通文字消息：直接发会员的回复内容到群，不再发固定通知
    const text = (payload.memberContent || "").trim() || "（无文字）";
    content = `【加移】${caseLabel} 会员回复${followerLabel}：\n${text}\n\n登录后台查看：${messagesUrl}`;
  }
  return sendWechatText(content);
}
