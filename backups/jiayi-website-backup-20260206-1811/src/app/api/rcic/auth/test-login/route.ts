import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// 动态导入 prisma，避免构建时错误
let prisma: any;
try {
  prisma = require("@/lib/prisma").default;
} catch (error) {
  console.error("Failed to load prisma:", error);
}

// 测试模式：RCIC免登录API
export async function POST(request: NextRequest) {
  console.log("=== RCIC Test Login API Called ===");
  
  try {
    const body = await request.json();
    console.log("Request body:", body);
    
    const { email } = body;

    if (!email) {
      console.log("Error: Email is empty");
      return NextResponse.json(
        { success: false, message: "邮箱不能为空" },
        { status: 400 }
      );
    }

    console.log("Email:", email);

    // 检查 prisma 是否可用
    if (!prisma) {
      console.error("Prisma is not available");
      return NextResponse.json(
        { success: false, message: "数据库连接失败" },
        { status: 500 }
      );
    }

    console.log("Checking if RCIC exists...");
    
    // 查找或创建顾问
    let rcic = await prisma.rCIC.findUnique({
      where: { email },
    });

    console.log("RCIC found:", rcic ? "Yes" : "No");

    if (!rcic) {
      console.log("Creating new RCIC...");
      // 自动创建测试顾问（默认A类持牌顾问）
      rcic = await prisma.rCIC.create({
        data: {
          email,
          name: `测试顾问_${email.split("@")[0]}`,
          level: "A",
          licenseNo: `TEST-${Math.floor(Math.random() * 100000)}`,
          isActive: true, // 测试模式直接激活
          lastActiveAt: new Date(),
        },
      });
      console.log("RCIC created:", rcic.id);
    } else {
      console.log("Updating existing RCIC...");
      // 更新最后活跃时间
      await prisma.rCIC.update({
        where: { id: rcic.id },
        data: { 
          lastActiveAt: new Date(),
          isActive: true, // 确保激活状态
        },
      });
      console.log("RCIC updated");
    }

    console.log("Creating RCIC session...");
    
    // 创建会话
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天有效期

    await prisma.rCICSession.create({
      data: {
        rcicId: rcic.id,
        token,
        expiresAt,
        userAgent: request.headers.get("user-agent") || undefined,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      },
    });

    console.log("RCIC session created, setting cookie...");

    // 设置 Cookie
    const cookieStore = await cookies();
    cookieStore.set("rcic_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    console.log("RCIC login successful!");

    return NextResponse.json({
      success: true,
      message: "登录成功",
      rcic: {
        id: rcic.id,
        email: rcic.email,
        name: rcic.name,
        level: rcic.level,
        licenseNo: rcic.licenseNo,
      },
    });
  } catch (error: any) {
    console.error("=== RCIC Test Login Error ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error details:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "登录失败：" + (error.message || "未知错误"),
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
