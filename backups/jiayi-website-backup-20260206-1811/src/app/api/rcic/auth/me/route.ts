import { NextResponse } from 'next/server';
import { getCurrentRCIC } from '@/lib/rcic-auth';

export async function GET() {
  try {
    const rcic = await getCurrentRCIC();

    if (!rcic) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    // dashboard页面期期consultant字段，所以同时返回两个
    return NextResponse.json({
      success: true,
      rcic,
      consultant: rcic, // 兼容新dashboard
    });
  } catch (error) {
    console.error('Get current RCIC error:', error);
    return NextResponse.json(
      { success: false, message: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
