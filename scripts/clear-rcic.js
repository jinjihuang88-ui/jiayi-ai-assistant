const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('清理持牌顾问、文案、操作员数据（普通会员不删）...');

  const tmSessionCount = await prisma.rCICTeamMemberSession.deleteMany({});
  console.log('✓ rcic_team_member_sessions 已清空 (' + tmSessionCount.count + ' 条)');

  const tmCount = await prisma.rCICTeamMember.deleteMany({});
  console.log('✓ rcic_team_members（文案/操作员）已清空 (' + tmCount.count + ' 条)');

  const sessionCount = await prisma.rCICSession.deleteMany({});
  console.log('✓ rcic_sessions 已清空 (' + sessionCount.count + ' 条)');

  const userUpdate = await prisma.user.updateMany({
    where: { assignedRcicId: { not: null } },
    data: { assignedRcicId: null },
  });
  if (userUpdate.count > 0) {
    console.log('✓ users.assignedRcicId 已置空 (' + userUpdate.count + ' 条)');
  }

  const rcicCount = await prisma.rCIC.deleteMany({});
  console.log('✓ rcics（持牌顾问）已清空 (' + rcicCount.count + ' 条)');

  console.log('完成。普通会员保留，可重新注册顾问/文案/操作员。');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
