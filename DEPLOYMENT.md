# Smart Mbarara — Vercel Deployment Guide

## What this app is

A React + TypeScript civic issue reporting system. Citizens submit reports; admins track and update them. The backend is serverless TypeScript functions backed by PostgreSQL.

---

## Project structure (what matters for Vercel)

```
/
├── api/                          ← Vercel serverless API functions
│   ├── _cors.ts                  ← shared CORS helper (Vercel skips _ files as routes)
│   ├── healthz.ts                ← GET /api/healthz
│   ├── reports.ts                ← GET/POST /api/reports
│   ├── reports/
│   │   ├── [id].ts               ← GET/PATCH /api/reports/:id
│   │   └── [id]/
│   │       └── status.ts         ← PATCH /api/reports/:id/status
│   └── stats/
│       └── [endpoint].ts         ← GET /api/stats/summary|by-category|by-status|recent
├── artifacts/smart-mbarara/      ← React + Vite frontend
│   └── dist/public/              ← Vite build output (Vercel serves this)
├── lib/
│   ├── db/                       ← Drizzle ORM + PostgreSQL
│   └── api-zod/                  ← Zod validation schemas
├── vercel.json                   ← Vercel config
└── .env.example                  ← Copy this → .env for local dev
```

---

## Step 1 — Get a free PostgreSQL database

You need a hosted PostgreSQL database. Two free options:

### Option A — Neon (recommended, generous free tier)
1. Go to https://neon.tech and create a free account
2. Create a new project → name it "smart-mbarara"
3. Copy the **Connection string** (looks like `postgresql://user:pass@host/db?sslmode=require`)

### Option B — Supabase
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Settings → Database → Connection string → copy the URI

---

## Step 2 — Run the database migration (one-time setup)

This creates the `civic_reports` table in your production database.

```bash
# Set your database URL temporarily
export DATABASE_URL="postgresql://your-connection-string-here"

# Push the schema to your production database
pnpm --filter @workspace/db push
```

You only need to do this once (or whenever the schema changes).

---

## Step 3 — Deploy to Vercel

### Install Vercel CLI (if you haven't)
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```

### Deploy
From the project root, run:
```bash
vercel
```

Vercel will ask a few questions — use these answers:
- **Set up and deploy?** → Yes
- **Which scope?** → your account
- **Link to existing project?** → No (first time)
- **Project name** → smart-mbarara (or any name you like)
- **In which directory is your code?** → `.` (the current directory)

### Set the DATABASE_URL environment variable on Vercel
```bash
vercel env add DATABASE_URL production
```
Paste your PostgreSQL connection string when prompted.

Then **redeploy** so Vercel picks up the new env var:
```bash
vercel --prod
```

---

## Step 4 — Verify the deployment

Once deployed, test these URLs (replace `your-app.vercel.app` with your actual URL):

| What | URL |
|------|-----|
| Homepage | `https://your-app.vercel.app/` |
| Submit a report | `https://your-app.vercel.app/report` |
| Public reports | `https://your-app.vercel.app/reports` |
| Admin dashboard | `https://your-app.vercel.app/admin` |
| Health check | `https://your-app.vercel.app/api/healthz` |

The health check should return: `{"status":"ok"}`

---

## Local development (optional)

For local dev, you need `vercel dev` which runs both the frontend and API together:

```bash
# Install vercel CLI globally
npm install -g vercel

# Create a .env file from the example
cp .env.example .env
# Edit .env and add your DATABASE_URL

# Run locally (starts frontend + API on http://localhost:3000)
vercel dev
```

---

## Common deployment errors and fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `relation "civic_reports" does not exist` | DB not migrated | Run Step 2 again |
| `connect ECONNREFUSED` | DATABASE_URL not set | Add it in Vercel → Settings → Environment Variables |
| 404 on `/admin` or `/reports` | SPA routing issue | Ensure `vercel.json` is in the project root |
| `Cannot find module '@workspace/db'` | pnpm install failed | Check Vercel build logs; re-deploy |

---

## Image uploads

> **MVP limitation:** The app accepts an image URL (link to a photo) instead of a file upload. This is intentional — Vercel's serverless functions cannot store files permanently.

To add real file upload support later, connect a cloud storage service:
- **Cloudinary** — free tier, easy to set up
- **Supabase Storage** — if you're already using Supabase for the DB
- **AWS S3** — most powerful, more setup required
