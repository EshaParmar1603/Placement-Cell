import { prisma } from '../src/config/database.js';
import { PostType, UserRole } from '@prisma/client';

async function seedParulLinkedInPosts() {
  console.log('Seeding Parul University LinkedIn-style placement posts with photos...');

  const manager = await prisma.user.findFirst({
    where: { role: UserRole.PLACEMENT_MANAGER },
  });

  const student = await prisma.user.findFirst({
    where: { role: UserRole.STUDENT },
  });

  const alumni = await prisma.user.findFirst({
    where: { role: UserRole.ALUMNI },
  });

  if (!manager || !student) {
    throw new Error('Manager or Student user not found in database');
  }

  // Remove previous demo feed posts to make it pristine Parul LinkedIn style
  await prisma.feedComment.deleteMany({});
  await prisma.feedLike.deleteMany({});
  await prisma.feedPost.deleteMany({});

  const posts = [
    {
      authorId: manager.id,
      authorRole: UserRole.PLACEMENT_MANAGER,
      postType: PostType.ANNOUNCEMENT,
      title: 'Infinite Dreams Fulfilled: Parul University Celebrates Record Placements!',
      content: `Placed with Pride, Soaring with Success! ProudlyPlaced\n\nPresenting our historic cohort of proudly placed students at Parul University! With NAAC Grade A++ accreditation and industry partnerships spanning across 500+ Fortune 500 enterprises, our graduates are leading modern engineering and technology frontiers globally.\n\nFrom day one, our placement cell works hand-in-hand with every student through personalized AI resume matching, algorithmic mock interviews, and direct corporate recruitment pipelines.\n\nProud of every single achiever in this frame! The world is yours to conquer!\n\n#ParulUniversity #ProudlyPlaced #InfiniteDreamsFulfilled #ChampionsOfTodayLeadersOfTomorrow`,
      imageUrl: '/placement-banner.png',
      tags: ['ProudlyPlaced', 'RecordPlacement', 'ParulUniversity', 'NAACGradeAPlusPlus'],
      isPinned: true,
      isSpotlight: true,
    },
    {
      authorId: manager.id,
      authorRole: UserRole.PLACEMENT_MANAGER,
      postType: PostType.PLACEMENT_STORY,
      title: 'Star Achiever Akshat Sharma Placed at Google with 34.5 LPA!',
      content: `Heartiest Congratulations to our star achiever Akshat Sharma (B.Tech Computer Science & Engineering, Class of 2026) for securing a prestigious Software Development Engineer (SDE) offer at Google with an extraordinary package of 34.5 LPA!\n\nFrom rigorous competitive programming in our campus computing labs to cracking multiple algorithmic whiteboard rounds, Akshat has demonstrated what dedication and perseverance can achieve.\n\n"Parul University gave me the exact competitive environment, AI-driven placement prep, and mentorship to crack the world's most competitive tech interview." — Akshat Sharma\n\nJoin us in celebrating this stellar milestone! Keep soaring high!\n\n#ProudlyPlaced #GoogleIndia #StarAchiever #ParulUniversity #GoGlobal #SoftwareEngineer`,
      imageUrl: '/feed-google-placed.jpg',
      tags: ['ProudlyPlaced', 'Google', 'SDE', 'StarAchiever', '34.5LPA', 'BTechCSE'],
      isPinned: false,
      isSpotlight: true,
    },
    {
      authorId: manager.id,
      authorRole: UserRole.PLACEMENT_MANAGER,
      postType: PostType.ANNOUNCEMENT,
      title: 'Mega Campus Placement Drive 2026: 2,200+ Recruiters, Where Careers Begin!',
      content: `Grand Launch of Parul University Mega Campus Placement Drive 2026!\n\nWhere careers take flight and aspirations turn into achievements! We are elated to host premier global tech and consulting leaders including TCS, Infosys, Accenture, Microsoft, Capgemini, and HCL for our on-campus recruitment drive.\n\nOver 2,200+ recruiters have reposed their faith in the talent, technical prowess, and innovative problem-solving mindset of our students.\n\nKey Highlights:\n- Over 1,500+ job offers rolled out in Day 1 & Day 2 drives\n- State-of-the-art interview suites and live coding evaluation setups\n- Best wishes to all our aspiring engineers and leaders of tomorrow!\n\n#ParulUniversity #ProudlyPlaced #InfiniteDreamsFulfilled #CampusPlacement #NAACGradeAPlusPlus`,
      imageUrl: '/feed-campus-drive.jpg',
      tags: ['ParulUniversity', 'CampusDrive2026', 'TCS', 'Infosys', 'Microsoft', 'ProudlyPlaced'],
      isPinned: false,
      isSpotlight: true,
    },
    {
      authorId: alumni ? alumni.id : manager.id,
      authorRole: alumni ? UserRole.ALUMNI : UserRole.PLACEMENT_MANAGER,
      postType: PostType.PLACEMENT_STORY,
      title: 'Breaking Ceilings: Priya Patel Secures SDE Offer at Amazon (28.5 LPA)!',
      content: `Empowering women in technology!\n\nWe are immensely proud to announce that Priya Patel (B.Tech Information Technology) has been placed as a Software Development Engineer at Amazon AWS with an impressive package of 28.5 LPA!\n\nHer journey is a testament to consistent hard work, mastering distributed systems, and acing the behavioral and system design interview rounds.\n\nCongratulations Priya! You are an inspiration to hundreds of budding female engineers across Parul University!\n\n#ProudlyPlaced #WomenInTech #AmazonSDE #CareerSuccess #ParulUniversity #ProudAlumni`,
      imageUrl: '/feed-amazon-placed.jpg',
      tags: ['ProudlyPlaced', 'WomenInTech', 'AmazonSDE', '28.5LPA', 'ParulAchievers'],
      isPinned: false,
      isSpotlight: true,
    },
  ];

  for (const postData of posts) {
    const post = await prisma.feedPost.create({
      data: postData,
    });
    console.log(`Created Post: ${post.title} (Image: ${post.imageUrl})`);

    // Add sample congratulatory comments like real LinkedIn posts
    await prisma.feedComment.create({
      data: {
        postId: post.id,
        authorId: student.id,
        content: 'Heartiest congratulations! Truly inspiring for all of us at Parul University!',
      },
    });

    // Add like
    await prisma.feedLike.create({
      data: {
        postId: post.id,
        userId: student.id,
      },
    });
  }

  console.log('Successfully seeded Parul University LinkedIn-style placement posts with photos!');
}

seedParulLinkedInPosts()
  .catch((e) => {
    console.error('Error seeding feed posts:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
