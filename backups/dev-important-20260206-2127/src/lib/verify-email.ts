// 服务端邮箱验证逻辑，供 /auth/verify 页面和 API 共用
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';

export type VerifyResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function verifyEmailToken(token: string): Promise<VerifyResult> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return { success: false, error: '无效的验证链接' };
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    return { success: false, error: '验证链接已过期，请重新发送验证邮件' };
  }

  if (verificationToken.type !== 'email_verification') {
    return { success: false, error: '链接类型不正确' };
  }

  const email = verificationToken.email;
  const user = await prisma.user.findUnique({ where: { email } });
  const rcic = await prisma.rCIC.findUnique({ where: { email } });

  if (!user && !rcic) {
    return { success: false, error: '账户不存在' };
  }

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    await sendWelcomeEmail(user.email, user.name);
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    return { success: true, message: '邮箱验证成功！现在可以登录了' };
  }

  if (rcic) {
    await prisma.rCIC.update({
      where: { id: rcic.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        approvalStatus:
          rcic.approvalStatus === 'pending' ? 'under_review' : rcic.approvalStatus,
      },
    });
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    return {
      success: true,
      message: '邮箱验证成功！您的账户正在审核中，请耐心等待',
    };
  }

  return { success: false, error: '验证失败' };
}
