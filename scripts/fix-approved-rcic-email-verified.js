const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.rCIC.updateMany({
    where: {
      approvalStatus: 'approved',
      emailVerified: false,
    },
    data: { emailVerified: true },
  });
  console.log('已将为已通过审核但未标邮箱已验证的 RCIC 设为已验证，数量:', result.count);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
