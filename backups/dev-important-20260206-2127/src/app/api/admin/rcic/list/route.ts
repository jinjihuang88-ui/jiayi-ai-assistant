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

    // 获取所有顾问，按创建时间倒序
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
      },
    });

    return NextResponse.json({
      success: true,
      consultants,
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
