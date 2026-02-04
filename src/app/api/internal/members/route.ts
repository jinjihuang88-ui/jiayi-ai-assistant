import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const rcicSession = cookieStore.get("rcic_session_token")?.value;
    const teamSession = cookieStore.get("team_session")?.value;

    let currentUserId: string;
    let currentUserType: "rcic" | "team_member";

    // 验证session
    if (rcicSession) {
      const session = await prisma.rCICSession.findUnique({
        where: { token: rcicSession },
      });

      if (!session || session.expiresAt < new Date()) {
        return NextResponse.json(
          { success: false, error: "会话已过期" },
          { status: 401 }
        );
      }

      currentUserId = session.rcicId;
      currentUserType = "rcic";
    } else if (teamSession) {
      const session = await prisma.rCICTeamMemberSession.findUnique({
        where: { token: teamSession },
      });

      if (!session || session.expiresAt < new Date()) {
        return NextResponse.json(
          { success: false, error: "会话已过期" },
          { status: 401 }
        );
      }

      currentUserId = session.memberId;
      currentUserType = "team_member";
    } else {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    // 获取当前用户所属的RCIC
    let rcicId: string;
    if (currentUserType === "rcic") {
      rcicId = currentUserId;
    } else {
      const member = await prisma.rCICTeamMember.findUnique({
        where: { id: currentUserId },
      });
      if (!member) {
        return NextResponse.json(
          { success: false, error: "用户不存在" },
          { status: 404 }
        );
      }
      rcicId = member.rcicId;
    }

    // 获取该RCIC和所有团队成员
    const rcic = await prisma.rCIC.findUnique({
      where: { id: rcicId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    const teamMembers = await prisma.rCICTeamMember.findMany({
      where: {
        rcicId,
        isActive: true,
        id: { not: currentUserId }, // 排除当前用户
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // 组合所有成员
    const allMembers = [];

    // 如果当前用户不是RCIC，添加RCIC到列表
    if (currentUserType !== "rcic" && rcic) {
      allMembers.push({
        ...rcic,
        userType: "rcic",
        role: "持牌顾问",
      });
    }

    // 添加团队成员
    teamMembers.forEach((member) => {
      allMembers.push({
        ...member,
        userType: "team_member",
        role: member.role === "copywriter" ? "文案" : "操作员",
      });
    });

    return NextResponse.json({
      success: true,
      members: allMembers,
    });
  } catch (error) {
    console.error("获取成员列表失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
