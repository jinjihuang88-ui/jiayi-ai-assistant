/**
 * 企业微信自建应用「接收消息」回调：验签与解密
 * 文档：https://developer.work.weixin.qq.com/document/path/90968
 * 明文结构：random(16B) + msg_len(4B 大端) + msg + receiveid
 */
import crypto from "crypto";

function sha1(str: string): string {
  return crypto.createHash("sha1").update(str, "utf8").digest("hex");
}

/** 校验 msg_signature（token、timestamp、nonce、msg_encrypt 字典序排序后 sha1） */
export function verifySignature(
  token: string,
  timestamp: string,
  nonce: string,
  msgEncrypt: string,
  signature: string
): boolean {
  const sorted = [token, timestamp, nonce, msgEncrypt].sort();
  const str = sorted.join("");
  return sha1(str) === signature;
}

/** 规范化 EncodingAESKey：去除首尾空白和首尾引号，避免环境变量粘贴问题 */
export function normalizeEncodingAESKey(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, "").trim();
}

/**
 * AES 解密（企业微信方案：AESKey=Base64Decode(EncodingAESKey+"=")，IV=前16字节）。
 * 企业应用回调时 receiveId 为 CorpID，校验通过才返回 msg，否则抛错。
 */
export function decrypt(
  encodingAESKey: string,
  msgEncrypt: string,
  receiveId: string
): string {
  const keyStr = normalizeEncodingAESKey(encodingAESKey);
  const keyBase64 = keyStr.replace(/=+$/, "") + "=";
  let keyBuf = Buffer.from(keyBase64, "base64");
  if (keyBuf.length > 32) keyBuf = keyBuf.subarray(0, 32);
  const iv = keyBuf.subarray(0, 16);
  const cipherText = msgEncrypt.trim().replace(/ /g, "+");
  const cipher = Buffer.from(cipherText, "base64");
  const dec = crypto.createDecipheriv("aes-256-cbc", keyBuf, iv);
  dec.setAutoPadding(true);
  const buf = Buffer.concat([dec.update(cipher), dec.final()]);
  // 结构：16 随机字节 + 4 字节 msg 长度(大端) + msg + receiveid
  if (buf.length < 20) throw new Error("decrypt: buffer too short");
  const msgLen = buf.readUInt32BE(16);
  if (msgLen < 0 || msgLen > 1024 * 1024) throw new Error("decrypt: invalid msg_len");
  if (20 + msgLen > buf.length) throw new Error("decrypt: msg_len exceeds buffer");
  const msg = buf.subarray(20, 20 + msgLen).toString("utf8");
  const tail = buf.subarray(20 + msgLen).toString("utf8");
  if (receiveId && receiveId.trim() && tail !== receiveId) {
    throw new Error("decrypt: receiveId mismatch");
  }
  return msg;
}
