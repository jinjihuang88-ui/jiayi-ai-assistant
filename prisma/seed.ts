import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建测试 RCIC 顾问账户
  const rcic = await prisma.rCIC.upsert({
    where: { email: 'rcic@example.com' },
    update: {},
    create: {
      email: 'rcic@example.com',
      name: '张顾问',
      licenseNo: 'R123456',
      phone: '+1 604-123-4567',
      isActive: true,
      isOnline: false,
    },
  });

  console.log('创建 RCIC 顾问:', rcic);

  // 创建第二个测试顾问
  const rcic2 = await prisma.rCIC.upsert({
    where: { email: 'consultant@example.com' },
    update: {},
    create: {
      email: 'consultant@example.com',
      name: '李移民',
      licenseNo: 'R789012',
      phone: '+1 416-987-6543',
      isActive: true,
      isOnline: false,
    },
  });

  console.log('创建 RCIC 顾问:', rcic2);

  console.log('数据库初始化完成!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
