// 顾问“真实在线”判断：仅当最近有活跃（如 5 分钟内）才视为在线，避免未登录/关浏览器后仍显示在线

const ONLINE_IDLE_MS = 5 * 60 * 1000; // 5 分钟无活跃视为离线

/**
 * 是否视为在线。用于会员端展示与“跟进人不在线”企业微信通知。
 * 条件：isOnline 为 true 且 lastActiveAt 在阈值内；否则视为离线。
 */
export function isRcicEffectivelyOnline(
  isOnline: boolean,
  lastActiveAt: Date | null
): boolean {
  if (!isOnline) return false;
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_IDLE_MS;
}
