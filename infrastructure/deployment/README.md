# Deployment Guide

## Prerequisites

1. **Supabase Project**
   - Create project at https://supabase.com
   - Run database migrations
   - Configure storage buckets
   - Set up Google OAuth (optional)

2. **OpenRouter Account**
   - Get API key from https://openrouter.ai

3. **GitHub Repository**
   - Push code to GitHub

## Step 1: Database Setup

1. Go to Supabase Dashboard → SQL Editor
2. Run `infrastructure/database/migrations/001_initial_schema.sql`

## Step 2: Storage Setup

1. Go to Supabase Dashboard → Storage
2. Create buckets: `uploads`, `screenshots`, `exports`
3. Or run `infrastructure/storage/supabase-storage-setup.sql`

## Step 3: Configure Supabase

1. Enable Email auth in Auth settings
2. Configure Google OAuth (optional)
3. Update allowed redirect URLs

## Step 4: Deploy to Vercel

### Option A: Vercel Dashboard

1. Go to https://vercel.com
2. Import `testpulse-ai` from GitHub
3. Set root directory: `apps/web`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENROUTER_API_KEY`
5. Deploy

### Option B: CLI

```bash
cd apps/web
vercel --prod
```

## Step 5: Configure Domain (Optional)

1. Add custom domain in Vercel
2. Update DNS records
3. Update Supabase redirect URLs

## Step 6: Update Environment

Update `apps/web/.env` with production URLs:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Storage buckets configured
- [ ] Environment variables set
- [ ] OAuth providers configured
- [ ] Custom domain verified
- [ ] SSL certificate active

## Rollback

If deployment fails:
1. Go to Vercel Dashboard → Deployments
2. Select previous deployment
3. Click "Promote to Production"