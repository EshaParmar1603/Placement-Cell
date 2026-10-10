async function checkFeed() {
  const base = 'http://localhost:4000/api/v1';
  const loginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@placewise.edu', password: 'Password@123' }),
  });
  const login = await loginRes.json();
  const token = login.data.tokens.accessToken;

  const feedRes = await fetch(`${base}/feed`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const feed = await feedRes.json();
  console.log('Feed status:', feed.success);
  console.log('Total posts fetched:', feed.data.length);
  feed.data.forEach((p: any, i: number) => {
    console.log(`[${i + 1}] Title: ${p.title}`);
    console.log(`    Type: ${p.postType} | Pinned: ${p.isPinned} | Image: ${p.imageUrl}`);
    console.log(`    Likes: ${p._count?.likes} | Comments: ${p._count?.comments}`);
  });
}

checkFeed().catch(console.error);
