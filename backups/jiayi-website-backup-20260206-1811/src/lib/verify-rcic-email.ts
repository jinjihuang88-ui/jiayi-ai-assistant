// RCIC 邮箱验证（服务端一次完成，国内可访问）
import { prisma } from '@/lib/prisma';

export type VerifyRCICResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function verifyRCICEmailToken(token: string): Promise<VerifyRCICResult> {
  const trimmed = token?.trim();
  if (!trimmed) return { success: false, error: "验证链接无效或已过期" };

  const rcic = await prisma.rCIC.findFirst({
    where: {
      verificationToken: trimmed,
      verificationTokenExpiry: { gte: new Date() },
    },
  });

  if (!rcic) {
    return { success: false, error: '验证链接无效或已过期' };
  }

  await prisma.rCIC.update({
    where: { id: rcic.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  return { success: true, message: '邮箱验证成功！您的申请已提交审核，请等待管理员审核通过。' };
}
