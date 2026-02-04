const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function exportDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const output = {
    timestamp,
    users: await prisma.user.findMany(),
    rcics: await prisma.rCIC.findMany(),
    cases: await prisma.case.findMany(),
    messages: await prisma.message.findMany(),
  };
  
  const filename = `backups/database_backup_${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(output, null, 2));
  console.log(`Database exported to ${filename}`);
  console.log(`Users: ${output.users.length}`);
  console.log(`RCICs: ${output.rcics.length}`);
  console.log(`Cases: ${output.cases.length}`);
  console.log(`Messages: ${output.messages.length}`);
  
  await prisma.$disconnect();
}

exportDatabase().catch(console.error);
