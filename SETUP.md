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
- Square API credentials configured (Application ID, Access Token, Environment, Location ID)
- Square webhook subscription configured (20 events: Orders, Payments, Refunds, Customers, Inventory, Catalog, Loyalty)
- Square Webhook Signature Key configured

**✅ Completed (Optional):**
- Square API credentials configured ✅
- Square webhook subscription configured ✅ (20 events selected)

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
   - [x] `.env.local` file exists ✅

2. **Configure required variables in `.env.local`:**
   - [x] `DATABASE_URL` or `SGR_DATABASE_URL` (Neon connection string) ✅
   - [x] `CLIENT_PASSWORD` (for client portal access) ✅
   - [x] `AUTH_SECRET` (random 32+ character string) ✅
   - [x] `SQUARE_APPLICATION_ID` (if using Square features) ✅
   - [x] `SQUARE_ACCESS_TOKEN` (if using Square features) ✅
   - [x] `SQUARE_ENVIRONMENT` (sandbox or production) ✅ - *sandbox*
   - [x] `SQUARE_LOCATION_ID` (if using Square features) ✅
   - [x] `SQUARE_WEBHOOK_SIGNATURE_KEY` (if using Square features) ✅
   - [x] `MAKE_WEBHOOK_URL` (optional) ✅

3. **Generate secure values:** ✅ *Already generated*
   - [x] `CLIENT_PASSWORD` generated ✅
   - [x] `AUTH_SECRET` generated ✅
   
   *(To regenerate, use the commands in the full documentation)*

## ✅ Installation

- [x] Dependencies installed ✅ (`node_modules` exists)
- [x] `package-lock.json` present ✅

## ✅ Database Setup

1. **Create database tables:**
   - Go to Neon dashboard → SQL Editor
   - Run the schema from `schema.sql`
   - Or create the `email_list` table manually

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

## ✅ Test Authentication

1. Visit `http://localhost:3000`
2. Enter your `CLIENT_PASSWORD`
3. Should redirect to `/home`

## 📚 Full Documentation

See [docs/environment-setup.md](./docs/environment-setup.md) for detailed instructions.

## 🔒 Security Reminders

- ✅ `.env.local` is already in `.gitignore`
- ✅ Never commit environment variables
- ✅ Use different values for dev/staging/production
- ✅ Use Sandbox tokens for development
- ✅ Rotate secrets regularly

