# 🚀 Deployment Guide: PlaceWise on GitHub & The Cloud

This step-by-step guide explains how to:
1. Push this complete project to **GitHub**.
2. Deploy the **Frontend** (React + Vite) to **Vercel** or **Netlify**.
3. Deploy the **Backend** (Node.js + Express) & **PostgreSQL Database** to **Render** or **Railway**.

---

## 📌 STEP 1: Push Code to GitHub

### 1.1 Create a new repository on GitHub
1. Open your browser and go to [github.com/new](https://github.com/new).
2. Repository name: `placewise` (or `parul-university-placement-cell`).
3. Set visibility to **Public** or **Private**.
4. **Important**: Do **NOT** check "Initialize this repository with a README" (we already have one).
5. Click **Create repository**.
6. Copy the repository URL (e.g., `https://github.com/<your-username>/placewise.git`).

### 1.2 Push from your computer
Run the following commands in your terminal in this project root folder:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files (secrets and node_modules are safely ignored by .gitignore)
git add .

# 3. Create your initial commit
git commit -m "feat: complete PlaceWise platform with student and recruiter portals"

# 4. Set main branch
git branch -M main

# 5. Link to your GitHub repository (replace with your actual URL)
git remote add origin https://github.com/<your-username>/placewise.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 📌 STEP 2: Deploy Free PostgreSQL Database

You need a cloud-hosted PostgreSQL database. Recommended free options:
- [Neon](https://neon.tech) (Serverless Postgres, free tier)
- [Supabase](https://supabase.com) (Postgres, free tier)
- [Render](https://render.com) (Managed Postgres)

### Instructions (Neon / Supabase):
1. Create a free account at [neon.tech](https://neon.tech).
2. Click **Create Project** (Name: `placewise-db`).
3. Copy the **Connection String** (URI), which looks like:
   ```
   postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/placewise?sslmode=require
   ```

---

## 📌 STEP 3: Deploy the Backend API (Render / Railway)

### Using Render (Recommended & Free):
1. Go to [render.com](https://render.com) and log in with GitHub.
2. Click **New +** -> **Web Service**.
3. Select your GitHub repository (`placewise`).
4. Configure service settings:
   - **Name**: `placewise-api`
   - **Root Directory**: Leave blank (root `.`)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npx prisma db push
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
5. In **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon/Supabase PostgreSQL connection string
   - `NODE_ENV`: `production`
   - `PORT`: `4000`
   - `JWT_ACCESS_SECRET`: `super-secret-random-key-at-least-32-chars-long`
   - `JWT_REFRESH_SECRET`: `another-super-secret-refresh-key-32-chars-long`
   - `CORS_ORIGIN`: Your frontend URL (or `*` during initial setup)
6. Click **Deploy Web Service**.
7. Copy your backend URL (e.g., `https://placewise-api.onrender.com`).

---

## 📌 STEP 4: Deploy the Frontend (Vercel)

### Using Vercel (Fast & Recommended):
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New** -> **Project**.
3. Import your `placewise` repository.
4. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api/v1`
6. Click **Deploy**.
7. Your app is now live! (e.g. `https://placewise.vercel.app`).

---

## 📌 STEP 5: Run Database Seed on Production (Optional)

To seed initial candidates, resumes, and past recruiters on your cloud database:
```bash
# In your local terminal, point DATABASE_URL to your cloud database and run:
DATABASE_URL="<your-cloud-database-url>" npx tsx scripts/seed-recruiter-candidates.ts
```

---

## ✅ Deployment Checklist
- [x] Code committed to git with `.gitignore` protecting secrets.
- [x] `README.md` and documentation ready.
- [x] CI/CD workflow configured in `.github/workflows/ci.yml`.
- [x] Production build tested and verified with zero errors.
