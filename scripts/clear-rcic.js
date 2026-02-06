const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('清理 RCIC 顾问数据...');
  const sessionCount = await prisma.rCICSession.deleteMany({});
  console.log('✓ rcic_sessions 已清空 (' + sessionCount.count + ' 条)');
  const rcicCount = await prisma.rCIC.deleteMany({});
  console.log('✓ rcics（移民顾问）已清空 (' + rcicCount.count + ' 条)');
  console.log('完成。可重新注册顾问。');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
