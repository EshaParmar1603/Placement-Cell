import { prisma } from '../src/config/database.js';

async function main() {
  const students = await prisma.studentProfile.findMany({
    take: 5,
    include: {
      resumes: {
        include: {
          analyses: true,
        },
      },
    },
  });

  console.log(`Found ${students.length} students:`);
  for (const s of students) {
    console.log(`- ${s.fullName} (${s.department}, CGPA: ${s.cgpa}, Resumes: ${s.resumes.length})`);
    if (s.resumes.length > 0) {
      const r = s.resumes[0];
      console.log(`   Resume: ${r.originalName}, Score: ${r.analyses[0]?.qualityScore ?? 'none'}`);
    }
  }

  const resumesCount = await prisma.resume.count();
  console.log(`Total resumes in db: ${resumesCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
