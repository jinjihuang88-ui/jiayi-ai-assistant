import { cookies } from 'next/headers';
import prisma from './prisma';

// 生成6位数字验证码
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 生成会话Token
export function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 获取当前登录用户
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    
    if (!sessionToken) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// 创建会话
export async function createSession(userId: string, userAgent?: string, ipAddress?: string) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      userAgent,
      ipAddress,
    },
  });

  return session;
}

// 删除会话
export async function deleteSession(token: string) {
  try {
    await prisma.session.delete({
      where: { token },
    });
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

// 清理过期会话
export async function cleanExpiredSessions() {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

// 申请状态映射
export const applicationStatusMap: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: '草稿', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  submitted: { label: '已提交', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  under_review: { label: '审核中', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  needs_revision: { label: '需修改', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  approved: { label: '已通过', color: 'text-green-600', bgColor: 'bg-green-100' },
  rejected: { label: '已拒绝', color: 'text-red-600', bgColor: 'bg-red-100' },
};

// 申请类型映射
export const applicationTypeMap: Record<string, { name: string; icon: string; color: string }> = {
  'study-permit': { name: '学习签证', icon: '🎓', color: 'from-blue-500 to-cyan-500' },
  'visitor-visa': { name: '访客签证', icon: '✈️', color: 'from-green-500 to-emerald-500' },
  'work-permit': { name: '工作签证', icon: '💼', color: 'from-purple-500 to-pink-500' },
  'express-entry': { name: 'EE技术移民', icon: '🚀', color: 'from-indigo-500 to-blue-500' },
  'provincial-nominee': { name: '省提名项目', icon: '🏛️', color: 'from-orange-500 to-red-500' },
};

// 通知类型映射
export const notificationTypeMap: Record<string, { icon: string; color: string }> = {
  status_change: { icon: '📋', color: 'text-blue-500' },
  message: { icon: '💬', color: 'text-green-500' },
  reminder: { icon: '⏰', color: 'text-yellow-500' },
  system: { icon: '🔔', color: 'text-gray-500' },
};
