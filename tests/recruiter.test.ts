import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Recruiter Console & Candidate Resumes Integration Tests', () => {
  let authToken = '';

  it('1. Logs in and receives authentication token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@placewise.edu',
        password: 'Password@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    authToken = res.body.data.tokens.accessToken;
  });

  it('2. GET /api/v1/students returns candidates with attached resumes and ATS analyses', async () => {
    const res = await request(app)
      .get('/api/v1/students?limit=20')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    // Verify candidate profiles have resumes with analyses
    const candidatesWithResumes = res.body.data.filter((s: any) => s.resumes && s.resumes.length > 0);
    expect(candidatesWithResumes.length).toBeGreaterThan(0);

    const firstCandidate = candidatesWithResumes[0];
    expect(firstCandidate.fullName).toBeDefined();
    expect(firstCandidate.department).toBeDefined();
    expect(firstCandidate.cgpa).toBeDefined();
    expect(firstCandidate.resumes).toBeDefined();

    const resume = firstCandidate.resumes[0];
    expect(resume.id).toBeDefined();
    expect(resume.originalName).toBeDefined();
    expect(resume.extractedText).toBeDefined();
    expect(resume.parsedData).toBeDefined();
    expect(Array.isArray(resume.analyses)).toBe(true);
    expect(resume.analyses.length).toBeGreaterThan(0);
    expect(resume.analyses[0].qualityScore).toBeGreaterThanOrEqual(70);
    expect(resume.analyses[0].strengths).toBeDefined();
    expect(resume.analyses[0].recommendations).toBeDefined();
  });

  it('3. GET /api/v1/resumes/:id allows inspecting full candidate resume dossier', async () => {
    // First get a resume id
    const listRes = await request(app)
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${authToken}`);

    const candidate = listRes.body.data.find((s: any) => s.resumes && s.resumes.length > 0);
    expect(candidate).toBeDefined();

    const resumeId = candidate.resumes[0].id;

    const res = await request(app)
      .get(`/api/v1/resumes/${resumeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(resumeId);
    expect(res.body.data.extractedText).toBeDefined();
  });

  it('4. GET /api/v1/resumes/:id/download allows downloading the candidate resume file', async () => {
    const listRes = await request(app)
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${authToken}`);

    const candidate = listRes.body.data.find((s: any) => s.resumes && s.resumes.length > 0);
    expect(candidate).toBeDefined();

    const resumeId = candidate.resumes[0].id;

    const res = await request(app)
      .get(`/api/v1/resumes/${resumeId}/download`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.header['content-disposition']).toContain('attachment');
  });
});
