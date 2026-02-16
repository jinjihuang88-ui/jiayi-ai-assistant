/**
 * 企业微信自建应用「接收消息」回调：验签与解密
 * 使用官方 Node 加解密库 @wecom/crypto（https://developer.work.weixin.qq.com/document/path/90307）
 */
import { getSignature, decrypt as wecomDecrypt } from "@wecom/crypto";

/** 校验 msg_signature（与官方库 getSignature 一致） */
export function verifySignature(
  token: string,
  timestamp: string,
  nonce: string,
  msgEncrypt: string,
  signature: string
): boolean {
  return getSignature(token, timestamp, nonce, msgEncrypt) === signature;
}

/** 规范化 EncodingAESKey：去除首尾空白和首尾引号，避免环境变量粘贴问题 */
export function normalizeEncodingAESKey(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, "").trim();
}

/**
 * 解密（委托给官方库）。企业应用回调时 id 为 CorpID，可选校验。
 */
export function decrypt(
  encodingAESKey: string,
  msgEncrypt: string,
  receiveId: string
): string {
  const key = normalizeEncodingAESKey(encodingAESKey);
  const { message, id } = wecomDecrypt(key, msgEncrypt);
  if (receiveId && receiveId.trim() && id !== receiveId) {
    throw new Error("decrypt: receiveId mismatch");
  }
  return message;
}
