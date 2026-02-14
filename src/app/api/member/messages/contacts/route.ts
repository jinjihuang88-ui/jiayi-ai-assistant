import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRcicEffectivelyOnline } from "@/lib/rcic-online";

/**
 * 会员端消息：左侧联系人列表。
 * 业务规则：
 * - 已签约：仅显示签约顾问（有 Case 且 contractedAt 非空的顾问）一人，且不可再选其他顾问。
 * - 未签约：仅显示当前选中的顾问（assignedRcicId）一人；用户改选顾问后只显示新顾问，不保留历史。
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const byContact = new Map<
      string,
      {
        contactId: string;
        name: string;
        type: "rcic" | "team_member";
        typeLabel: string;
        caseIds: string[];
        avatar?: string | null;
        isOnline?: boolean;
      }
    >();

    // 1）是否已签约：存在任意 Case 的 contractedAt 非空
    const contractedCase = await prisma.case.findFirst({
      where: {
        userId: user.id,
        contractedAt: { not: null },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        rcic: {
          select: {
            id: true,
            name: true,
            avatar: true,
            profilePhoto: true,
            consultantType: true,
            isOnline: true,
            lastActiveAt: true,
          },
        },
      },
    });

    if (contractedCase?.rcicId && contractedCase.rcic) {
      // 已签约：只显示签约顾问（或该案件指派的文案/操作员）
      const contactKey = contractedCase.assignedTeamMemberId
        ? `team_${contractedCase.assignedTeamMemberId}`
        : `rcic_${contractedCase.rcicId}`;
      if (contractedCase.assignedTeamMemberId) {
        const member = await prisma.rCICTeamMember.findUnique({
          where: { id: contractedCase.assignedTeamMemberId },
          select: { id: true, name: true },
        });
        byContact.set(contactKey, {
          contactId: contactKey,
          name: member?.name ?? "文案/操作员",
          type: "team_member",
          typeLabel: "文案/操作员",
          caseIds: [contractedCase.id],
        });
      } else {
        byContact.set(contactKey, {
          contactId: contactKey,
          name: contractedCase.rcic.name,
          type: "rcic",
          typeLabel:
            contractedCase.rcic.consultantType === "A"
              ? "持牌顾问"
              : contractedCase.rcic.consultantType === "B"
                ? "留学顾问"
                : "顾问",
          caseIds: [contractedCase.id],
          avatar: contractedCase.rcic.avatar ?? contractedCase.rcic.profilePhoto,
          isOnline: isRcicEffectivelyOnline(contractedCase.rcic.isOnline ?? false, contractedCase.rcic.lastActiveAt ?? null),
        });
      }
      // 若有多条已签约案件（同一顾问），把 caseIds 都归到同一联系人
      const otherContracted = await prisma.case.findMany({
        where: {
          userId: user.id,
          contractedAt: { not: null },
          id: { not: contractedCase.id },
        },
        select: { id: true, rcicId: true, assignedTeamMemberId: true },
      });
      for (const c of otherContracted) {
        const key = c.assignedTeamMemberId
          ? `team_${c.assignedTeamMemberId}`
          : `rcic_${c.rcicId}`;
        if (byContact.has(key)) byContact.get(key)!.caseIds.push(c.id);
      }
    } else {
      // 2）未签约：只显示当前选中的顾问（assignedRcicId）一人
      const userWithRcic = await prisma.user.findUnique({
        where: { id: user.id },
        select: { assignedRcicId: true },
      });
      if (userWithRcic?.assignedRcicId) {
        const rcic = await prisma.rCIC.findUnique({
          where: { id: userWithRcic.assignedRcicId },
          select: {
            id: true,
            name: true,
            avatar: true,
            profilePhoto: true,
            consultantType: true,
            isOnline: true,
            lastActiveAt: true,
          },
        });
        if (rcic) {
          const key = `rcic_${rcic.id}`;
          const caseIds = await prisma.case
            .findMany({
              where: {
                userId: user.id,
                rcicId: rcic.id,
                contractedAt: null, // 未签约只看咨询案件
              },
              select: { id: true },
              orderBy: { updatedAt: "desc" },
            })
            .then((rows) => rows.map((r) => r.id));
          byContact.set(key, {
            contactId: key,
            name: rcic.name,
            type: "rcic",
            typeLabel:
              rcic.consultantType === "A"
                ? "持牌顾问"
                : rcic.consultantType === "B"
                  ? "留学顾问"
                  : "顾问",
            caseIds,
            avatar: rcic.avatar ?? rcic.profilePhoto,
            isOnline: isRcicEffectivelyOnline(rcic.isOnline ?? false, rcic.lastActiveAt ?? null),
          });
        }
      }
    }

    const contacts = Array.from(byContact.values());
    const contracted = !!(contractedCase?.rcicId && contractedCase.rcic);
    return NextResponse.json({ success: true, contacts, contracted });
  } catch (e) {
    console.error("[member/messages/contacts]", e);
    return NextResponse.json(
      { success: false, message: "获取联系人失败" },
      { status: 500 }
    );
  }
}
