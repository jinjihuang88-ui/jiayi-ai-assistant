import { NextResponse } from "next/server";
import { getCurrentRCIC } from "@/lib/rcic-auth";
import { prisma } from "@/lib/prisma";

/**
 * 顾问端消息：左侧联系人 = 会员列表（与该顾问有案件的用户，可能 N 个）。
 */
export async function GET() {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const cases = await prisma.case.findMany({
      where: { rcicId: rcic.id },
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    const byUser = new Map<
      string,
      {
        contactId: string;
        name: string;
        email: string;
        avatar?: string | null;
        caseIds: string[];
      }
    >();

    for (const c of cases) {
      const uid = c.userId;
      const contactId = `member_${uid}`;
      if (byUser.has(contactId)) {
        byUser.get(contactId)!.caseIds.push(c.id);
      } else {
        byUser.set(contactId, {
          contactId,
          name: c.user?.name ?? c.user?.email ?? "会员",
          email: c.user?.email ?? "",
          avatar: c.user?.avatar ?? null,
          caseIds: [c.id],
        });
      }
    }

    const contacts = Array.from(byUser.values());
    return NextResponse.json({ success: true, contacts });
  } catch (e) {
    console.error("[rcic/messages/contacts]", e);
    return NextResponse.json(
      { success: false, message: "获取联系人失败" },
      { status: 500 }
    );
  }
}
