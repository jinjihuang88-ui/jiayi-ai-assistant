import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建测试 RCIC 顾问账户（A类持牌顾问）
  const password1 = await bcrypt.hash('password123', 10);
  const rcic = await prisma.rCIC.upsert({
    where: { email: 'rcic@example.com' },
    update: {},
    create: {
      email: 'rcic@example.com',
      password: password1,
      name: '张顾问',
      nameEn: 'Zhang Consultant',
      licenseNo: 'R123456',
      phone: '+1 604-123-4567',
      idDocumentUrl: '/uploads/default-id.jpg',
      country: 'Canada',
      city: 'Vancouver',
      level: 'A',
      organization: 'ABC Immigration Services',
      verificationLink: 'https://college-ic.ca/protecting-the-public/find-an-immigration-consultant',
      licenseCertificateUrl: '/uploads/default-license.jpg',
      verificationStatus: 'approved',
      isActive: true,
    },
  });

  console.log('创建 RCIC 顾问:', rcic);

  // 创建第二个测试顾问（B类留学顾问）
  const password2 = await bcrypt.hash('password123', 10);
  const rcic2 = await prisma.rCIC.upsert({
    where: { email: 'consultant@example.com' },
    update: {},
    create: {
      email: 'consultant@example.com',
      password: password2,
      name: '李移民',
      nameEn: 'Li Immigration',
      phone: '+1 416-987-6543',
      idDocumentUrl: '/uploads/default-id.jpg',
      country: 'Canada',
      city: 'Toronto',
      level: 'B',
      yearsOfExperience: '5-10年',
      serviceScope: '留学申请、学签续签、工签申请',
      pastCases: '成功办理超过500个留学案例，包括加拿大各大院校申请',
      verificationStatus: 'approved',
      isActive: true,
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
