import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      code,
      consultantLevel,
      nameCn,
      nameEn,
      phone,
      country,
      city,
      rcicNumber,
      organization,
      verificationLink,
      yearsOfExperience,
      serviceScope,
      idDocumentUrl,
    } = await request.json();

    // 基础验证
    if (!email || !password || !code || !consultantLevel || !nameCn || !nameEn || !phone || !country || !city) {
      return NextResponse.json(
        { success: false, message: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // 验证验证码
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email: email.toLowerCase(),
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, message: "验证码无效或已过期" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const existingConsultant = await prisma.rCIC.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingConsultant) {
      return NextResponse.json(
        { success: false, message: "该邮箱已注册" },
        { status: 400 }
      );
    }

    // A类顾问验证
    if (consultantLevel === "A" && (!rcicNumber || !verificationLink)) {
      return NextResponse.json(
        { success: false, message: "A类顾问必须提供RCIC编号和验证链接" },
        { status: 400 }
      );
    }

    // B类顾问验证
    if (consultantLevel === "B" && (!yearsOfExperience || !serviceScope)) {
      return NextResponse.json(
        { success: false, message: "B类顾问必须提供从业年限和服务范围说明" },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建顾问账号（待审核状态）
    const consultant = await prisma.rCIC.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: nameCn,
        nameEn,
        phone,
        country,
        city,
        level: consultantLevel,
        licenseNo: consultantLevel === "A" ? rcicNumber : undefined,
        organization: consultantLevel === "A" ? organization : undefined,
        verificationLink: consultantLevel === "A" ? verificationLink : undefined,
        yearsOfExperience: consultantLevel === "B" ? yearsOfExperience : undefined,
        serviceScope: consultantLevel === "B" ? serviceScope : undefined,
        idDocumentUrl,
        isActive: false, // 待审核，默认不激活
      },
    });

    // 删除已使用的验证码
    await prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    });

    return NextResponse.json({
      success: true,
      message: "注册申请已提交，请等待审核",
      consultantId: consultant.id,
    });
  } catch (error) {
    console.error("RCIC register error:", error);
    return NextResponse.json(
      { success: false, message: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
