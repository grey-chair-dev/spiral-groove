# Quick Setup Checklist

## 📊 Current Status

**✅ Completed:**
- Node.js v24.10.0 installed
- npm 11.6.0 installed
- Git 2.39.5 configured
- Dependencies installed (`node_modules` exists)
- Database connection string configured
- Client portal authentication configured (`CLIENT_PASSWORD`, `AUTH_SECRET`)
- Make.com webhook configured
- ECS API credentials configured (Application ID, Access Token, Environment, Location ID, Webhook Signature Key)
- ECS webhook handler created and ready

**✅ Completed (Optional):**
- ECS API credentials configured ✅

**Ready to start development!** ✅

---

Follow these steps to get the development environment running:

## ✅ Prerequisites

- [x] Node.js 18+ installed (`node --version`) - **v24.10.0** ✅
- [x] npm installed (`npm --version`) - **11.6.0** ✅
- [x] Git configured - **2.39.5** ✅
- [x] Neon PostgreSQL account (or local PostgreSQL) - **Configured** ✅

## ✅ Environment Setup

1. **Copy environment template:**
   - [x] Duplicate `.env.local.example` → `.env.local` and fill in real secrets locally ✅
   - 🔐 Never commit `.env.local`—rotate secrets in Vercel/Neon when credentials change

2. **Configure required variables in `.env.local`:**
   - [x] `DATABASE_URL` or `LCT_DATABASE_URL` (Neon connection string) ✅
   - [x] `CLIENT_PASSWORD` (for client portal access) ✅
   - [x] `CLIENT_PASSWORD_HASH` (bcrypt hash of the client password) ✅
   - [x] `AUTH_SECRET` (random 32+ character string) ✅
   - [x] `ECS_APPLICATION_ID` (if using ECS features) ✅
   - [x] `ECS_ACCESS_TOKEN` (if using ECS features) ✅
   - [x] `ECS_ENVIRONMENT` (sandbox or production) ✅ - *sandbox*
   - [x] `ECS_LOCATION_ID` (if using ECS features) ✅
   - [x] `ECS_WEBHOOK_SIGNATURE_KEY` (if using ECS features) ✅
   - [ ] `UPSTASH_REDIS_URL` / `UPSTASH_REDIS_TOKEN` (shared rate limiting + webhook queue)
   - [ ] `WEBHOOK_PROCESS_TOKEN` (Bearer token for the queue worker)
   - [ ] `WEBHOOK_PROCESS_MAX_ATTEMPTS`, `WEBHOOK_PROCESS_RETRY_DELAY_MS`, `WEBHOOK_PROCESS_MAX_BACKOFF_MS`, `WEBHOOK_PROCESS_BACKOFF_JITTER_MS`, `WEBHOOK_PROCESS_MAX_CONCURRENCY` (optional tuning)
   - [x] `MAKE_WEBHOOK_URL` (optional) ✅

3. **Generate secure values:** ✅ *Already generated*
   - [x] `CLIENT_PASSWORD` generated ✅
   - [x] `AUTH_SECRET` generated ✅
   
   *(To regenerate, use the commands in the full documentation)*

## ✅ Installation

- [x] Dependencies installed ✅ (`node_modules` exists)
- [x] `package-lock.json` present ✅

## ✅ Database Setup

1. **Apply migrations:**
   ```bash
   npm run db:migrate
   # or view status
   npm run db:migrate:status
   ```
   - Uses the SQL files in `migrations/` and tracks history in `schema_migrations`
   - Requires `LCT_DATABASE_URL` (preferred) or `DATABASE_URL`
   - For destructive local resets, run `scripts/dev-reset-schema.sql` and then `npm run db:migrate`

2. **Verify connection:**
   ```bash
   npm run dev
   # Try submitting the email form to test database connection
   ```

## ✅ Start Development

- [x] Ready to start development ✅

```bash
npm run dev
```

Visit: `http://localhost:3000`

## ⚙️ Webhook Queue Setup

- Provision Upstash Redis and add `UPSTASH_REDIS_URL` / `UPSTASH_REDIS_TOKEN` (or the legacy `*_REST_*` names) to every environment.
- Generate a high-entropy `WEBHOOK_PROCESS_TOKEN` (`openssl rand -hex 32`) and store it locally + in Vercel.
- Configure a Vercel Cron job (e.g., every 5 minutes) pointing to `/api/webhooks/process` with `Authorization: Bearer <WEBHOOK_PROCESS_TOKEN>`.
- Tune retry/backoff behavior with `WEBHOOK_PROCESS_MAX_ATTEMPTS`, `WEBHOOK_PROCESS_RETRY_DELAY_MS`, `WEBHOOK_PROCESS_MAX_BACKOFF_MS`, `WEBHOOK_PROCESS_BACKOFF_JITTER_MS`, and worker throughput with `WEBHOOK_PROCESS_MAX_CONCURRENCY`.
- Monitor logs for `[ECSWebhookWorker]` entries—successful runs report `{ processed, failed, pulled, dlqSize }`.
- If a task repeatedly fails it is automatically moved into `ecs-webhook-queue-dlq:{ECS_APPLICATION_ID}`; see `docs/webhook-queue.md` for replay steps.

## ✅ Test Authentication

1. Visit `http://localhost:3000`
2. Enter your `CLIENT_PASSWORD`
3. Should redirect to `/home`

## 📚 Documentation

See [README.md](./README.md) for full documentation.

## 🔒 Security Reminders

- ✅ `.env.local` is already in `.gitignore`
- ✅ Never commit environment variables
- ✅ Use different values for dev/staging/production
- ✅ Use Sandbox tokens for development
- ✅ Rotate secrets regularly

