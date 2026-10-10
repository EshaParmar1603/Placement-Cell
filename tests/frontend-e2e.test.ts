import { describe, it, expect } from 'vitest';

describe('PlaceWise Frontend E2E Integration Suite', () => {
  const base = 'http://localhost:3000/api/v1';

  let studentToken = '';
  let managerToken = '';
  let adminToken = '';
  let sampleOpportunityId = '';

  it('1. Authenticates student and returns valid JWT access token', async () => {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@placewise.edu', password: 'Password@123' }),
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.user.role).toBe('STUDENT');
    expect(body.data.tokens.accessToken).toBeDefined();
    studentToken = body.data.tokens.accessToken;
  });

  it('2. Retrieves student profile with academic and backlog metrics', async () => {
    const res = await fetch(`${base}/students/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.fullName).toBe('Aarav Sharma');
    expect(body.data.cgpa).toBeGreaterThan(0);
    expect(body.data.department).toBe('Computer Science');
  });

  it('3. Fetches published placement opportunities', async () => {
    const res = await fetch(`${base}/opportunities`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    sampleOpportunityId = body.data[0].id;
  });

  it('4. Evaluates AI Job Match and official eligibility rules', async () => {
    const res = await fetch(`${base}/job-matches/opportunities/${sampleOpportunityId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.officialEligibility).toBeDefined();
    expect(body.data.resumeMatch).toBeDefined();
    expect(body.data.resumeMatch.score).toBeGreaterThanOrEqual(0);
  });

  it('5. Authenticates placement manager and fetches institutional analytics', async () => {
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@placewise.edu', password: 'Password@123' }),
    });
    const loginBody = (await loginRes.json()) as any;
    expect(loginBody.success).toBe(true);
    managerToken = loginBody.data.tokens.accessToken;

    const res = await fetch(`${base}/manager/analytics/overview`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.students.totalRegistered).toBeGreaterThan(0);
    expect(body.data.opportunities.published).toBeGreaterThan(0);
  });

  it('6. Authenticates administrator and retrieves system user directory', async () => {
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@placewise.edu', password: 'Password@123' }),
    });
    const loginBody = (await loginRes.json()) as any;
    expect(loginBody.success).toBe(true);
    adminToken = loginBody.data.tokens.accessToken;

    const res = await fetch(`${base}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });
});
