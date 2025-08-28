# Railway + Vercel Deployment Setup

## Overview
This guide covers deploying the StudentsAI MVP with:
- **Backend**: Railway (FastAPI + PostgreSQL)
- **Frontend**: Vercel (Next.js)
- **Domains**: studentsai.org

## Required Environment Variables

### Railway (Backend) Environment Variables

```bash
# Database (Railway PostgreSQL automatically provides DATABASE_URL)
DATABASE_URL=postgresql://...  # Auto-provided by Railway

# Production Settings
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=8000

# Frontend Configuration
FRONTEND_URL=https://www.studentsai.org
BACKEND_CORS_ORIGINS=["https://www.studentsai.org", "https://studentsai.org", "https://api.studentsai.org"]
ALLOWED_ORIGINS=https://www.studentsai.org,https://studentsai.org,https://api.studentsai.org

# Security
SECRET_KEY=your-strong-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
VERIFICATION_TOKEN_EXPIRE_MINUTES=60

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://www.studentsai.org/auth/google/callback

# Email Configuration (for verification emails)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_PORT=587
MAIL_TLS=true
MAIL_SSL=false
MAIL_FROM_NAME=StudentsAI

# AI Configuration
OPENAI_API_KEY=your-openai-api-key
DAILY_AI_REQUEST_LIMIT=100
AI_REQUESTS_PER_HOUR=100

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# Redis (optional - for enhanced rate limiting)
REDIS_URL=redis://localhost:6379/0
```

### Vercel (Frontend) Environment Variables

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://api.studentsai.org

# Google OAuth (same as backend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Environment
NODE_ENV=production
```

## Domain Configuration

### Railway Setup
1. Deploy your backend to Railway
2. Configure custom domain: `api.studentsai.org`
3. Railway will provide SSL certificate automatically

### Vercel Setup
1. Deploy your frontend to Vercel
2. Configure custom domains:
   - `www.studentsai.org` (primary)
   - `studentsai.org` (redirect to www)
3. Vercel will provide SSL certificates automatically

### DNS Configuration
Point your DNS records to:
```
api.studentsai.org → Railway deployment URL
www.studentsai.org → Vercel deployment URL
studentsai.org → Vercel deployment URL (or redirect)
```

## Deployment Steps

### 1. Backend (Railway)
```bash
# Connect your repo to Railway
# Set all environment variables above
# Railway will auto-deploy on git push
```

### 2. Frontend (Vercel)
```bash
# Connect your repo to Vercel
# Set environment variables above
# Configure build settings:
#   Build Command: npm run build
#   Output Directory: .next
#   Install Command: npm install
```

### 3. Database Migration
```bash
# IMPORTANT: Run this migration to fix the missing 'tags' column
# Option 1: Via Railway shell (recommended)
cd backend && python -m alembic upgrade head

# Option 2: Configure automatic migrations in Railway
# Add this to your Railway startup command:
# cd backend && python -m alembic upgrade head && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` is set to your production domain
- Verify `BACKEND_CORS_ORIGINS` includes your frontend domain
- Check that `ALLOWED_ORIGINS` has production domains

### 500 Internal Server Errors
- Check Railway logs for detailed error messages
- Verify database connection (`DATABASE_URL`)
- Ensure all required environment variables are set
- Check that `DEBUG=false` in production

### Authentication Issues
- Verify Google OAuth redirect URIs match your domains
- Check JWT `SECRET_KEY` is set properly
- Ensure email service is configured for user verification

### Database Issues
- **Missing 'tags' column error**: Run the latest migration with `python -m alembic upgrade head`
- Verify Railway PostgreSQL addon is connected
- Check database migrations are applied
- Monitor connection limits and performance
- Use `python -m alembic current` to check current migration version
- Use `python -m alembic history` to see all available migrations

## Security Checklist
- [ ] `DEBUG=false` in production
- [ ] Strong `SECRET_KEY` generated
- [ ] Email service configured with app passwords
- [ ] Google OAuth configured with correct redirect URIs
- [ ] CORS properly configured for production domains
- [ ] Rate limiting enabled
- [ ] SSL certificates configured (auto via Railway/Vercel)

## Monitoring
- Railway provides built-in logging and metrics
- Vercel provides analytics and performance monitoring
- Consider adding error tracking (Sentry) for production

## Quick Fix Commands

If you're getting CORS errors:
```bash
# In Railway, set these environment variables:
FRONTEND_URL=https://www.studentsai.org
BACKEND_CORS_ORIGINS=["https://www.studentsai.org", "https://studentsai.org"]
ALLOWED_ORIGINS=https://www.studentsai.org,https://studentsai.org
```

If you're getting 500 errors:
```bash
# Check Railway logs:
railway logs --tail

# Or enable debug temporarily:
DEBUG=true
```

If you're getting rate limit errors (429) on AI features:
```bash
# In Railway, increase AI rate limits:
AI_REQUESTS_PER_HOUR=200
DAILY_AI_REQUEST_LIMIT=500

# Or temporarily enable debug mode (bypasses rate limits):
DEBUG=true
```
