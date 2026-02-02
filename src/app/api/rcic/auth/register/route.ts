import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      nameCn,
      nameEn,
      idDocumentUrl,
      country,
      city,
      phone,
      level,
      licenseNo,
      organization,
      verificationLink,
      licenseCertificateUrl,
      yearsOfExperience,
      serviceScope,
      pastCases,
      specialties,
      workExperience,
    } = body;

    console.log("[RCIC Register] Received:", { email, nameCn, nameEn, level });

    // 基础字段验证
    if (!email || !password || !nameCn || !nameEn || !idDocumentUrl || !country || !city || !phone || !level) {
      return NextResponse.json(
        { success: false, message: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // A类顾问验证
    if (level === "A") {
      if (!licenseNo || !verificationLink || !licenseCertificateUrl) {
        return NextResponse.json(
          { success: false, message: "A类顾问必须填写执照号、查询链接并上传执照证书" },
          { status: 400 }
        );
      }
    }

    // B类顾问验证
    if (level === "B") {
      if (!yearsOfExperience || !serviceScope || !pastCases) {
        return NextResponse.json(
          { success: false, message: "B类顾问必须填写从业年限、服务范围和过往案例" },
          { status: 400 }
        );
      }
    }

    // C类顾问验证
    if (level === "C") {
      if (!specialties || !workExperience) {
        return NextResponse.json(
          { success: false, message: "C类顾问必须填写擅长领域和工作经验" },
          { status: 400 }
        );
      }
    }

    // 动态导入 Prisma 和 bcrypt
    const { PrismaClient } = await import("@prisma/client");
    const bcrypt = await import("bcryptjs");
    const prisma = new PrismaClient();

    try {
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
          name: nameCn, // 主要显示中文名
          nameEn,
          idDocumentUrl,
          country,
          city,
          phone,
          level,
          // A类字段
          licenseNo: level === "A" ? licenseNo : null,
          organization: level === "A" ? organization : null,
          verificationLink: level === "A" ? verificationLink : null,
          licenseCertificateUrl: level === "A" ? licenseCertificateUrl : null,
          // B类字段
          yearsOfExperience: level === "B" ? yearsOfExperience : null,
          serviceScope: level === "B" ? serviceScope : null,
          pastCases: level === "B" ? pastCases : null,
          // C类字段
          specialties: level === "C" ? specialties : null,
          workExperience: level === "C" ? workExperience : null,
          // 审核状态
          verificationStatus: "pending", // 待审核
          isActive: false, // 未激活，需要审核通过
        },
      });

      console.log("[RCIC Register] RCIC created (pending verification):", rcic.id);

      return NextResponse.json({
        success: true,
        message: "注册成功，请等待管理员审核",
        rcic: {
          id: rcic.id,
          email: rcic.email,
          name: rcic.name,
          level: rcic.level,
          verificationStatus: rcic.verificationStatus,
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error("[RCIC Register] Error:", error);
    return NextResponse.json(
      { success: false, message: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
