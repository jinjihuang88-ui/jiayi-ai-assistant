import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ProfilePayload = {
  familyName?: string;
  givenName?: string;
  gender?: string;
  dateOfBirth?: string;
  countryOfBirth?: string;
  nationality?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  passportNumber?: string;
  passportCountry?: string;
  passportExpiry?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
};

function parseProfileJson(json: string | null): ProfilePayload | null {
  if (!json || !json.trim()) return null;
  try {
    return JSON.parse(json) as ProfilePayload;
  } catch {
    return null;
  }
}

/** 获取当前用户及个人资料 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }
    const profile = parseProfileJson(user.profileJson ?? null);
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      profile: profile ?? {},
    });
  } catch (e) {
    console.error("[member/profile GET]", e);
    return NextResponse.json({ success: false, message: "获取失败" }, { status: 500 });
  }
}

/** 保存个人资料 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }
    const body = await request.json();
    const { name, phone, profile: profileInput } = body as {
      name?: string;
      phone?: string;
      profile?: ProfilePayload;
    };
    const updates: { name?: string; phone?: string; profileJson?: string } = {};
    if (typeof name === "string") updates.name = name;
    if (typeof phone === "string") updates.phone = phone;
    if (profileInput != null && typeof profileInput === "object") {
      const existing = parseProfileJson(user.profileJson ?? null) ?? {};
      updates.profileJson = JSON.stringify({ ...existing, ...profileInput });
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: "无有效更新" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });
    return NextResponse.json({ success: true, message: "保存成功" });
  } catch (e) {
    console.error("[member/profile PUT]", e);
    return NextResponse.json({ success: false, message: "保存失败" }, { status: 500 });
  }
}
