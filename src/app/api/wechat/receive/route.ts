/**
 * 企业微信自建应用「接收消息」回调 URL。
 * 参考：https://developer.work.weixin.qq.com/document/path/90307 等
 * - GET：URL 验证（验签 + 解密 echostr 后原样返回）。
 * - POST：接收加密消息 → 验签 → 解密 → 解析 XML → 按 MsgId 去重 → 写入案件会话。
 * 注意：企业微信要求 5 秒内响应，超时会重试最多 3 次；使用 MsgId 去重避免重复落库。
 */
import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { verifySignature, decrypt, normalizeEncodingAESKey } from "@/lib/wechat-callback";
import { prisma } from "@/lib/prisma";

// 规范化环境变量，避免 Vercel 中粘贴时带入首尾引号/空格/换行
const TOKEN = (process.env.WECHAT_CALLBACK_TOKEN || "").trim().replace(/^["']|["']$/g, "").trim();
const ENCODING_AES_KEY = normalizeEncodingAESKey(process.env.WECHAT_ENCODING_AES_KEY || "");
const CORP_ID = (process.env.WECHAT_CORP_ID || "").trim().replace(/^["']|["']$/g, "").trim();

export async function GET(request: NextRequest) {
  console.log("[WeChat receive] GET received (URL 校验)");
  if (!TOKEN || !ENCODING_AES_KEY) {
    console.log("[WeChat receive] GET fail: TOKEN or ENCODING_AES_KEY 未配置");
    return NextResponse.json(
      { error: "WECHAT_CALLBACK_TOKEN / WECHAT_ENCODING_AES_KEY 未配置" },
      { status: 400 }
    );
  }
  const { searchParams } = new URL(request.url);
  const msgSignature = searchParams.get("msg_signature");
  const timestamp = searchParams.get("timestamp");
  const nonce = searchParams.get("nonce");
  let echostr = searchParams.get("echostr");
  if (!msgSignature || !timestamp || !nonce || !echostr) {
    console.log("[WeChat receive] GET fail: 缺少参数");
    return new NextResponse("缺少参数", { status: 400 });
  }
  echostr = echostr.replace(/ /g, "+");
  const ok = verifySignature(TOKEN, timestamp, nonce, echostr, msgSignature);
  if (!ok) {
    console.log("[WeChat receive] GET fail: 签名错误 - 请确认 Vercel 的 WECHAT_CALLBACK_TOKEN 与企业管理后台「接收消息」里的 Token 完全一致");
    return new NextResponse("签名错误", { status: 403 });
  }
  try {
    const plain = decrypt(ENCODING_AES_KEY, echostr, CORP_ID);
    console.log("[WeChat receive] GET verify ok");
    return new NextResponse(plain, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (e) {
    console.error("[WeChat receive] GET decrypt error:", e);
    return new NextResponse("解密失败", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log("[WeChat receive] ========== POST /api/wechat/receive 收到请求 ==========");
  if (!TOKEN || !ENCODING_AES_KEY) {
    console.log("[WeChat receive] missing TOKEN or ENCODING_AES_KEY");
    return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  const { searchParams } = new URL(request.url);
  const msgSignature = searchParams.get("msg_signature");
  const timestamp = searchParams.get("timestamp");
  const nonce = searchParams.get("nonce");
  if (!msgSignature || !timestamp || !nonce) {
    console.log("[WeChat receive] missing query params");
    return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  const body = await request.text();
  console.log("[WeChat receive] POST bodyLen:", body?.length);
  let msgEncrypt = "";
  try {
    const match = body.match(/<Encrypt><!\[CDATA\[([\s\S]*?)\]\]><\/Encrypt>/);
    msgEncrypt = match ? match[1] : "";
  } catch {
    console.log("[WeChat receive] body parse error");
    return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  if (!msgEncrypt) {
    console.log("[WeChat receive] no Encrypt in body, bodyLen:", body?.length, "bodyPreview:", body?.slice(0, 200));
    return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  const ok = verifySignature(TOKEN, timestamp, nonce, msgEncrypt, msgSignature);
  if (!ok) {
    console.log("[WeChat receive] signature verify fail");
    return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  try {
    const keyLen = ENCODING_AES_KEY.length;
    const keyStart = ENCODING_AES_KEY.slice(0, 2);
    const keyEnd = ENCODING_AES_KEY.slice(-2);
    console.log("[WeChat receive] KEY 长度:", keyLen, "前2位:", keyStart, "后2位:", keyEnd, "| 若与后台不一致请检查 Vercel 环境变量");
    if (keyLen !== 43) {
      console.warn("[WeChat receive] 密钥长度不对，当前", keyLen, "位");
    }
    // 密文：先 URL 解码再去掉所有空白（避免 CDATA 内换行/空格导致 base64 解码错误）
    const cipherForDecrypt = msgEncrypt
      .replace(/%2B/gi, "+")
      .replace(/%2b/gi, "+")
      .replace(/\s/g, "")
      .trim();
    console.log("[WeChat receive] msgEncrypt len:", msgEncrypt.length, "cipherForDecrypt len:", cipherForDecrypt.length);
    const plain = decrypt(ENCODING_AES_KEY, cipherForDecrypt, CORP_ID);
    console.log("[WeChat receive] decrypted plain len:", plain?.length, "preview:", plain?.slice(0, 300));
    const parser = new XMLParser({ ignoreDeclaration: true });
    const parsed = parser.parse(plain) as Record<string, Record<string, string> | undefined>;
    const xml =
      parsed?.xml ??
      parsed?.XML ??
      (typeof parsed === "object" && parsed !== null
        ? (Object.values(parsed).find((v) => v && typeof v === "object") as Record<string, string>)
        : {}) ??
      {};
    console.log("[WeChat receive] xml keys:", Object.keys(xml));
    const fromUserName = (xml.FromUserName ?? xml.fromusername ?? "").trim();
    const msgType = (xml.MsgType ?? xml.msgtype ?? "").trim();
    const content = (xml.Content ?? xml.content ?? "").trim();
    const msgId = (xml.MsgId ?? xml.msgid ?? "").trim();

    console.log("[WeChat receive] from:", JSON.stringify(fromUserName), "msgType:", msgType, "contentLen:", content.length, "msgId:", msgId || "(none)");

    if (msgType !== "text" || !content) {
      if (fromUserName) console.log("[WeChat receive] skip non-text or empty");
      return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    const normalize = (s: string) => s.replace(/\s+/g, "").toLowerCase();
    const fromNorm = normalize(fromUserName);
    const rcics = await prisma.rCIC.findMany({
      where: { wechatUserId: { not: null }, isActive: true },
      select: { id: true, name: true, lastWechatNotifiedCaseId: true, wechatUserId: true },
    });
    const rcic = rcics.find((r) => r.wechatUserId && normalize(r.wechatUserId) === fromNorm) ?? null;

    if (!rcic) {
      console.log("[WeChat receive] no RCIC for wechat userid:", JSON.stringify(fromUserName), "- 请确认管理后台该顾问的企业微信账号已填写（匹配时已忽略空格与大小写）");
      return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    let caseId = rcic.lastWechatNotifiedCaseId;
    if (caseId) {
      console.log("[WeChat receive] using lastWechatNotifiedCaseId:", caseId);
    } else {
      const lastCase = await prisma.case.findFirst({
        where: { rcicId: rcic.id },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });
      caseId = lastCase?.id ?? null;
      if (caseId) console.log("[WeChat receive] using last case for rcic:", caseId);
    }

    if (!caseId) {
      console.log("[WeChat receive] no case for rcic:", rcic.id, "- 请先让会员给该顾问发一条消息（顾问保持离线），触发「跟进人不在线」通知后再用企业微信回复");
      return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    const caseRow = await prisma.case.findFirst({
      where: { id: caseId, rcicId: rcic.id },
      select: { id: true },
    });
    if (!caseRow) {
      console.log("[WeChat receive] case not found or not owned by rcic:", caseId, rcic.id);
      return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    // 消息去重：企业微信可能重试最多 3 次，用 MsgId 避免重复落库
    if (msgId) {
      const existing = await prisma.message.findFirst({
        where: { wechatMsgId: msgId },
        select: { id: true },
      });
      if (existing) {
        console.log("[WeChat receive] duplicate msgId, skip:", msgId);
        return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
      }
    }

    await prisma.message.create({
      data: {
        caseId: caseRow.id,
        senderId: rcic.id,
        senderType: "rcic",
        content,
        wechatMsgId: msgId || null,
      },
    });
    console.log("[WeChat receive] message saved -> caseId:", caseRow.id, "rcic:", rcic.name, "content:", content.slice(0, 50));
  } catch (e) {
    const isDecrypt = (e as Error)?.message?.includes("bad decrypt") || (e as Error)?.message?.includes("decrypt");
    console.error("[WeChat receive] POST decrypt or save:", e);
    if (isDecrypt) {
      console.error(
        "[WeChat receive] 解密失败：请检查 Vercel 环境变量 WECHAT_ENCODING_AES_KEY 是否与「企业微信管理后台 → 该自建应用 → 接收消息」里的 EncodingAESKey 完全一致（43 位，无空格/换行/引号）。若曾重新获取过 EncodingAESKey，必须把新值更新到 Vercel 并重新部署。"
      );
    }
  }
  return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
}
