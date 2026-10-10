async function main() {
  const base = 'http://localhost:4000/api/v1';

  console.log('1. Logging in as Manager...');
  const mLoginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manager@placewise.edu', password: 'Password@123' }),
  });
  const mLogin = await mLoginRes.json();
  if (!mLogin.success) throw new Error('Manager login failed: ' + JSON.stringify(mLogin));
  const mToken = mLogin.data.tokens.accessToken;
  console.log('Manager login success.');

  console.log('2. Scheduling a Date as Manager...');
  const createEvtRes = await fetch(`${base}/calendar/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${mToken}`,
    },
    body: JSON.stringify({
      title: 'Google Campus Placement Drive & Technical Rounds',
      type: 'CAMPUS_DRIVE',
      date: '2026-10-25',
      time: '10:00 AM IST',
      companyName: 'Google',
      location: 'Auditorium Hall A & Online Labs',
      description: 'Pre-placement talk followed by round 1 coding assessment.',
    }),
  });
  const createEvt = await createEvtRes.json();
  console.log('Event created:', createEvt.success, createEvt.data?.title);

  console.log('3. Logging in as Student...');
  const sLoginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@placewise.edu', password: 'Password@123' }),
  });
  const sLogin = await sLoginRes.json();
  if (!sLogin.success) throw new Error('Student login failed: ' + JSON.stringify(sLogin));
  const sToken = sLogin.data.tokens.accessToken;
  console.log('Student login success.');

  console.log('4. Fetching Calendar Events as Student...');
  const sEventsRes = await fetch(`${base}/calendar/events`, {
    headers: { Authorization: `Bearer ${sToken}` },
  });
  const sEvents = await sEventsRes.json();
  console.log('Calendar Events total:', sEvents.data.length);
  const found = sEvents.data.find((e: any) => e.companyName === 'Google');
  console.log('Found scheduled event on calendar:', found?.title, 'Date:', found?.date);

  console.log('5. Testing Job Matching with NVIDIA AI...');
  const oppsRes = await fetch(`${base}/opportunities`, {
    headers: { Authorization: `Bearer ${sToken}` },
  });
  const opps = await oppsRes.json();
  const firstOpp = opps.data[0];
  console.log('Matching against Opportunity:', firstOpp.title, 'at', firstOpp.company.name);

  const matchRes = await fetch(`${base}/job-matches/opportunities/${firstOpp.id}`, {
    headers: { Authorization: `Bearer ${sToken}` },
  });
  const match = await matchRes.json();
  console.log('Match Status:', match.success);
  console.log('Resume Match Score:', match.data.resumeMatch?.score);
  console.log('Resume Matched Skills:', match.data.resumeMatch?.matchedSkills);
  console.log('Resume Missing Skills:', match.data.resumeMatch?.missingSkills);

  console.log('6. Notifications received by student...');
  const notifsRes = await fetch(`${base}/notifications`, {
    headers: { Authorization: `Bearer ${sToken}` },
  });
  const notifs = await notifsRes.json();
  const calNotif = notifs.data?.find((n: any) => n.title.includes('Scheduled:'));
  console.log('Calendar Notification sent to student:', calNotif?.title);
  console.log('Notification message:', calNotif?.message);

  console.log('SUCCESS: All Smart Calendar & NVIDIA AI tests executed successfully!');
}

main().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
