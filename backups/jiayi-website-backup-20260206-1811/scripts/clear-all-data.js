const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('清空 TiDB 中所有会员、顾问及相关数据...');

  const im = await prisma.internalMessage.deleteMany({});
  console.log('  internal_messages:', im.count);

  const ic = await prisma.internalConversation.deleteMany({});
  console.log('  internal_conversations:', ic.count);

  const msg = await prisma.message.deleteMany({});
  console.log('  messages:', msg.count);

  const c = await prisma.case.deleteMany({});
  console.log('  cases:', c.count);

  const tms = await prisma.rCICTeamMemberSession.deleteMany({});
  console.log('  rcic_team_member_sessions:', tms.count);

  const tm = await prisma.rCICTeamMember.deleteMany({});
  console.log('  rcic_team_members:', tm.count);

  const rs = await prisma.rCICSession.deleteMany({});
  console.log('  rcic_sessions:', rs.count);

  await prisma.user.updateMany({ data: { assignedRcicId: null } });

  const u = await prisma.user.deleteMany({});
  console.log('  users:', u.count);

  const r = await prisma.rCIC.deleteMany({});
  console.log('  rcics:', r.count);

  const vt = await prisma.verificationToken.deleteMany({});
  console.log('  verification_tokens:', vt.count);

  console.log('完成。会员、顾问等数据已全部清空，可重新注册测试。');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
