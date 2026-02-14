/**
 * 企业微信自建应用「接收消息」回调 URL。
 * GET：URL 验证。
 * POST：接收成员发到应用的消息，解析后写入对应案件会话，会员端消息页可见。
 */
import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { verifySignature, decrypt } from "@/lib/wechat-callback";
import { prisma } from "@/lib/prisma";

const TOKEN = process.env.WECHAT_CALLBACK_TOKEN || "";
const ENCODING_AES_KEY = process.env.WECHAT_ENCODING_AES_KEY || "";
const CORP_ID = process.env.WECHAT_CORP_ID || "";

export async function GET(request: NextRequest) {
  if (!TOKEN || !ENCODING_AES_KEY) {
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
    return new NextResponse("缺少参数", { status: 400 });
  }
  echostr = echostr.replace(/ /g, "+");
  const ok = verifySignature(TOKEN, timestamp, nonce, echostr, msgSignature);
  if (!ok) {
    return new NextResponse("签名错误", { status: 403 });
  }
  try {
    const plain = decrypt(ENCODING_AES_KEY, echostr, CORP_ID);
    return new NextResponse(plain, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (e) {
    console.error("[WeChat receive] GET decrypt:", e);
    return new NextResponse("解密失败", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!TOKEN || !ENCODING_AES_KEY) {
    return new NextResponse("", { status: 200 });
  }
  const { searchParams } = new URL(request.url);
  const msgSignature = searchParams.get("msg_signature");
  const timestamp = searchParams.get("timestamp");
  const nonce = searchParams.get("nonce");
  if (!msgSignature || !timestamp || !nonce) {
    return new NextResponse("", { status: 200 });
  }
  const body = await request.text();
  let msgEncrypt = "";
  try {
    const match = body.match(/<Encrypt><!\[CDATA\[([\s\S]*?)\]\]><\/Encrypt>/);
    msgEncrypt = match ? match[1] : "";
  } catch {
    return new NextResponse("", { status: 200 });
  }
  if (!msgEncrypt) {
    return new NextResponse("", { status: 200 });
  }
  const ok = verifySignature(TOKEN, timestamp, nonce, msgEncrypt, msgSignature);
  if (!ok) {
    return new NextResponse("", { status: 200 });
  }
  try {
    const plain = decrypt(ENCODING_AES_KEY, msgEncrypt, CORP_ID);
    const parser = new XMLParser({ ignoreDeclaration: true });
    const parsed = parser.parse(plain) as Record<string, Record<string, string> | undefined>;
    const xml = parsed?.xml ?? parsed?.XML ?? {};
    const fromUserName = (xml.FromUserName ?? xml.fromusername ?? "").trim();
    const msgType = (xml.MsgType ?? xml.msgtype ?? "").trim();
    const content = (xml.Content ?? xml.content ?? "").trim();

    if (msgType !== "text" || !content) {
      if (fromUserName) console.log("[WeChat receive] skip non-text or empty:", msgType, !!content);
      return new NextResponse("", { status: 200 });
    }

    const rcic = await prisma.rCIC.findFirst({
      where: { wechatUserId: fromUserName!, isActive: true },
      select: { id: true, lastWechatNotifiedCaseId: true },
    });

    if (!rcic) {
      console.log("[WeChat receive] no RCIC for wechat userid:", fromUserName);
      return new NextResponse("", { status: 200 });
    }

    let caseId = rcic.lastWechatNotifiedCaseId;
    if (!caseId) {
      const lastCase = await prisma.case.findFirst({
        where: { rcicId: rcic.id },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });
      caseId = lastCase?.id ?? null;
    }

    if (!caseId) {
      console.log("[WeChat receive] no case for rcic:", rcic.id);
      return new NextResponse("", { status: 200 });
    }

    const caseRow = await prisma.case.findFirst({
      where: { id: caseId, rcicId: rcic.id },
      select: { id: true },
    });
    if (!caseRow) {
      console.log("[WeChat receive] case not found or not owned by rcic:", caseId, rcic.id);
      return new NextResponse("", { status: 200 });
    }

    await prisma.message.create({
      data: {
        caseId: caseRow.id,
        senderId: rcic.id,
        senderType: "rcic",
        content,
      },
    });
    console.log("[WeChat receive] message saved caseId:", caseRow.id, "rcicId:", rcic.id);
  } catch (e) {
    console.error("[WeChat receive] POST decrypt or save:", e);
  }
  return new NextResponse("", { status: 200 });
}
