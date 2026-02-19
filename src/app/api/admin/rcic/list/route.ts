import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");

    if (!adminToken || adminToken.value !== "authenticated") {
      return NextResponse.json(
        {
          success: false,
          message: "未授权访问",
        },
        { status: 401 }
      );
    }

    // 获取所有顾问，按创建时间倒序（profileViewCount 用 raw 查，兼容未 regenerate 的情况）
    const consultants = await prisma.rCIC.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        consultantType: true,
        country: true,
        city: true,
        organization: true,
        licenseNumber: true,
        idDocument: true,
        licenseDocument: true,
        experienceProof: true,
        yearsOfExperience: true,
        bio: true,
        approvalStatus: true,
        approvalNotes: true,
        emailVerified: true,
        createdAt: true,
        wechatUserId: true,
      },
    });

    let viewCountMap: Record<string, number> = {};
    try {
      const rows = await prisma.$queryRaw<{ id: string; profileViewCount?: number; profileviewcount?: number }[]>`
        SELECT id, profileViewCount FROM rcics
      `;
      rows.forEach((r) => {
        const count = r.profileViewCount ?? (r as Record<string, unknown>).profileviewcount;
        viewCountMap[r.id] = Number(count) || 0;
      });
    } catch (_) {
      // 表尚未有 profileViewCount 列时忽略
    }

    const consultantsWithViews = consultants.map((c) => ({
      ...c,
      profileViewCount: viewCountMap[c.id] ?? 0,
    }));

    return NextResponse.json({
      success: true,
      consultants: consultantsWithViews,
    });
  } catch (error) {
    console.error("Failed to fetch consultants:", error);
    return NextResponse.json(
      {
        success: false,
        message: "获取顾问列表失败",
      },
      { status: 500 }
    );
  }
}
