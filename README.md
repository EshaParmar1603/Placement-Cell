# PlaceWise — College Placement Cell Management Platform 🎓🏢

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=flat)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)](https://www.prisma.io/)

**PlaceWise** is an enterprise-grade campus placement cell management platform designed for universities and higher-education institutions (tailored for **Parul University Training & Placement Cell**). 

The platform bridges students, corporate recruiters, and university placement managers through automated placement drives, AI-powered ATS resume evaluations, smart interview calendars, and comprehensive recruiter consoles.

---

## 🌟 Key Features

### 🎓 1. Student Portal
- **Academic Dashboard**: Real-time CGPA tracking, active backlogs, profile completion, and application status.
- **NVIDIA AI ATS Resume Analyzer**: Parses PDF/DOCX resumes, assesses ATS compatibility (0–100), provides executive summaries, validated strengths, and actionable bullet-point fixes.
- **Company Role Matcher**: AI-powered skill gap analyzer comparing candidate profiles against company eligibility cutoffs.
- **AI Mock Interview Studio**: Interactive technical and HR simulation prep with feedback.
- **Campus Placement Feed**: LinkedIn-style institutional news feed featuring placement achievements, company drives, and official circulars with media galleries.
- **Past Recruiters Directory**: Showcase of premier corporate recruiters (Google, Microsoft, Amazon, TCS, Infosys, Deloitte, etc.) with tier tags and intake stats.

### 🏢 2. Corporate Recruiter Portal
- **Candidate Talent Pool**: Multi-dimensional search by name, roll number, or skills (e.g., Python, React, Kafka, Docker).
- **Candidate Resume Inspection**: Deep-dive into parsed resumes, student system projects, verified work experience, and NVIDIA ATS quality benchmarks.
- **Original File Downloads**: Direct download of PDF resume dossiers.
- **Recruiter Drive Calendar**: Interactive calendar tracking pre-placement talks, test windows, and interview schedules.
- **Shortlisted Talent Dossier**: Bookmark promising candidates and export shortlist portfolios to CSV.

### 📊 3. Placement Officer Administration
- **Drive Management**: Create, edit, and publish campus job opportunities with salary packages, cutoffs, and branch criteria.
- **Placement Analytics**: Cohort analytics, department-wise placement percentages, and offer distribution.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, React Query, Lucide Icons
- **Backend**: Node.js, Express 5, TypeScript, Prisma ORM, JWT Authentication
- **Database**: PostgreSQL (Prisma Client)
- **AI Integration**: NVIDIA AI / Gemini / OpenAI fallback for resume ATS evaluation
- **Storage**: Local filesystem storage with automatic file download fallbacks
- **Testing**: Vitest, Supertest (14 integration test suites)

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [PostgreSQL](https://www.postgresql.org/) database

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/placewise.git
cd placewise
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/placewise?schema=public"
JWT_ACCESS_SECRET="your-super-secret-jwt-key-min32chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min32chars"
PORT=4000
```

### 3. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm --prefix client install
```

### 4. Database Setup & Seeding
```bash
# Push Prisma schema to database
npx prisma db push

# Seed default test users and past recruiters
npx tsx scripts/seed-recruiter-candidates.ts
```

### 5. Run the Application
```bash
# Terminal 1: Start Backend API (Port 4000)
npm run dev

# Terminal 2: Start Frontend Client (Port 3000)
npm --prefix client run dev
```

Visit the app at: **`http://localhost:3000`**  
Backend API documentation at: **`http://localhost:4000/api/v1/health`**

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@placewise.edu` | `Password@123` |
| **Placement Manager** | `manager@placewise.edu` | `Password@123` |
| **Admin** | `admin@placewise.edu` | `Password@123` |

---

## 🧪 Running Automated Tests

Run the full integration test suite:
```bash
npx vitest run
```

---

## 🌐 How to Deploy to GitHub & the Cloud

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions on pushing to GitHub and deploying to free hosting services (Render, Railway, Vercel, or Docker).
