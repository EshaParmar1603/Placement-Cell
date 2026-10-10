import { PrismaClient, UserRole, AccountStatus, PlacementStatus, OpportunityStatus, ApplicationStage, PostType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding PlaceWise database...');

  // Common password hash for test accounts
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password@123', salt);

  // 1. Seed System Configuration
  await prisma.systemConfig.upsert({
    where: { key: 'ELIGIBILITY_RULES' },
    update: {},
    create: {
      key: 'ELIGIBILITY_RULES',
      value: {
        defaultMinCgpa: 6.0,
        maxBacklogsAllowed: 0,
        allowOptedOutApplication: false,
        departments: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Mechanical', 'Electrical'],
        graduationYears: [2024, 2025, 2026, 2027],
      },
      description: 'Default institution-wide placement eligibility thresholds',
    },
  });

  // 2. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@placewise.edu' },
    update: {},
    create: {
      email: 'admin@placewise.edu',
      passwordHash,
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
    },
  });

  // 3. Placement Manager User
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@placewise.edu' },
    update: {},
    create: {
      email: 'manager@placewise.edu',
      passwordHash,
      role: UserRole.PLACEMENT_MANAGER,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      managerProfile: {
        create: {
          fullName: 'Dr. Robert Vance',
          department: 'Training and Placement Cell',
          designation: 'Head of Placements',
          phone: '+91 9876543210',
        },
      },
    },
  });

  // 4. Student 1: Highly qualified, applied to opportunities
  const student1User = await prisma.user.upsert({
    where: { email: 'student@placewise.edu' },
    update: {},
    create: {
      email: 'student@placewise.edu',
      passwordHash,
      role: UserRole.STUDENT,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      studentProfile: {
        create: {
          fullName: 'Aarav Sharma',
          phone: '+91 9876543211',
          enrollmentNumber: 'EN2022CSE001',
          department: 'Computer Science',
          course: 'B.Tech',
          graduationYear: 2026,
          cgpa: 8.85,
          percentage: 88.5,
          tenthPercentage: 92.0,
          twelfthPercentage: 89.5,
          activeBacklogs: 0,
          historyOfBacklogs: 0,
          skills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Docker', 'Python', 'Data Structures', 'Algorithms'],
          projects: [
            {
              title: 'PlaceWise Platform',
              description: 'Built a full-stack campus placement management system with real-time analytics',
              technologies: ['Node.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
            },
            {
              title: 'Distributed Key-Value Store',
              description: 'Implemented Raft consensus algorithm for fault-tolerant state replication',
              technologies: ['Go', 'gRPC', 'Distributed Systems'],
            },
          ],
          certifications: [
            { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: 2025 },
          ],
          targetRoles: ['Software Development Engineer', 'Backend Engineer'],
          preferredLocations: ['Bangalore', 'Hyderabad', 'Pune'],
          placementStatus: PlacementStatus.NOT_PLACED,
          profileCompletion: 95,
        },
      },
    },
  });

  // 5. Student 2: Eligible CSE student who has NOT applied yet
  const student2User = await prisma.user.upsert({
    where: { email: 'student2@placewise.edu' },
    update: {},
    create: {
      email: 'student2@placewise.edu',
      passwordHash,
      role: UserRole.STUDENT,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      studentProfile: {
        create: {
          fullName: 'Ananya Verma',
          phone: '+91 9876543212',
          enrollmentNumber: 'EN2022CSE045',
          department: 'Computer Science',
          course: 'B.Tech',
          graduationYear: 2026,
          cgpa: 8.4,
          percentage: 84.0,
          tenthPercentage: 94.0,
          twelfthPercentage: 91.0,
          activeBacklogs: 0,
          historyOfBacklogs: 0,
          skills: ['Java', 'Spring Boot', 'SQL', 'Microservices', 'Git'],
          projects: [
            {
              title: 'E-Commerce Microservices',
              description: 'Built scalable backend using Spring Boot and Kafka',
              technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'Kafka'],
            },
          ],
          targetRoles: ['Backend Developer', 'Java Developer'],
          preferredLocations: ['Bangalore', 'Gurgaon'],
          placementStatus: PlacementStatus.NOT_PLACED,
          profileCompletion: 90,
        },
      },
    },
  });

  // 6. Student 3: Placed student
  const student3User = await prisma.user.upsert({
    where: { email: 'student3@placewise.edu' },
    update: {},
    create: {
      email: 'student3@placewise.edu',
      passwordHash,
      role: UserRole.STUDENT,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      studentProfile: {
        create: {
          fullName: 'Vikram Singh',
          phone: '+91 9876543213',
          enrollmentNumber: 'EN2022IT012',
          department: 'Information Technology',
          course: 'B.Tech',
          graduationYear: 2026,
          cgpa: 9.1,
          percentage: 91.0,
          tenthPercentage: 96.0,
          twelfthPercentage: 93.0,
          activeBacklogs: 0,
          historyOfBacklogs: 0,
          skills: ['C++', 'Python', 'Machine Learning', 'PyTorch', 'Data Structures'],
          targetRoles: ['ML Engineer', 'Data Scientist'],
          placementStatus: PlacementStatus.PLACED,
          profileCompletion: 100,
        },
      },
    },
  });

  // 7. Alumni User
  const alumniUser = await prisma.user.upsert({
    where: { email: 'alumni@placewise.edu' },
    update: {},
    create: {
      email: 'alumni@placewise.edu',
      passwordHash,
      role: UserRole.ALUMNI,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      alumniProfile: {
        create: {
          fullName: 'Priya Sundaram',
          phone: '+91 9876543214',
          department: 'Computer Science',
          graduationYear: 2023,
          currentCompany: 'Google',
          currentRole: 'Software Engineer II',
          linkedInUrl: 'https://linkedin.com/in/priya-sundaram-demo',
          isVerified: true,
        },
      },
    },
  });

  // 8. Mentor User
  const mentorUser = await prisma.user.upsert({
    where: { email: 'mentor@placewise.edu' },
    update: {},
    create: {
      email: 'mentor@placewise.edu',
      passwordHash,
      role: UserRole.MENTOR,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      mentorProfile: {
        create: {
          fullName: 'David Miller',
          phone: '+91 9876543215',
          currentCompany: 'Microsoft',
          currentRole: 'Principal Engineering Manager',
          yearsExperience: 12,
          expertise: ['System Design', 'Backend Architecture', 'Coding Interviews', 'Leadership'],
          bio: '12+ years building distributed cloud platforms. Passionate about helping students crack Tier-1 product tech interviews.',
          maxSessionsPerWeek: 6,
          isVerified: true,
        },
      },
    },
  });

  // 9. Seed Companies
  const google = await prisma.company.upsert({
    where: { name: 'Google' },
    update: {},
    create: {
      name: 'Google',
      websiteUrl: 'https://about.google',
      careersUrl: 'https://careers.google.com',
      industry: 'Technology & Cloud',
      description: 'Multinational technology company focusing on search engine, online advertising, cloud computing, and AI.',
      verifiedByManager: true,
      sourceUrl: 'https://careers.google.com/students',
      verificationDate: new Date(),
    },
  });

  const microsoft = await prisma.company.upsert({
    where: { name: 'Microsoft' },
    update: {},
    create: {
      name: 'Microsoft',
      websiteUrl: 'https://microsoft.com',
      careersUrl: 'https://careers.microsoft.com',
      industry: 'Technology & Cloud',
      description: 'Global leader in software, cloud computing, gaming, and enterprise productivity solutions.',
      verifiedByManager: true,
      sourceUrl: 'https://careers.microsoft.com/students/us/en',
      verificationDate: new Date(),
    },
  });

  const amazon = await prisma.company.upsert({
    where: { name: 'Amazon' },
    update: {},
    create: {
      name: 'Amazon',
      websiteUrl: 'https://amazon.jobs',
      careersUrl: 'https://amazon.jobs/en/teams/student-programs',
      industry: 'E-Commerce & Cloud',
      description: 'E-commerce and cloud computing giant with focus on customer obsession and high scale systems.',
      verifiedByManager: true,
      sourceUrl: 'https://amazon.jobs',
      verificationDate: new Date(),
    },
  });

  const infosys = await prisma.company.upsert({
    where: { name: 'Infosys' },
    update: {},
    create: {
      name: 'Infosys',
      websiteUrl: 'https://infosys.com',
      careersUrl: 'https://infosys.com/careers',
      industry: 'IT Services & Consulting',
      description: 'Global leader in next-generation digital services and consulting.',
      verifiedByManager: true,
      sourceUrl: 'https://infosys.com/careers',
      verificationDate: new Date(),
    },
  });

  // 10. Seed Opportunities
  const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const googleSdeOpp = await prisma.opportunity.upsert({
    where: { id: 'opp-google-sde-2026' },
    update: {},
    create: {
      id: 'opp-google-sde-2026',
      companyId: google.id,
      title: 'Software Development Engineer - Campus 2026',
      description: 'We are seeking passionate Computer Science students with strong problem solving and algorithmic fundamentals.',
      employmentType: 'FULL_TIME',
      location: 'Bangalore / Hyderabad',
      salaryMin: 2200000,
      salaryMax: 3200000,
      deadline: futureDeadline,
      minCgpa: 8.0,
      allowedDepartments: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
      allowedGraduationYears: [2026],
      maxBacklogsAllowed: 0,
      requiredSkills: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Python', 'Problem Solving'],
      preferredSkills: ['Distributed Systems', 'PostgreSQL', 'Docker'],
      status: OpportunityStatus.PUBLISHED,
      createdById: managerUser.id,
    },
  });

  const msftInternOpp = await prisma.opportunity.upsert({
    where: { id: 'opp-msft-intern-2026' },
    update: {},
    create: {
      id: 'opp-msft-intern-2026',
      companyId: microsoft.id,
      title: 'Software Engineering Intern (Summer 2026)',
      description: 'Exciting 2-month summer internship for pre-final year students to work on Azure and Microsoft 365 cloud services.',
      employmentType: 'INTERNSHIP',
      location: 'Hyderabad / Noida',
      stipend: 125000,
      deadline: futureDeadline,
      minCgpa: 7.5,
      allowedDepartments: ['Computer Science', 'Information Technology'],
      allowedGraduationYears: [2026],
      maxBacklogsAllowed: 0,
      requiredSkills: ['Data Structures', 'Algorithms', 'Object-Oriented Programming'],
      preferredSkills: ['C#', 'TypeScript', 'Azure'],
      status: OpportunityStatus.PUBLISHED,
      createdById: managerUser.id,
    },
  });

  const infosysSeOpp = await prisma.opportunity.upsert({
    where: { id: 'opp-infosys-se-2026' },
    update: {},
    create: {
      id: 'opp-infosys-se-2026',
      companyId: infosys.id,
      title: 'Systems Engineer Specialist',
      description: 'National Qualifier test hiring for high performance engineering roles across enterprise transformation projects.',
      employmentType: 'FULL_TIME',
      location: 'Pan India',
      salaryMin: 650000,
      salaryMax: 950000,
      deadline: futureDeadline,
      minCgpa: 6.5,
      allowedDepartments: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Mechanical', 'Electrical'],
      allowedGraduationYears: [2026],
      maxBacklogsAllowed: 0,
      requiredSkills: ['Java', 'Python', 'SQL', 'Problem Solving'],
      preferredSkills: ['Spring Boot', 'Cloud Computing'],
      status: OpportunityStatus.PUBLISHED,
      createdById: managerUser.id,
    },
  });

  // 11. Seed Student 1's Resume & Application
  const student1Profile = await prisma.studentProfile.findUnique({
    where: { userId: student1User.id },
  });

  if (student1Profile) {
    const resume1 = await prisma.resume.upsert({
      where: {
        studentId_version: {
          studentId: student1Profile.id,
          version: 1,
        },
      },
      update: {},
      create: {
        studentId: student1Profile.id,
        fileName: 'aarav_sharma_resume_v1.pdf',
        originalName: 'Aarav_Sharma_Resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 145000,
        filePath: 'uploads/resumes/aarav_sharma_resume_v1.pdf',
        version: 1,
        processingStatus: 'COMPLETED',
        extractedText: 'Aarav Sharma - Computer Science B.Tech student with 8.85 CGPA. Skills: TypeScript, Node.js, React, PostgreSQL, Docker, Data Structures, Algorithms. Built PlaceWise platform and Raft consensus distributed store.',
        parsedData: {
          name: 'Aarav Sharma',
          cgpa: 8.85,
          skills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Docker', 'Data Structures', 'Algorithms'],
          education: [{ degree: 'B.Tech Computer Science', cgpa: 8.85, year: 2026 }],
          projects: [
            { title: 'PlaceWise Platform', tech: 'Node.js, PostgreSQL' },
            { title: 'Distributed Key-Value Store', tech: 'Go, Raft' },
          ],
        },
      },
    });

    // Seed Resume Analysis
    await prisma.resumeAnalysis.upsert({
      where: { id: 'analysis-aarav-v1' },
      update: {},
      create: {
        id: 'analysis-aarav-v1',
        resumeId: resume1.id,
        qualityScore: 88,
        summary: 'Strong technical resume with concrete distributed systems and web projects. Good skills demonstration.',
        strengths: [
          'High CGPA (8.85) clearly stated',
          'Modern backend technologies (TypeScript, Node.js, PostgreSQL, Docker)',
          'Complex systems project implementing Raft consensus',
        ],
        weaknesses: [
          'Quantified business/performance metrics could be emphasized more in project descriptions',
          'Soft skills and collaborative team experience not explicitly mentioned',
        ],
        missingInfo: ['LinkedIn profile URL', 'Competitive programming ranking or LeetCode profile'],
        recommendations: [
          'Add quantified impact (e.g. reduced latency by 30%, handled 10k req/sec)',
          'Include links to GitHub repositories for verifiable proof',
        ],
      },
    });

    // Student 1 applies to Google SDE
    const app1 = await prisma.application.upsert({
      where: {
        opportunityId_studentId: {
          opportunityId: googleSdeOpp.id,
          studentId: student1Profile.id,
        },
      },
      update: {},
      create: {
        opportunityId: googleSdeOpp.id,
        studentId: student1Profile.id,
        resumeId: resume1.id,
        currentStage: ApplicationStage.SHORTLISTED,
        notes: 'Shortlisted for Online Coding Assessment Round.',
      },
    });

    // Application history
    await prisma.applicationHistory.createMany({
      data: [
        {
          applicationId: app1.id,
          previousStage: ApplicationStage.APPLIED,
          newStage: ApplicationStage.SHORTLISTED,
          changedById: managerUser.id,
          remarks: 'Applicant meets all academic criteria and skill requirements.',
        },
      ],
      skipDuplicates: true,
    });

    // Match Report
    await prisma.jobMatchReport.upsert({
      where: {
        studentId_opportunityId: {
          studentId: student1Profile.id,
          opportunityId: googleSdeOpp.id,
        },
      },
      update: {},
      create: {
        studentId: student1Profile.id,
        opportunityId: googleSdeOpp.id,
        resumeId: resume1.id,
        matchScore: 92,
        academicEligibility: 'ELIGIBLE',
        skillBreakdown: [
          { skill: 'Data Structures', status: 'MATCHED', evidence: 'Mentioned in resume skills & projects' },
          { skill: 'Algorithms', status: 'MATCHED', evidence: 'Raft consensus & problem solving' },
          { skill: 'Problem Solving', status: 'MATCHED', evidence: 'Demonstrated in distributed projects' },
          { skill: 'PostgreSQL', status: 'MATCHED', evidence: 'PlaceWise database design' },
        ],
        missingRequiredSkills: [],
        recommendations: [
          'Revise dynamic programming and graph algorithms for Google round 1',
          'Practice system design fundamentals',
        ],
      },
    });
  }

  // 12. Seed Interview Prep Topics
  await prisma.interviewPrepTopic.createMany({
    data: [
      {
        companyId: google.id,
        targetRole: 'Software Development Engineer',
        stageName: 'Technical Round 1 (Data Structures & Algorithms)',
        topicName: 'Graph Algorithms & Dynamic Programming',
        category: 'TECHNICAL',
        description: 'Focuses on complex data structures, BFS/DFS traversal, shortest path, and multi-dimensional dynamic programming.',
        practiceQuestions: [
          { question: 'Word Ladder II (Shortest Transformation Sequences)', difficulty: 'Hard' },
          { question: 'Alien Dictionary (Topological Sort)', difficulty: 'Hard' },
          { question: 'Longest Valid Parentheses', difficulty: 'Hard' },
        ],
        resources: [
          { title: 'Google Interview Technical Guide', url: 'https://careers.google.com/interview-tips/' },
        ],
        sourceUrl: 'https://careers.google.com/interview-prep',
        verificationDate: new Date(),
      },
      {
        companyId: microsoft.id,
        targetRole: 'Software Engineer',
        stageName: 'Round 2 - Architecture & Low Level Design',
        topicName: 'Object Oriented Design & Concurrency',
        category: 'SYSTEM_DESIGN',
        description: 'Design extensible software patterns with SOLID principles and multi-threaded synchronization.',
        practiceQuestions: [
          { question: 'Design an LRU Cache with O(1) operations and thread safety', difficulty: 'Medium' },
          { question: 'Design an In-Memory File System', difficulty: 'Hard' },
        ],
        resources: [
          { title: 'Microsoft Interview Experience Handbook', url: 'https://careers.microsoft.com' },
        ],
        sourceUrl: 'https://careers.microsoft.com/prep',
        verificationDate: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  // 13. Seed Mentor Availability Slots
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: mentorUser.id },
  });

  if (mentorProfile) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(0, 0, 0, 0);

    await prisma.mentorSlot.createMany({
      data: [
        {
          mentorId: mentorProfile.id,
          slotDate: tomorrow,
          startTime: '18:00',
          endTime: '19:00',
          isBooked: false,
        },
        {
          mentorId: mentorProfile.id,
          slotDate: tomorrow,
          startTime: '19:30',
          endTime: '20:30',
          isBooked: false,
        },
        {
          mentorId: mentorProfile.id,
          slotDate: dayAfter,
          startTime: '17:00',
          endTime: '18:00',
          isBooked: false,
        },
      ],
      skipDuplicates: true,
    });
  }

  // 14. Seed Alumni Feed Posts
  await prisma.feedPost.createMany({
    data: [
      {
        authorId: managerUser.id,
        authorRole: UserRole.PLACEMENT_MANAGER,
        postType: PostType.ANNOUNCEMENT,
        title: 'Google & Microsoft Campus Drives 2026 Announced!',
        content: 'Dear Students, Placement Drives for Google (SDE) and Microsoft (Internship) for 2026 batch are now open for applications. Ensure your resumes and academic profiles are 100% updated before the deadline.',
        tags: ['Placements2026', 'Google', 'Microsoft', 'Important'],
        isPinned: true,
        isSpotlight: true,
      },
      {
        authorId: alumniUser.id,
        authorRole: UserRole.ALUMNI,
        postType: PostType.INTERVIEW_EXPERIENCE,
        title: 'How I Cracked Google SDE: A Step-by-Step Guide for Juniors',
        content: 'Reflecting on my placement journey: 1. Solidify Trees & Graphs. 2. Write clean, production-grade code during live whiteboard rounds. 3. Communicate your thought process before writing a single line. Happy to review resumes and conduct mock interviews!',
        tags: ['Google', 'InterviewExperience', 'Algorithms', 'Preparation'],
        isPinned: false,
        isSpotlight: true,
      },
      {
        authorId: student1User.id,
        authorRole: UserRole.STUDENT,
        postType: PostType.PLACEMENT_STORY,
        title: 'Our Open Source Campus Placement Platform PlaceWise is Live',
        content: 'Excited to share that our placement automation platform PlaceWise has launched. Students can now analyze resumes with AI and match against live eligibility criteria.',
        tags: ['PlaceWise', 'Project', 'OpenSource'],
        isPinned: false,
        isSpotlight: false,
      },
    ],
    skipDuplicates: true,
  });

  console.log('[Seed] Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
