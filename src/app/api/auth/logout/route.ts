import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      // 删除数据库中的会话
      await deleteSession(sessionToken);
    }

    // 清除Cookie
    cookieStore.delete('session_token');

    return NextResponse.json({
      success: true,
      message: '已退出登录',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: '退出失败' },
      { status: 500 }
    );
  }
}
