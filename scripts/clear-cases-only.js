/**
 * 仅清空案件及案件消息，保留会员(User)、顾问(RCIC)等数据，便于重新测试案件流程。
 * 用法：node scripts/clear-cases-only.js（需在项目根目录且已配置 DATABASE_URL）
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('清空案件与案件消息，保留会员和顾问...');

  const msg = await prisma.message.deleteMany({});
  console.log('  已删除 messages:', msg.count);

  const c = await prisma.case.deleteMany({});
  console.log('  已删除 cases:', c.count);

  console.log('完成。会员、顾问数据未动，可重新提交申请测试。');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
