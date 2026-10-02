# 1Password Integration Guide

This guide explains how to use 1Password to manage secrets for Spiral Groove Records.

## Why Use 1Password?

- ✅ **Secure storage** - Secrets never in code or commits
- ✅ **Team sharing** - Share secrets with developers securely
- ✅ **Easy rotation** - Update secrets in one place
- ✅ **Audit trail** - See who accessed what and when

## Prerequisites

1. **1Password account** (Team or Individual)
2. **1Password CLI** installed

### Install 1Password CLI

```bash
# macOS
brew install 1password-cli

# Windows (using winget)
winget install 1Password.CLI

# Linux (Debian/Ubuntu)
curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
  sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/$(dpkg --print-architecture) stable main" | \
  sudo tee /etc/apt/sources.list.d/1password.list
sudo apt update && sudo apt install 1password-cli
```

Verify installation:
```bash
op --version
```

## Setup

### 1. Create Vault in 1Password

1. Open **1Password** app or go to **1password.com**
2. Create a vault named **"Development"** (or use existing)
3. Share with your team members

### 2. Create Secret Item

Create a new **Login** or **Password** item:

**Item Name:** `Spiral Groove - Environment Variables`

**Vault:** `Development`

**Fields to add:**

| Field Name | Type | Description |
|-----------|------|-------------|
| `MAKE_EMAIL_WEBHOOK_URL` | Password | Make.com email webhook |
| `MAKE_CONTACT_US_WEBHOOK_URL` | Password | Make.com contact form webhook |
| `MAKE_ALERTS_WEBHOOK_URL` | Password | Make.com alerts webhook |
| `SQUARE_ACCESS_TOKEN` | Password | Square API token |
| `SQUARE_LOCATION_ID` | Text | Square location ID |
| `SQUARE_ENVIRONMENT` | Text | `production` or `sandbox` |
| `SGR_DATABASE_URL` | Password | Neon PostgreSQL connection string |
| `WEBHOOK_SECRET` | Password | Webhook security secret |
| `GA4_PROPERTY_ID` | Text | Google Analytics property ID |
| `GA4_SERVICE_ACCOUNT_JSON` | Password | GA4 service account JSON |
| `MONTHLY_REPORT_RECIPIENTS` | Text | Email addresses for reports |

### 3. Load Secrets Locally

Use the provided script to sync secrets to `.env.local`:

```bash
./scripts/setup-1password-secrets.sh
```

This will:
1. Check if 1Password CLI is installed
2. Sign you in (if needed)
3. Fetch secrets from 1Password
4. Write them to `.env.local`

### 4. Run Your Dev Server

```bash
npm run dev
```

The app will load environment variables from `.env.local`.

## Usage

### Loading Secrets

**Option 1: Using the setup script (recommended)**
```bash
./scripts/setup-1password-secrets.sh
```

**Option 2: Manual with 1Password CLI**
```bash
# Sign in
eval $(op signin)

# Get specific secret
op item get "Spiral Groove - Environment Variables" \
  --vault "Development" \
  --fields MAKE_EMAIL_WEBHOOK_URL

# Export all secrets to .env.local
op item get "Spiral Groove - Environment Variables" \
  --vault "Development" \
  --format json | \
  jq -r '.fields[] | select(.label != null and .value != null) | "\(.label)=\(.value)"' > .env.local
```

**Option 3: Using 1Password Shell Plugin**
```bash
# Install plugin
eval $(op plugin init bash)  # or zsh

# Run with automatic secret injection
op run --env-file=.env.1password -- npm run dev
```

### Updating Secrets

1. Open 1Password
2. Edit the item: `Spiral Groove - Environment Variables`
3. Update the field value
4. Run `./scripts/setup-1password-secrets.sh` again to sync

### Adding New Secrets

1. Open 1Password item
2. Click **Add Field**
3. Choose type: **Password** (for sensitive data) or **Text**
4. Enter field name (must match env var name)
5. Enter value
6. Save
7. Run setup script to sync

## Production (Vercel)

For Vercel deployment, manually copy secrets:

### One-Time Setup

1. Open 1Password item
2. For each secret:
   - Copy value from 1Password
   - Go to **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**
   - Add new variable
   - Paste value
   - Select environment (Production, Preview, Development)
   - Save

### When Secrets Change

1. Update in 1Password
2. Update in Vercel Dashboard
3. **Redeploy** (Vercel doesn't auto-reload env vars)

## Security Best Practices

### ✅ DO

- ✅ Store all secrets in 1Password
- ✅ Use `.env.local` for local development
- ✅ Add `.env.local` to `.gitignore` (already done)
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/staging/production
- ✅ Share vault with team members who need access
- ✅ Use 2FA on 1Password account

### ❌ DON'T

- ❌ Commit `.env.local` or `.env.1password` files
- ❌ Share secrets via email, Slack, or text
- ❌ Hardcode secrets in code
- ❌ Use production secrets in development
- ❌ Share your 1Password master password

## Troubleshooting

### "op: command not found"

Install 1Password CLI (see Prerequisites above).

### "authentication required"

Sign in:
```bash
eval $(op signin)
```

### "item not found"

Check:
1. Item name is exactly: `Spiral Groove - Environment Variables`
2. Item is in vault: `Development`
3. You have access to the vault

Create the item if it doesn't exist (see Setup section).

### "permission denied" on setup script

Make it executable:
```bash
chmod +x scripts/setup-1password-secrets.sh
```

### Secrets not loading in app

1. Check `.env.local` exists:
   ```bash
   cat .env.local
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Verify variable names match exactly (case-sensitive)

## MCP Server (Future)

If 1Password releases an official MCP server, you can connect it to Cursor:

**File:** `~/.cursor/config/mcp_settings.json`

```json
{
  "mcpServers": {
    "1password": {
      "command": "npx",
      "args": ["-y", "@1password/mcp-server"],
      "env": {
        "OP_SERVICE_ACCOUNT_TOKEN": "your-service-account-token"
      }
    }
  }
}
```

Then restart Cursor and authenticate the MCP server.

## Reference Links

- [1Password CLI Docs](https://developer.1password.com/docs/cli/)
- [1Password Shell Plugins](https://developer.1password.com/docs/cli/shell-plugins/)
- [1Password Service Accounts](https://developer.1password.com/docs/service-accounts/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Quick Commands

```bash
# Sign in to 1Password
eval $(op signin)

# Sync secrets from 1Password
./scripts/setup-1password-secrets.sh

# View a specific secret
op item get "Spiral Groove - Environment Variables" \
  --vault "Development" \
  --fields MAKE_EMAIL_WEBHOOK_URL

# List all secrets (names only)
op item get "Spiral Groove - Environment Variables" \
  --vault "Development" \
  --format json | jq -r '.fields[].label'

# Run dev server with 1Password
op run --env-file=.env.1password -- npm run dev

# Update all Vercel env vars (manual)
# 1. Copy from 1Password
# 2. Paste in Vercel Dashboard
# 3. Redeploy
```
