import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      phone,
      consultantType,
      country,
      city,
      idDocument,
      licenseNumber,
      organization,
      licenseDocument,
      yearsOfExperience,
      experienceProof,
      bio,
    } = body;

    // 查找现有顾问
    const existingConsultant = await prisma.rCIC.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!existingConsultant) {
      return NextResponse.json(
        {
          success: false,
          message: "账号不存在",
        },
        { status: 404 }
      );
    }

    // 只允许被拒绝的顾问重新提交
    if (existingConsultant.approvalStatus !== "rejected") {
      return NextResponse.json(
        {
          success: false,
          message: "只有被拒绝的申请才能重新提交",
        },
        { status: 400 }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, existingConsultant.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "密码错误",
        },
        { status: 401 }
      );
    }

    // 更新顾问信息并重置审核状态
    await prisma.rCIC.update({
      where: { id: existingConsultant.id },
      data: {
        name,
        phone,
        consultantType,
        country,
        city,
        idDocument,
        licenseNumber: licenseNumber || null,
        organization: organization || null,
        licenseDocument: licenseDocument || null,
        yearsOfExperience: yearsOfExperience || null,
        experienceProof: experienceProof || null,
        bio: bio || null,
        approvalStatus: "pending", // 重置为待审核
        approvalNotes: null, // 清除之前的审核备注
        approvedAt: null,
        approvedBy: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "重新提交成功，请等待审核",
    });
  } catch (error) {
    console.error("Resubmit error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "重新提交失败",
      },
      { status: 500 }
    );
  }
}
