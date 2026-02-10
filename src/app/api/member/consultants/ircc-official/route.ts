import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "未登录" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region")?.trim() || undefined;

    const where = region ? { region } : {};

    const list = await prisma.iRCCConsultant.findMany({
      where,
      orderBy: [{ region: "asc" }, { licenseNumber: "asc" }],
    });

    const consultants = list.map((c) => ({
      id: c.id,
      licenseNumber: c.licenseNumber,
      registrationStatus: c.registrationStatus,
      companyAddress: c.companyAddress,
      region: c.region,
      websiteUrl: c.websiteUrl,
      name: c.name,
    }));

    const regions = await prisma.iRCCConsultant.findMany({
      select: { region: true },
      where: { region: { not: null } },
      distinct: ["region"],
      orderBy: { region: "asc" },
    });
    const regionOptions = regions
      .map((r) => r.region)
      .filter((r): r is string => !!r);

    return NextResponse.json({
      success: true,
      consultants,
      regionOptions,
      total: consultants.length,
    });
  } catch (error) {
    console.error("[IRCC Official Consultants] Error:", error);
    return NextResponse.json(
      { success: false, message: "获取 IRCC 官方名录失败" },
      { status: 500 }
    );
  }
}
