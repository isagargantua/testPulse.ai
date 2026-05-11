# Vercel Deployment Guide

## Setup

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link project
```bash
cd apps/web
vercel link
```

### 4. Add environment variables
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENROUTER_API_KEY
```

### 5. Deploy
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## GitHub Integration

1. Push code to GitHub
2. Go to https://vercel.com/dashboard
3. Import project from GitHub
4. Configure environment variables in Vercel dashboard
5. Set up branch protection rules

## Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes |

## Vercel Projects

- Production: `testpulse-ai`
- Preview: Auto-generated for PRs

## Domains

- Production: `testpulse.ai` (custom domain)
- Preview: `testpulse-ai-git-{branch}.vercel.app`