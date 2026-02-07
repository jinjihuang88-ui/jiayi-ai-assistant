import type { PrismaClient } from "@prisma/client";

/**
 * 获取案件跟进人邮箱。跟进人优先为指派的文案/操作员，否则为顾问。
 */
export async function getCaseFollowerEmail(
  prisma: PrismaClient,
  caseId: string
): Promise<{ email: string; caseTitle?: string } | null> {
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
      select: { email: true },
    });
    if (member?.email) {
      return { email: member.email, caseTitle: caseItem.title || undefined };
    }
  }

  if (caseItem.rcicId) {
    const rcic = await prisma.rCIC.findUnique({
      where: { id: caseItem.rcicId },
      select: { email: true },
    });
    if (rcic?.email) {
      return { email: rcic.email, caseTitle: caseItem.title || undefined };
    }
  }

  return null;
}
