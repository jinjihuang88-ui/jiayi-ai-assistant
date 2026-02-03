import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      phone,
      consultantType, // A, B, C
      licenseNumber,
      idDocument,
      licenseDocument,
      experienceProof,
      country,
      city,
      organization,
      bio,
      yearsOfExperience,
    } = body;

    console.log("[RCIC Register] Received:", { email, name, consultantType });

    // 基础字段验证
    if (!email || !password || !name || !phone || !consultantType || !idDocument || !country || !city) {
      return NextResponse.json(
        { success: false, message: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // A类顾问验证
    if (consultantType === "A") {
      if (!licenseNumber || !licenseDocument || !organization) {
        return NextResponse.json(
          { success: false, message: "A类顾问必须填写执照号、上传执照证书并填写执业机构" },
          { status: 400 }
        );
      }
    }

    // B类顾问验证
    if (consultantType === "B") {
      if (!yearsOfExperience || !experienceProof) {
        return NextResponse.json(
          { success: false, message: "B类顾问必须填写从业年限并上传从业证明" },
          { status: 400 }
        );
      }
    }

    // C类顾问验证
    if (consultantType === "C") {
      if (!bio) {
        return NextResponse.json(
          { success: false, message: "C类顾问必须填写个人简介" },
          { status: 400 }
        );
      }
    }

    // 检查邮箱是否已存在
    const existingRCIC = await prisma.rCIC.findUnique({
      where: { email },
    });

    if (existingRCIC) {
      return NextResponse.json(
        { success: false, message: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建顾问账号（待审核状态）
    const rcic = await prisma.rCIC.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        consultantType,
        country,
        city,
        bio,
        // A类字段
        licenseNumber: consultantType === "A" ? licenseNumber : null,
        licenseNo: consultantType === "A" ? licenseNumber : null, // 兼容字段
        organization: consultantType === "A" ? organization : null,
        idDocument,
        licenseDocument: consultantType === "A" ? licenseDocument : null,
        // B类字段
        yearsOfExperience: consultantType === "B" ? parseInt(yearsOfExperience) : null,
        experienceProof: consultantType === "B" ? experienceProof : null,
        // 审核状态
        approvalStatus: "pending", // 待审核
        emailVerified: false, // 需要邮箱验证
      },
    });

    console.log("[RCIC Register] RCIC created (pending verification):", rcic.id);

    // TODO: 发送邮箱验证邮件

    return NextResponse.json({
      success: true,
      message: "注册成功，请查收验证邮件并等待管理员审核",
      rcic: {
        id: rcic.id,
        email: rcic.email,
        name: rcic.name,
        consultantType: rcic.consultantType,
        approvalStatus: rcic.approvalStatus,
      },
    });
  } catch (error) {
    console.error("[RCIC Register] Error:", error);
    return NextResponse.json(
      { success: false, message: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
