import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('PlaceWise Backend Integration Tests', () => {
  it('GET /api/v1/health returns healthy system status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.database.status).toBe('healthy');
  });

  it('POST /api/v1/auth/login logs in student user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@placewise.edu',
        password: 'Password@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.user.role).toBe('STUDENT');
  });

  it('GET /api/v1/opportunities returns published opportunities for student', async () => {
    // Login as student
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@placewise.edu',
        password: 'Password@123',
      });
    const token = loginRes.body.data.tokens.accessToken;

    const res = await request(app)
      .get('/api/v1/opportunities')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/manager/analytics/overview returns real database counts for manager', async () => {
    // Login as manager
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'manager@placewise.edu',
        password: 'Password@123',
      });
    const token = loginRes.body.data.tokens.accessToken;

    const res = await request(app)
      .get('/api/v1/manager/analytics/overview')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.students.totalRegistered).toBeGreaterThanOrEqual(1);
    expect(res.body.data.opportunities.published).toBeGreaterThanOrEqual(1);
  });
});
