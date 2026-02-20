import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/** 管理后台：查看普通会员列表（只读，不返回密码） */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");
    if (!adminToken || adminToken.value !== "authenticated") {
      return NextResponse.json({ success: false, message: "未授权访问" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        emailVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        assignedRcicId: true,
        profileJson: true,
        createdAt: true,
        updatedAt: true,
        assignedRcic: { select: { id: true, name: true, email: true } },
      },
    });

    const members = users.map((u) => {
      const { assignedRcic, ...rest } = u;
      return {
        ...rest,
        assignedRcicName: assignedRcic?.name ?? null,
        assignedRcicEmail: assignedRcic?.email ?? null,
      };
    });

    return NextResponse.json({ success: true, members });
  } catch (error) {
    console.error("[admin/members]", error);
    return NextResponse.json({ success: false, message: "获取会员列表失败" }, { status: 500 });
  }
}
