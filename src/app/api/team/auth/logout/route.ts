import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("team_member_session_token")?.value;

    if (sessionToken) {
      // 删除session
      await prisma.rCICTeamMemberSession.deleteMany({
        where: { token: sessionToken },
      });
    }

    // 清除cookie
    cookieStore.delete("team_member_session_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("退出登录失败:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
