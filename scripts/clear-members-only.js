/**
 * 仅删除会员注册信息：users + verification_tokens
 * cases/messages 会随 User 级联删除。不删除顾问(RCIC)等。
 * 用法：在项目根目录执行 node scripts/clear-members-only.js（需已配置 DATABASE_URL）
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('正在删除会员注册信息（users + verification_tokens）...');

  const vt = await prisma.verificationToken.deleteMany({});
  console.log('  已删除 verification_tokens:', vt.count);

  const u = await prisma.user.deleteMany({});
  console.log('  已删除 users (会员):', u.count);

  console.log('完成。会员及验证令牌已清空。');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
