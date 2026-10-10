import { prisma } from '../src/config/database.js';

const PAST_RECRUITERS = [
  {
    name: 'Google',
    industry: 'Technology & Cloud',
    websiteUrl: 'https://www.google.com',
    careersUrl: 'https://careers.google.com',
    description: 'Global tech leader hiring for Software Development Engineer (SDE), Cloud Computing, and Site Reliability roles.',
  },
  {
    name: 'Microsoft',
    industry: 'Technology & AI',
    websiteUrl: 'https://www.microsoft.com',
    careersUrl: 'https://careers.microsoft.com',
    description: 'Global cloud, operating systems, and enterprise software giant hiring campus engineering graduates.',
  },
  {
    name: 'Amazon',
    industry: 'E-Commerce & Cloud (AWS)',
    websiteUrl: 'https://www.amazon.com',
    careersUrl: 'https://amazon.jobs',
    description: 'Pioneer in global e-commerce, cloud computing, and logistics hiring SDE and operations engineers.',
  },
  {
    name: 'Tata Consultancy Services',
    industry: 'IT Consulting & Services',
    websiteUrl: 'https://www.tcs.com',
    careersUrl: 'https://www.tcs.com/careers',
    description: 'Leading global IT services, consulting, and digital business solutions provider. Hires through TCS Digital & Ninja tracks.',
  },
  {
    name: 'Infosys',
    industry: 'IT Consulting & Services',
    websiteUrl: 'https://www.infosys.com',
    careersUrl: 'https://www.infosys.com/careers',
    description: 'Next-generation digital services and consulting leader hiring Power Programmers and Systems Engineers.',
  },
  {
    name: 'Accenture',
    industry: 'Consulting & Technology',
    websiteUrl: 'https://www.accenture.com',
    careersUrl: 'https://www.accenture.com/careers',
    description: 'Global professional services company with leading capabilities in digital, cloud, and security.',
  },
  {
    name: 'Capgemini',
    industry: 'Engineering & Cloud Services',
    websiteUrl: 'https://www.capgemini.com',
    careersUrl: 'https://www.capgemini.com/careers',
    description: 'Global leader in partnering with companies to transform and manage their business by harnessing technology.',
  },
  {
    name: 'HCLTech',
    industry: 'IT & Digital Engineering',
    websiteUrl: 'https://www.hcltech.com',
    careersUrl: 'https://www.hcltech.com/careers',
    description: 'Global technology company offering industry-leading capabilities centered around digital, engineering, and cloud.',
  },
  {
    name: 'L&T Technology Services',
    industry: 'Core & Embedded Engineering',
    websiteUrl: 'https://www.ltts.com',
    careersUrl: 'https://www.ltts.com/careers',
    description: 'Engineering and R&D services company catering to manufacturing, automotive, telecom, and aerospace sectors.',
  },
  {
    name: 'Deloitte',
    industry: 'Management & Technology Consulting',
    websiteUrl: 'https://www.deloitte.com',
    careersUrl: 'https://www.deloitte.com/careers',
    description: 'Big Four audit, consulting, financial advisory, and technology consulting firm recruiting analysts.',
  },
  {
    name: 'Cognizant',
    industry: 'IT Services & Digital Transformation',
    websiteUrl: 'https://www.cognizant.com',
    careersUrl: 'https://careers.cognizant.com',
    description: 'Engineers modern businesses to improve everyday life through cloud, IoT, and AI consulting.',
  },
  {
    name: 'Wipro',
    industry: 'IT & Digital Consulting',
    websiteUrl: 'https://www.wipro.com',
    careersUrl: 'https://careers.wipro.com',
    description: 'Multinational technology services corporation hiring Elite and Turbo software engineering graduates.',
  },
  {
    name: 'Samsung R&D',
    industry: 'Hardware & Artificial Intelligence',
    websiteUrl: 'https://www.samsung.com',
    careersUrl: 'https://www.samsung.com/careers',
    description: 'World-renowned electronics and semiconductor leader hiring for algorithmic research and software development.',
  },
  {
    name: 'Oracle',
    industry: 'Enterprise Software & Database',
    websiteUrl: 'https://www.oracle.com',
    careersUrl: 'https://www.oracle.com/careers',
    description: 'Global cloud software and hardware technology innovator recruiting application and database developers.',
  },
  {
    name: 'Adani Group',
    industry: 'Infrastructure & Energy',
    websiteUrl: 'https://www.adani.com',
    careersUrl: 'https://www.adani.com/careers',
    description: 'India largest infrastructure conglomerate hiring graduate engineer trainees across engineering divisions.',
  },
  {
    name: 'Tata Motors',
    industry: 'Automotive & EV Engineering',
    websiteUrl: 'https://www.tatamotors.com',
    careersUrl: 'https://www.tatamotors.com/careers',
    description: 'Automobile manufacturing titan hiring mechanical, electrical, and mechatronics engineers.',
  },
];

async function seedPastRecruiters() {
  console.log('Seeding premier past recruiters...');
  for (const comp of PAST_RECRUITERS) {
    await prisma.company.upsert({
      where: { name: comp.name },
      update: {
        industry: comp.industry,
        websiteUrl: comp.websiteUrl,
        careersUrl: comp.careersUrl,
        description: comp.description,
        verifiedByManager: true,
      },
      create: {
        name: comp.name,
        industry: comp.industry,
        websiteUrl: comp.websiteUrl,
        careersUrl: comp.careersUrl,
        description: comp.description,
        verifiedByManager: true,
      },
    });
    console.log(`Synced recruiter: ${comp.name} (${comp.industry})`);
  }
  console.log('Finished seeding 16 premier past recruiters!');
}

seedPastRecruiters()
  .catch((e) => {
    console.error('Error seeding recruiters:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
