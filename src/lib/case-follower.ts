import type { PrismaClient } from "@prisma/client";
import { isRcicEffectivelyOnline } from "./rcic-online";

export type CaseFollowerInfo = {
  email: string;
  caseTitle?: string;
  isOnline: boolean;
  name?: string;
  role: "rcic" | "team_member";
  /** 跟进人 ID：role=rcic 时为 RCIC.id，role=team_member 时为 RCICTeamMember.id */
  followerId?: string;
  /** 仅 role=rcic 时有值，用于发送应用消息到该顾问企业微信 */
  wechatUserId?: string | null;
};

/**
 * 获取案件跟进人邮箱。跟进人优先为指派的文案/操作员，否则为顾问。
 */
export async function getCaseFollowerEmail(
  prisma: PrismaClient,
  caseId: string
): Promise<{ email: string; caseTitle?: string } | null> {
  const withStatus = await getCaseFollowerWithStatus(prisma, caseId);
  return withStatus ? { email: withStatus.email, caseTitle: withStatus.caseTitle } : null;
}

/**
 * 获取案件跟进人及其在线状态（用于离线时补发企业微信通知）。
 * 文案/操作员暂无 isOnline 字段，统一视为离线以便推送企业微信。
 */
export async function getCaseFollowerWithStatus(
  prisma: PrismaClient,
  caseId: string
): Promise<CaseFollowerInfo | null> {
  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      title: true,
      assignedTeamMemberId: true,
      rcicId: true,
    },
  });
  if (!caseItem) return null;

  if (caseItem.assignedTeamMemberId) {
    const member = await prisma.rCICTeamMember.findUnique({
      where: { id: caseItem.assignedTeamMemberId },
      select: { email: true, name: true },
    });
    if (member?.email) {
      return {
        email: member.email,
        caseTitle: caseItem.title || undefined,
        isOnline: false,
        name: member.name,
        role: "team_member",
        followerId: caseItem.assignedTeamMemberId ?? undefined,
      };
    }
  }

  if (caseItem.rcicId) {
    const rcic = await prisma.rCIC.findUnique({
      where: { id: caseItem.rcicId },
      select: { email: true, name: true, isOnline: true, lastActiveAt: true, wechatUserId: true },
    });
    if (rcic?.email) {
      const effectiveOnline = isRcicEffectivelyOnline(rcic.isOnline ?? false, rcic.lastActiveAt);
      return {
        email: rcic.email,
        caseTitle: caseItem.title || undefined,
        isOnline: effectiveOnline,
        name: rcic.name,
        role: "rcic",
        followerId: caseItem.rcicId,
        wechatUserId: rcic.wechatUserId ?? undefined,
      };
    }
  }

  return null;
}
