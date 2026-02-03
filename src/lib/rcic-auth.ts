import { cookies } from 'next/headers';
import { prisma } from './prisma';

const RCIC_SESSION_COOKIE = 'rcic_session_token';
const SESSION_EXPIRY_DAYS = 7;

export interface RCICUser {
  id: string;
  email: string;
  name: string;
  licenseNo: string | null; // 修改：改为可选，因为B类和C类顾问可能没有RCIC执照
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  isOnline: boolean;
  level?: string | null; // 新增：顾问等级
}

// 获取当前登录的顾问
export async function getCurrentRCIC(): Promise<RCICUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(RCIC_SESSION_COOKIE)?.value;

    if (!token) return null;

    const session = await prisma.rCICSession.findUnique({
      where: { token },
      include: { rcic: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    // 更新最后活跃时间
    await prisma.rCIC.update({
      where: { id: session.rcic.id },
      data: { lastActiveAt: new Date(), isOnline: true },
    });

    return {
      id: session.rcic.id,
      email: session.rcic.email,
      name: session.rcic.name,
      licenseNo: session.rcic.licenseNo, // 现在可以是 null
      phone: session.rcic.phone,
      avatar: session.rcic.avatar,
      isActive: session.rcic.isActive,
      isOnline: session.rcic.isOnline,
      level: session.rcic.level, // 新增：返回顾问等级
    };
  } catch (error) {
    console.error('Get current RCIC error:', error);
    return null;
  }
}

// 创建顾问会话
export async function createRCICSession(rcicId: string, userAgent?: string, ipAddress?: string) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  const session = await prisma.rCICSession.create({
    data: {
      rcicId,
      token,
      expiresAt,
      userAgent,
      ipAddress,
    },
  });

  // 更新顾问在线状态
  await prisma.rCIC.update({
    where: { id: rcicId },
    data: { isOnline: true, lastActiveAt: new Date() },
  });

  return { token, expiresAt };
}

// 销毁顾问会话
export async function destroyRCICSession(token: string) {
  const session = await prisma.rCICSession.findUnique({
    where: { token },
  });

  if (session) {
    await prisma.rCICSession.delete({ where: { token } });

    // 检查是否还有其他活跃会话
    const otherSessions = await prisma.rCICSession.count({
      where: { rcicId: session.rcicId },
    });

    if (otherSessions === 0) {
      await prisma.rCIC.update({
        where: { id: session.rcicId },
        data: { isOnline: false },
      });
    }
  }
}

// 生成随机 token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// 生成验证码
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
