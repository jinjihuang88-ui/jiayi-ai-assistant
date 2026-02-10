import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 200 }
      );
    }

    let profile: { familyName?: string | null; givenName?: string | null } | null = null;
    const raw = (user as { profileJson?: string | null }).profileJson;
    if (raw) {
      try {
        profile = JSON.parse(raw) as { familyName?: string | null; givenName?: string | null };
      } catch {
        profile = null;
      }
    }
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        profile: profile ? { familyName: profile.familyName ?? null, givenName: profile.givenName ?? null } : null,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, message: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
