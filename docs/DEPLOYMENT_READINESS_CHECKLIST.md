## StudentsAI Deployment Readiness Checklist

This checklist inventories the backend and frontend, highlights what to keep/remove, and lists verification steps before deploying to Railway (backend + Postgres) and Vercel (frontend).

### Backend (FastAPI)
- Check if rate limiters (rate_limiter and enhanced_rate_limiter) work properly.
- Keep
  - `backend/app/`
    - `main.py`, `auth.py`, `ai_service.py`, `oauth_service.py`, `database.py`, `email_service.py`, `rate_limiter.py`, `rate_limiter_enhanced.py`, `schemas.py`, `config.py`, `__init__.py`
  - `backend/alembic/` with all migrations; `alembic.ini`
  - `backend/requirements.txt`
  - Do we need all the past version of DB or we need new one for production?
- Remove (dev/local only)
  - `backend/venv/`
  - `backend/uploads/` existing files (leave folder if used)
  - `uvicorn.out` if present
- Config
  - Env vars needed on Railway:
    - `DATABASE_URL` (Railway Postgres)
    - `SECRET_KEY`
    - `ALGORITHM=HS256`
    - `FRONTEND_URL` (e.g., https://studentsai.org)
    - `ALLOWED_ORIGINS` (comma-separated, include Vercel domain)
    - SMTP: `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`, `MAIL_PORT`, `MAIL_TLS`, `MAIL_SSL`
    - Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (backend callback `/auth/google/callback` on Railway public URL)
    - OpenAI Key
    - Redis???
- Google OAuth URLs
  - Auth URL redirect: `https://accounts.google.com/o/oauth2/v2/auth` (frontend initiates via backend `/auth/google/login`)
  - Token exchange uses `GOOGLE_REDIRECT_URI`
  - After callback, backend redirects to `FRONTEND_URL/auth/google/callback`
- Email
  - Uses fastapi-mail + Gmail SMTP; verify credentials and allow sending in production
  - All email flows: verify email, reset password, email change (2-step), account deletion
- Database
  - Postgres (Railway). Run Alembic migrations on deploy
  - Ensure constraints/cascades OK; we implemented manual deletes for account deletion
- Security
  - CORS configured to allow Vercel domain only
  - JWT with `SECRET_KEY`; consider rotation policy later
  - Rate limiting enabled (`rate_limiter[_enhanced].py`) on auth-sensitive endpoints
  - Make sure rate limiting is working like we need for Free and in future for Pro users. Make sure database handles which user is free which is Pro, and add indicator for Pro users in profile.
  - Avoid logging PII; reduce debug logs in prod
- Tests/Smoke
  - Health endpoint (add if missing) returns 200
  - Create account via email → verify link → login → set password → logout/login
  - Google OAuth login → set password → email/pass login works
  - Forgot/reset password
  - Email change (both steps)
  - Account deletion (email confirm) removes user and related data
  - Notes CRUD; flashcards generation/review; graph endpoints

### Frontend (Next.js)
- Keep
  - `frontend/src/` app, components, hooks, lib
  - `frontend/public/` only necessary assets (light screenshots)
  - `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `eslint.config.mjs`
- Remove
  - Dark screenshots in `public/screens/*_dark.png` (if not referenced)
  - `frontend/dev.log` (local only)
  - Any unused components under `components/landing/` already culled
- Config
  - Environment for Vercel:
    - `NEXT_PUBLIC_API_BASE` (Railway backend URL)
  - Ensure all API calls use absolute base from `api.ts`
  - Image optimization domains (if any external images)
- Auth UX
  - `/auth` page – email/password + Google OAuth
  - `localStorage` is used for MVP; consider moving to httpOnly cookies later
  - `has_password` toggles “Set Password” vs “Change Password” in settings
  - Redirects: unauthenticated → `/landing`; success → `/`
- Pages to verify
  - `/landing` visuals, FeatureGrid, HowItWorks, Pricing CTA
  - `/` main app loads notes when token present
  - `/flashcards`, `/profile`, `/settings`
  - `/verify/[token]` handles email verification and account deletion confirmations
  - `/verify-email-change*` step 1/2 flows
- Tests/Smoke
  - Auth flows as above
  - Pricing CTA buttons route correctly to `/auth`
  - Screens render without layout shift; images load crisp

### Delete Candidates (confirm not referenced)
- Backend
  - `backend/uploads/*` existing files
  - `backend/uvicorn.out`
  - Any legacy scripts not used in deploy (keep `create_demo_data.py` only if needed)
- Frontend
  - `frontend/public/screens/*_dark.png` if not used
  - `frontend/dev.log`

### Pre-Deploy Actions
- Backend
  - Turn off debug prints and excessive logging
  - Add `/health` endpoint
  - Verify CORS origins (Railway app URL, Vercel domain)
  - Set all env vars in Railway
  - Run `alembic upgrade head` on Railway
- Frontend
  - Set `NEXT_PUBLIC_API_BASE` → Railway URL
  - Build on Vercel; ensure edge/caching defaults sane
  - Verify Google console: add Railway backend callback + Vercel origins

### Post-Deploy Verification
- End-to-end signup/login via email
- End-to-end Google login
- Reset password works
- Email change works
- Account deletion works
- Notes CRUD and flashcard review flows
- Landing page performance looks good on mobile/desktop

### Future Hardening (after MVP)
- Move auth to secure cookies instead of localStorage
- Add monitoring (Railway logs), Sentry for FE/BE
- Backups for Postgres, retention policy
- CI pipeline: lint, typecheck, minimal API smoke tests


