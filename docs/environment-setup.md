# Environment Setup & Security Guide

This guide covers setting up the development environment and securely configuring all required environment variables.

## 📋 Prerequisites

### 1. Node.js Installation

**Required Version:** Node.js 18.x or higher

**Installation Options:**

#### macOS (using Homebrew):
```bash
brew install node@18
# Or for latest LTS:
brew install node
```

#### macOS (using nvm - Recommended):
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 18
nvm install 18
nvm use 18
nvm alias default 18
```

#### Verify Installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### 2. PostgreSQL/Neon Database

This project uses **Neon PostgreSQL** (serverless PostgreSQL). No local PostgreSQL installation required.

**Setup:**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string (looks like: `postgresql://user:password@host/database?sslmode=require`)

**Alternative:** If you need local PostgreSQL:
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb spiral_groove_records
```

### 3. Git & GitHub

Ensure Git is installed and configured:
```bash
git --version
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🔐 Environment Variables Setup

### Step 1: Create `.env.local` File

Copy the example file:
```bash
cp .env.local.example .env.local
```

### Step 2: Configure Required Variables

Open `.env.local` and fill in the following:

#### Database Configuration

```env
# For Vercel deployments (use SGR_ prefix)
SGR_DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# For local development
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

**How to get Neon connection string:**
1. Go to your Neon dashboard
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string
5. Replace `[user]`, `[password]`, `[host]`, and `[database]` with your actual values

#### Square API Configuration

```env
# Square Application ID
SQUARE_APPLICATION_ID=your_square_application_id_here

# Square Access Token (Sandbox or Production)
SQUARE_ACCESS_TOKEN=your_square_access_token_here

# Square Environment (sandbox or production)
SQUARE_ENVIRONMENT=sandbox

# Square Location ID
SQUARE_LOCATION_ID=your_square_location_id_here

# Square Webhook Signature Key (for webhook verification)
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key_here
```

**How to get Square credentials:**
1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Create a new application or select existing
3. Go to "Credentials" section
4. Copy:
   - **Application ID**: Found in app settings
   - **Access Token**: Generate in "Credentials" → "Sandbox" or "Production"
   - **Location ID**: Found in "Locations" section
   - **Webhook Signature Key**: Found in "Webhooks" section

**Security Note:** 
- Use **Sandbox** tokens for development
- Use **Production** tokens only in production environment
- Never commit access tokens to Git

#### Client Portal Authentication

```env
# Client Portal Password (for /home access)
CLIENT_PASSWORD=your-secure-password-here

# JWT Secret Key (for session signing - use random 32+ character string)
AUTH_SECRET=your-random-secret-key-at-least-32-characters-long
```

**Generate secure values:**
```bash
# Generate random password (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Generate random AUTH_SECRET (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Optional: Make.com Webhook

```env
# Make.com Webhook URL (optional, for email notifications)
MAKE_WEBHOOK_URL=https://hook.us2.make.com/your-webhook-id
```

### Step 3: Verify Environment Variables

