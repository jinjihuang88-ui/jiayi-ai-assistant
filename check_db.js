const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // 检查User表结构
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        assignedRcicId: true,
      }
    });
    
    console.log('User sample:', user);
    
    // 检查是否有用户分配了顾问
    const usersWithRcic = await prisma.user.findMany({
      where: {
        assignedRcicId: { not: null }
      },
      select: {
        id: true,
        email: true,
        assignedRcicId: true,
      }
    });
    
    console.log('Users with assigned RCIC:', usersWithRcic);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
