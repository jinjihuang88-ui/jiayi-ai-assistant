/**
 * 企业微信自建应用「接收消息」回调：验签与解密
 * 文档：https://developer.work.weixin.qq.com/document/path/90968
 */
import crypto from "crypto";

function sha1(str: string): string {
  return crypto.createHash("sha1").update(str, "utf8").digest("hex");
}

/** 校验 msg_signature */
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

/** AES 解密（企业微信方案：AESKey=Base64Decode(EncodingAESKey+"=")，IV=前16字节） */
export function decrypt(
  encodingAESKey: string,
  msgEncrypt: string,
  _receiveId: string
): string {
  const keyBase64 = encodingAESKey.trim().replace(/=+$/, "") + "=";
  let key = Buffer.from(keyBase64, "base64");
  if (key.length > 32) key = key.subarray(0, 32);
  const iv = key.subarray(0, 16);
  const cipherText = msgEncrypt.trim().replace(/ /g, "+");
  const cipher = Buffer.from(cipherText, "base64");
  const dec = crypto.createDecipheriv("aes-256-cbc", key, iv);
  dec.setAutoPadding(true);
  const buf = Buffer.concat([dec.update(cipher), dec.final()]);
  const msgLen = buf.readUInt32BE(16);
  return buf.subarray(20, 20 + msgLen).toString("utf8");
}