Check that all required variables are set:
```bash
# Check if .env.local exists
ls -la .env.local

# Verify variables are loaded (don't run this in production!)
node -e "require('dotenv').config({ path: '.env.local' }); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')"
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 15.0.3
- React 18.3.1
- Neon Serverless Driver
- Zod (validation)
- Tailwind CSS
- And other dependencies

### 2. Database Setup

#### Create Database Tables

If using Neon, run the SQL schema:

```sql
-- Email list table
CREATE TABLE IF NOT EXISTS email_list (
  id SERIAL PRIMARY KEY,
  "firstName" VARCHAR(50),
  "lastName" VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(100),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Or with snake_case:
CREATE TABLE IF NOT EXISTS email_list (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Using Neon SQL Editor:**
1. Go to your Neon project dashboard
2. Click "SQL Editor"
3. Paste the schema above
4. Click "Run"

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:3000`

## 🔒 Security Best Practices

### 1. Environment Variable Security

✅ **DO:**
- Store all secrets in `.env.local` (already in `.gitignore`)
- Use different values for development and production
- Rotate secrets regularly
- Use strong, random passwords and keys

❌ **DON'T:**
- Commit `.env.local` to Git (it's already ignored)
- Share environment variables in chat/email
- Use production credentials in development
- Hardcode secrets in code

### 2. Square API Security

- **Sandbox vs Production:**
  - Use `SQUARE_ENVIRONMENT=sandbox` for development
  - Use `SQUARE_ENVIRONMENT=production` only in production
  - Never mix sandbox and production credentials

- **Access Token Security:**
  - Tokens are long-lived but can be revoked
  - Regenerate if compromised
  - Store in environment variables only

### 3. Database Security

- **Connection Strings:**
  - Always use SSL (`?sslmode=require`)
  - Use connection pooling for production
  - Never log connection strings

- **Neon Specific:**
  - Use branch-specific connection strings for different environments
  - Enable automatic backups
  - Set up IP allowlists if needed

### 4. Client Portal Security

- **Password:**
  - Use a strong, unique password
  - Change regularly
  - Don't share with unauthorized users

- **AUTH_SECRET:**
  - Must be at least 32 characters
  - Use cryptographically random values
  - Different for each environment (dev/staging/prod)

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
# Create a test script
node -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL || process.env.SGR_DATABASE_URL);
sql\`SELECT NOW()\`.then(r => console.log('Database connected:', r[0])).catch(e => console.error('Error:', e));
"
```

### 2. Test Square API Connection

```bash
# Test Square API (requires Square credentials)
curl -X GET \
  'https://connect.squareupsandbox.com/v2/locations' \
  -H 'Authorization: Bearer YOUR_SQUARE_ACCESS_TOKEN' \
  -H 'Square-Version: 2023-10-18'
```

### 3. Test Client Portal

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Enter your `CLIENT_PASSWORD`
4. Should redirect to `/home`

## 📦 Production Deployment (Vercel)

### Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all required variables:
   - `SGR_DATABASE_URL` (use `SGR_` prefix for Vercel)
   - `SQUARE_APPLICATION_ID`
   - `SQUARE_ACCESS_TOKEN`
   - `SQUARE_ENVIRONMENT` (set to `production`)
   - `SQUARE_LOCATION_ID`
   - `SQUARE_WEBHOOK_SIGNATURE_KEY`
   - `CLIENT_PASSWORD`
   - `AUTH_SECRET`
   - `MAKE_WEBHOOK_URL` (optional)

4. Set environment scope:
   - **Production**: Production deployments
   - **Preview**: Preview deployments
   - **Development**: Local development (usually not needed)

### Vercel-Specific Notes

- Use `SGR_DATABASE_URL` instead of `DATABASE_URL` in Vercel
- All environment variables are encrypted at rest
- Variables are injected at build time
- Never commit Vercel tokens to Git

## 🐛 Troubleshooting

### Issue: "DATABASE_URL is not set"

**Solution:**
- Check `.env.local` exists
- Verify variable name matches exactly
- Restart dev server after adding variables

### Issue: "Cannot connect to database"

**Solution:**
- Verify connection string format
- Check SSL mode is `require`
- Ensure database is accessible from your IP
- Check Neon dashboard for connection status

### Issue: "Square API authentication failed"

**Solution:**
- Verify `SQUARE_ACCESS_TOKEN` is correct
- Check `SQUARE_ENVIRONMENT` matches token type (sandbox/production)
- Ensure token hasn't expired or been revoked
- Check Square Developer Dashboard for token status

### Issue: "CLIENT_PASSWORD environment variable is not set"

**Solution:**
- Ensure `.env.local` has `CLIENT_PASSWORD` set
- Restart dev server
- Check for typos in variable name
- In production, verify Vercel environment variables are set

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Neon Documentation](https://neon.tech/docs)
- [Square Developer Documentation](https://developer.squareup.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## ✅ Checklist

Before starting development, ensure:

- [ ] Node.js 18+ installed
- [ ] `.env.local` file created
- [ ] `DATABASE_URL` or `SGR_DATABASE_URL` configured
- [ ] Square API credentials configured (if using Square features)
- [ ] `CLIENT_PASSWORD` and `AUTH_SECRET` set
- [ ] Database tables created
- [ ] `npm install` completed
- [ ] `npm run dev` starts successfully
- [ ] Can access login page at `http://localhost:3000`
- [ ] Can log in with `CLIENT_PASSWORD`

---

**Security Reminder:** Never commit `.env.local` or share environment variables. They contain sensitive credentials.

