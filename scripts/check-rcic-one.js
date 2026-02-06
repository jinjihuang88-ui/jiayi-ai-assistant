const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const email = process.argv[2] || 'esthercao1976@gmail.com';
const password = process.argv[3] || 'Eh123456';

async function main() {
  const rcic = await prisma.rCIC.findFirst({
    where: { email: email.toLowerCase() },
  });
  if (!rcic) {
    console.log('未找到该邮箱的顾问');
    return;
  }
  console.log('id:', rcic.id);
  console.log('email:', rcic.email);
  console.log('emailVerified:', rcic.emailVerified);
  console.log('approvalStatus:', rcic.approvalStatus);
  console.log('isActive:', rcic.isActive);
  const match = rcic.password ? await bcrypt.compare(password, rcic.password) : false;
  console.log('passwordMatches:', match);
  console.log('canLogin:', rcic.emailVerified && rcic.approvalStatus === 'approved' && rcic.isActive && match);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
