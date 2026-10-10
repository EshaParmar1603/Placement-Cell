export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PlaceWise API — College Placement Cell Management Platform',
    version: '1.0.0',
    description:
      'Robust backend APIs for students, alumni, mentors, placement managers, and administrators.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Base URL',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'UNAUTHORIZED' },
              message: { type: 'string', example: 'Invalid credentials' },
              details: { type: 'object' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['STUDENT', 'ALUMNI', 'MENTOR', 'PLACEMENT_MANAGER', 'ADMIN'] },
          status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'] },
          isEmailVerified: { type: 'boolean' },
        },
      },
      Opportunity: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'] },
          deadline: { type: 'string', format: 'date-time' },
          minCgpa: { type: 'number' },
          allowedDepartments: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'System health check and operational telemetry',
        security: [],
        responses: {
          '200': { description: 'Health check OK' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user (Student, Alumni, Mentor)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'role', 'fullName'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['STUDENT', 'ALUMNI', 'MENTOR'] },
                  fullName: { type: 'string' },
                  enrollmentNumber: { type: 'string' },
                  department: { type: 'string' },
                  graduationYear: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'User created' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate and receive access + refresh tokens',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Tokens issued' } },
      },
    },
    '/auth/refresh-token': {
      post: {
        summary: 'Rotate refresh token and issue new token pair',
        security: [],
        responses: { '200': { description: 'Tokens rotated' } },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current authenticated user profile',
        responses: { '200': { description: 'User profile retrieved' } },
      },
    },
    '/students/me': {
      get: {
        summary: 'Get current student complete academic record',
        responses: { '200': { description: 'Student profile' } },
      },
      patch: {
        summary: 'Update student academic details and placement preferences',
        responses: { '200': { description: 'Updated profile' } },
      },
    },
    '/resumes/upload': {
      post: {
        summary: 'Upload PDF/DOCX resume file, extract text and parse sections',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  resume: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Resume uploaded and processed' } },
      },
    },
    '/resumes/{id}/analyze': {
      post: {
        summary: 'Trigger AI quality analysis for a resume',
        responses: { '200': { description: 'Analysis report' } },
      },
    },
    '/resumes/compare': {
      get: {
        summary: 'Compare two resume versions',
        parameters: [
          { name: 'versionA', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'versionB', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Diff comparison' } },
      },
    },
    '/companies': {
      get: { summary: 'List verified companies', responses: { '200': { description: 'List of companies' } } },
      post: { summary: 'Register company (Managers/Admin)', responses: { '201': { description: 'Company created' } } },
    },
    '/opportunities': {
      get: { summary: 'List and filter placement opportunities', responses: { '200': { description: 'Opportunities list' } } },
      post: { summary: 'Create opportunity draft (Managers)', responses: { '201': { description: 'Created' } } },
    },
    '/opportunities/{id}/publish': {
      post: { summary: 'Publish opportunity to students', responses: { '200': { description: 'Published' } } },
    },
    '/opportunities/{id}/applicants': {
      get: { summary: 'Get applicants categorized by eligibility (Managers)', responses: { '200': { description: 'Categorized applicants' } } },
    },
    '/job-matches/opportunities/{opportunityId}': {
      get: { summary: 'Calculate student match score and eligibility for opportunity', responses: { '200': { description: 'Match breakdown' } } },
    },
    '/applications': {
      post: { summary: 'Apply for an opportunity with selected resume version', responses: { '201': { description: 'Application submitted' } } },
    },
    '/applications/me': {
      get: { summary: 'View student application history and stage progression', responses: { '200': { description: 'My applications' } } },
    },
    '/mock-interviews/start': {
      post: { summary: 'Start AI personalized mock interview session', responses: { '201': { description: 'Session started' } } },
    },
    '/mock-interviews/{id}/answer': {
      post: { summary: 'Submit interview answer for evaluation', responses: { '200': { description: 'Answer score and feedback' } } },
    },
    '/mock-interviews/{id}/complete': {
      post: { summary: 'Complete mock interview and generate overall report', responses: { '200': { description: 'Report' } } },
    },
    '/mentors': {
      get: { summary: 'Find and filter mentors by expertise and company', responses: { '200': { description: 'Mentors list' } } },
    },
    '/mentors/slots': {
      post: { summary: 'Mentor configures availability slots', responses: { '201': { description: 'Slots created' } } },
    },
    '/mentors/book': {
      post: { summary: 'Student books mentor slot with concurrency lock', responses: { '201': { description: 'Booking confirmed' } } },
    },
    '/feed': {
      get: { summary: 'Browse alumni feed, announcements, and posts', responses: { '200': { description: 'Posts list' } } },
      post: { summary: 'Create post', responses: { '201': { description: 'Post created' } } },
    },
    '/notifications': {
      get: { summary: 'List user notifications and unread count', responses: { '200': { description: 'Notifications' } } },
    },
    '/manager/analytics/overview': {
      get: { summary: 'Placement Cell key metrics from PostgreSQL', responses: { '200': { description: 'Metrics overview' } } },
    },
    '/admin/users': {
      get: { summary: 'List and manage users (Admin)', responses: { '200': { description: 'User list' } } },
    },
  },
};
