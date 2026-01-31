import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { destroyRCICSession } from '@/lib/rcic-auth';

const RCIC_SESSION_COOKIE = 'rcic_session_token';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(RCIC_SESSION_COOKIE)?.value;

    if (token) {
      await destroyRCICSession(token);
    }

    // 删除 cookie
    cookieStore.delete(RCIC_SESSION_COOKIE);

    return NextResponse.json({
      success: true,
      message: '已退出登录',
    });
  } catch (error) {
    console.error('RCIC logout error:', error);
    return NextResponse.json(
      { success: false, message: '退出失败' },
      { status: 500 }
    );
  }
}
