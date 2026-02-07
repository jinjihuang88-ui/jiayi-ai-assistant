import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 会员端消息：左侧联系人列表（顾问或文案/操作员，可能 N 个）。
 * 按「人」聚合：有指派文案/操作员时显示文案/操作员，否则显示顾问。
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const cases = await prisma.case.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        rcic: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            profilePhoto: true,
            consultantType: true,
            organization: true,
            isOnline: true,
          },
        },
      },
    });

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

    for (const c of cases) {
      if (!c.rcicId) continue;
      const contactKey = c.assignedTeamMemberId
        ? `team_${c.assignedTeamMemberId}`
        : `rcic_${c.rcicId}`;
      if (byContact.has(contactKey)) {
        byContact.get(contactKey)!.caseIds.push(c.id);
      } else {
        if (c.assignedTeamMemberId) {
          const member = await prisma.rCICTeamMember.findUnique({
            where: { id: c.assignedTeamMemberId },
            select: { id: true, name: true },
          });
          byContact.set(contactKey, {
            contactId: contactKey,
            name: member?.name ?? "文案/操作员",
            type: "team_member",
            typeLabel: "文案/操作员",
            caseIds: [c.id],
          });
        } else {
          byContact.set(contactKey, {
            contactId: contactKey,
            name: c.rcic?.name ?? "顾问",
            type: "rcic",
            typeLabel:
              c.rcic?.consultantType === "A"
                ? "持牌顾问"
                : c.rcic?.consultantType === "B"
                  ? "留学顾问"
                  : "顾问",
            caseIds: [c.id],
            avatar: c.rcic?.avatar ?? c.rcic?.profilePhoto,
            isOnline: c.rcic?.isOnline ?? false,
          });
        }
      }
    }

    const contacts = Array.from(byContact.values());
    return NextResponse.json({ success: true, contacts });
  } catch (e) {
    console.error("[member/messages/contacts]", e);
    return NextResponse.json(
      { success: false, message: "获取联系人失败" },
      { status: 500 }
    );
  }
}
