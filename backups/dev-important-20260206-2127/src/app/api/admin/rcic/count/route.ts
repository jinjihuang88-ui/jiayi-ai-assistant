import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");
  if (!adminToken || adminToken.value !== "authenticated") {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const count = await prisma.rCIC.count();
  return NextResponse.json({ success: true, count });
}
