import { prisma } from '../src/config/database.js';

async function main() {
  const resume = await prisma.resume.findFirst({
    include: { analyses: true, student: true },
  });
  console.log(JSON.stringify(resume, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
