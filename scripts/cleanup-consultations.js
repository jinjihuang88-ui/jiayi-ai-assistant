/**
 * 清理超期消息：仅删除「与顾问沟通」线程内超过保留期的消息（文字、图片、文件引用）。
 * 会话本身不删除，用户仍可在消息页看到近期记录。
 * 用法：node scripts/cleanup-consultations.js（需在项目根目录且已配置 DATABASE_URL）
 * 保留天数见 MESSAGE_RETENTION_DAYS，可配合系统 cron 定期执行。
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MESSAGE_RETENTION_DAYS = 90;

async function main() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MESSAGE_RETENTION_DAYS);

  const consultationCaseIds = await prisma.case.findMany({
    where: { type: "consultation" },
    select: { id: true },
  });
  const ids = consultationCaseIds.map((c) => c.id);
  if (ids.length === 0) {
    console.log("没有与顾问沟通线程，无需清理。");
    return;
  }

  const deletedMessages = await prisma.message.deleteMany({
    where: {
      caseId: { in: ids },
      createdAt: { lt: cutoff },
    },
  });

  console.log(
    `已清除与顾问沟通线程中超过 ${MESSAGE_RETENTION_DAYS} 天的消息 ${deletedMessages.count} 条。`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
