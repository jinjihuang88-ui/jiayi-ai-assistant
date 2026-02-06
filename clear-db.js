const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始清理数据库（用户 + 移民顾问 + 相关数据）...');
  console.log('');
  
  try {
    // 按外键依赖顺序删除
    const messageCount = await prisma.message.deleteMany({});
    console.log(`✓ messages 已清空 (${messageCount.count} 条)`);
    
    const caseCount = await prisma.case.deleteMany({});
    console.log(`✓ cases 已清空 (${caseCount.count} 条)`);
    
    const sessionCount = await prisma.rCICSession.deleteMany({});
    console.log(`✓ rcic_sessions 已清空 (${sessionCount.count} 条)`);
    
    const rcicCount = await prisma.rCIC.deleteMany({});
    console.log(`✓ rcics（移民顾问）已清空 (${rcicCount.count} 条)`);
    
    const userCount = await prisma.user.deleteMany({});
    console.log(`✓ users（用户）已清空 (${userCount.count} 条)`);
    
    const tokenCount = await prisma.verificationToken.deleteMany({});
    console.log(`✓ verification_tokens 已清空 (${tokenCount.count} 条)`);
    
    console.log('');
    console.log('✅ 清理完成！可重新注册用户和顾问进行测试。');
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
