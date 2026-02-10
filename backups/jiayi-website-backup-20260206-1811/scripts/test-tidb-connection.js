const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const r = await prisma.$queryRawUnsafe('SELECT 1 as ok');
  console.log('TiDB 连接成功:', r);
  const userCount = await prisma.user.count();
  console.log('users 表记录数:', userCount);
  const rcicCount = await prisma.rCIC.count();
  console.log('rcics 表记录数:', rcicCount);
}

main()
  .catch((e) => {
    console.error('连接失败:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
