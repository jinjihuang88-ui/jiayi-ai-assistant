/**
 * 企业微信自建应用「接收消息」回调 URL。
 * 在企业微信管理后台 → 自建应用 → 接收消息 → 设置此 URL（如 https://www.jiayi.co/api/wechat/receive）。
 * GET：URL 验证（企业微信会带 msg_signature, timestamp, nonce, echostr，需验签并解密 echostr 原样返回）。
 * POST：接收成员发到应用的消息（当前仅返回 200，后续可在此解密并写入站内会话实现「企业微信→网站」）。
 */
import { NextRequest, NextResponse } from "next/server";
import { verifySignature, decrypt } from "@/lib/wechat-callback";

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
    console.log("[WeChat receive] POST decrypted (length):", plain?.length);
    // TODO: 解析 XML 得到 FromUserName、MsgType、Content，根据 userid 查顾问/文案，写入对应案件 Message，实现企业微信→网站
  } catch (e) {
    console.error("[WeChat receive] POST decrypt:", e);
  }
  return new NextResponse("", { status: 200 });
}
