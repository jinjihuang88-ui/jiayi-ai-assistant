import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * 团队端消息：左侧联系人 = 会员列表（分配给该文案/操作员的案件对应的用户，可能 N 个）。
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("team_member_session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const session = await prisma.rCICTeamMemberSession.findUnique({
      where: { token: sessionToken },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, message: "会话已过期" }, { status: 401 });
    }

    const member = await prisma.rCICTeamMember.findUnique({
      where: { id: session.memberId },
    });

    if (!member) {
      return NextResponse.json({ success: false, message: "团队成员不存在" }, { status: 404 });
    }

    const cases = await prisma.case.findMany({
      where: { assignedTeamMemberId: member.id },
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
    console.error("[team/messages/contacts]", e);
    return NextResponse.json(
      { success: false, message: "获取联系人失败" },
      { status: 500 }
    );
  }
}
