const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始清理数据库...');
  console.log('');
  
  try {
    // 按依赖顺序删除（先删除有外键关联的表）
    const messageCount = await prisma.message.deleteMany({});
    console.log(`✓ Message 表已清空 (删除了 ${messageCount.count} 条记录)`);
    
    const caseCount = await prisma.case.deleteMany({});
    console.log(`✓ Case 表已清空 (删除了 ${caseCount.count} 条记录)`);
    
    const rcicCount = await prisma.rCIC.deleteMany({});
    console.log(`✓ RCIC 表已清空 (删除了 ${rcicCount.count} 条记录)`);
    
    const userCount = await prisma.user.deleteMany({});
    console.log(`✓ User 表已清空 (删除了 ${userCount.count} 条记录)`);
    
    console.log('');
    console.log('✅ 数据库清理完成！');
    console.log('');
    console.log('📝 下一步：运行数据库迁移');
    console.log('   npx prisma migrate dev --name add_rcic_verification_fields');
  } catch (error) {
    console.error('');
    console.error('❌ 清理失败:', error.message);
    console.error('');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ 发生错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
