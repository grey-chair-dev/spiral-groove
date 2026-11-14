# Spiral Groove Records - All Processes

## Overview
This document lists all processes, cron jobs, API endpoints, and background tasks in the Spiral Groove Records application.

---

## Scheduled Cron Jobs (Vercel)

### 1. **(Removed) Square Products Sync** (`/api/square/sync`)
- This sync has been removed and is no longer scheduled or callable.

### 2. **Weekly Newsletter** (`/api/weekly-newsletter-bulk`)
- **Schedule**: Every Friday at 9:00 AM UTC (`0 9 * * 5`)
- **Purpose**: Sends weekly newsletter to all subscribers
- **What it does**:
  - Fetches all newsletter subscribers from `email_list` table
  - For each subscriber:
    - Fetches upcoming events
    - Fetches new records (last 2 weeks)
    - Generates personalized recommendations based on purchase history
    - Sends HTML email via SMTP (`SGR_SMTP_URL`)
  - Ops summary / failures via `sendSlackAlert` (email to alerts@)
- **Tables Used**: `email_list`, `events`, `products_cache`, `orders`, `order_items`

### 3. **Catalog Sync Nightly** (`/api/catalog-sync-nightly`)
- **Schedule**: Daily 6:00 AM UTC (`0 6 * * *`)
- **Purpose**: Square Catalog → Postgres, then rebuild `albums_cache`

### 4. **Monthly Report** (`/api/monthly-report`)
- **Schedule**: 1st of month 8:00 AM UTC (`0 8 1 * *`)

### 5. **Staff Picks Weekly** (`/api/staff-picks-weekly`)
- **Schedule**: Mondays 7:45 AM UTC (`45 7 * * 1`)
- **Purpose**: LLM refresh of staff-pick quotes (replaces Make "Staff Picks")

### 6. **Instagram Events Sync** (`/api/instagram-events-sync`)
- **Schedule**: Daily 10:40 PM UTC (`40 22 * * *`)
- **Purpose**: Fetch public Instagram posts via api-anything, insert new events (replaces Make "Events From Instagram")

### 7. **Google Reviews Sync** (`/api/google-reviews-sync`) — PARKED
- **Schedule**: Every 15 minutes (`*/15 * * * *`) — no-ops while flag off
- **Purpose**: GBP new reviews → LLM reply; 4–5★ auto-post, 1–3★ email Adam (flag `googleReviews`)
- **Parked 2026-11-14**: GCP project denied GBP API Basic Access; keep `googleReviews` off. See `docs/make-google-review-flow.md`.

---

## API Endpoints

### Product & Catalog
- **`GET /api/products`** - Fetches all products from `albums_cache` (or `products_cache` fallback)
- **`GET /api/staff-picks`** - Fetches staff picks with product data merged

### Orders & Payments
- **`POST /api/pay`** - Processes Square payment and creates order
- **`GET /api/orders`** - Fetches orders (with authentication)
- **`PATCH /api/orders/update`** - Updates order status (Square webhook / ops); see **`docs/square-webhooks.md`**
- **`GET /api/orders/:id`** - Gets specific order details
- **`POST /api/square/webhook`** - Square www inventory + order-status events (HMAC)

### Events
- **`GET /api/events`** - Fetches upcoming events
- **`POST /api/event-inquiry`** - Handles event RSVP/inquiry

### Newsletter & Email
- **`POST /api/newsletter`** - Subscribes user to newsletter
- **`POST /api/newsletter/unsubscribe`** - Unsubscribes user
- **`POST /api/weekly-newsletter`** - Sends test newsletter to single email
- **`POST /api/weekly-newsletter-bulk`** - Sends newsletter to all subscribers (cron)
- **`POST /api/sendEmail`** - Direct transactional email (SMTP)

### Contact & Forms
- **`POST /api/contact-inquiry`** - Handles contact form submissions
- **`POST /api/signup`** - User account signup
- **`POST /api/forgot-password`** - Password reset request

### Sync & Admin
- **`GET/POST /api/catalog-sync-nightly`** - Nightly Square catalog sync
- **`GET/POST /api/staff-picks-weekly`** - Weekly staff picks refresh
- **`GET/POST /api/instagram-events-sync`** - Instagram → events

### Utilities
- **`GET /api/robots.js`** - Returns robots.txt
- **`GET /api/health`** - Health check

*(Removed)* `/api/notifyWebhook`, `/api/inventory/log`, `/api/webhook/test` — Make-era relays deleted.

---

## Background Processes

### 1. **Error Alerting System** (`api/slackAlerts.js`)
- **Trigger**: Automatic on API errors
- **What it does**:
  - Detects errors, slow queries, and performance issues
  - Emails alerts@ via SMTP (`SGR_ALERTS_SMTP_URL` / `ALERTS_SMTP_URL` / `SGR_SMTP_URL`)
  - Includes stack traces, context, AI fix prompts, screenshots (frontend errors)
  - Deduplicates alerts to prevent spam
  - Detects error spikes (10+ errors in 5 minutes)
- **Alert Types**:
  - API errors (4xx, 5xx)
  - Slow database queries (>500ms)
  - Slow API responses (>2000ms)
  - Frontend errors (with screenshots)
  - Error frequency spikes

### 2. **Email System** (`api/sendEmail.js` + `api/_lib/mailer.js`)
- **Trigger**: Various endpoints call this
- **What it does**:
  - Sends emails via SMTP (`SGR_SMTP_URL`) only (Make email webhooks removed)
  - Email types:
    - Newsletter subscription confirmations
    - Order confirmations
    - Order status updates
    - Password reset emails
    - Weekly newsletter
    - Alert emails
- **Templates**: Defined in `api/emailTemplates.js`

### 3. **Albums Cache Population** (`api/albumsCache.js`)
- **Trigger**: Run manually / on deploy as needed (also after nightly catalog sync)
- **What it does**:
  - Creates `albums_cache` table if missing
  - Populates with only album products (filters out DVDs, etc.)
  - Pre-filters for faster queries

---

## NPM Scripts

### Development
- **`npm run dev`** - Starts Vite dev server (frontend)
- **`npm run dev:api`** - Starts API dev server
- **`npm run build`** - Builds production bundle
- **`npm run build:css`** - Builds Tailwind CSS

---

## Webhook Handlers

### Square Webhooks
- **`POST /api/square/webhook`** - Inventory count + order status updates (see `docs/square-webhooks.md`)
  - Updates inventory / `albums_cache` stock
  - Writes order status via `orders/update` path

### Email / alerts (post-Make cutover)
- **`SGR_SMTP_URL`** - Direct SMTP for customer + inquiry + alert mail (see `docs/square-webhooks.md`)
- Leftover `MAKE_*` vars removed from Vercel (2026-11-14; no longer read by app code)

---

## Database Tables

### Product Tables
- **`products_cache`** - Main product catalog (populated via Square sync historically; now updated via webhooks/manual processes)
- **`albums_cache`** - Pre-filtered albums only (for faster queries)
- **`staff_picks`** - Staff pick metadata

### Order Tables
- **`orders`** - Customer orders
- **`order_items`** - Line items for each order
- **`sales_orders`** - Square order records
- **`sales_line_items`** - Square order line items

### Customer Tables
- **`customers`** - Customer records
- **`email_list`** - Newsletter subscribers

### Event Tables
- **`events`** - Upcoming events

### Inventory Tables
- **`inventory`** - Inventory change log

### Sync & Logging Tables
- **`sync_log`** - Historical sync job execution logs
- **`sales_sync_state`** - Historical sales sync state tracking

---

## Authentication & Security

### Rate Limiting
- Implemented in `lib/rate-limit.ts`
- Prevents API abuse

### Webhook Security
- **`WEBHOOK_SECRET`** - Required for manual sync triggers (non-cron)
- **`SQUARE_WEBHOOK_SIGNATURE_KEY`** - Square HMAC on `/api/square/webhook`
- **Vercel Cron** - Automatically authenticated via `x-vercel-cron` header (or `CRON_SECRET` Bearer when set)

### Environment Variables
- **`SQUARE_ACCESS_TOKEN`** - Square API authentication
- **`SQUARE_LOCATION_ID`** - Square location ID
- **`SQUARE_ENVIRONMENT`** - `production` or `sandbox`
- **`SGR_DATABASE_URL`** - Neon PostgreSQL connection string
- **`SGR_SMTP_URL`** - Direct SMTP (replaces Make email scenarios)
- **`SQUARE_WEBHOOK_SIGNATURE_KEY`** - Square → `/api/square/webhook`
- **`WEBHOOK_SECRET`** - Secret for manual API calls

---

## Monitoring & Logging

### Sync Logging
- All sync jobs log to `sync_log` table
- Includes: status, duration, items processed, metadata

### Error Logging
- Errors emailed to alerts@ via `slackAlerts.js` (SMTP)
- Includes: stack traces, context, AI fix prompts

### Performance Monitoring
- Tracks response times per endpoint
- Alerts on slow queries (>500ms) and slow APIs (>2000ms)

---

## Key Workflows

### Product Sync Workflow
Nightly catalog sync + Square inventory webhooks keep `products_cache` / `albums_cache` current. *(Legacy ad-hoc Square products sync removed.)*

### Sales Sync Workflow
*(Removed)* Square sales sync workflow has been deleted.

### Weekly Newsletter Workflow
1. Cron triggers `/api/weekly-newsletter-bulk` every Friday at 9:00 AM UTC
2. Fetches all subscribers from `email_list`
3. For each subscriber:
   - Fetches upcoming events
   - Fetches new records (last 2 weeks)
   - Generates personalized recommendations
   - Sends email via SMTP
4. Ops summary via `sendSlackAlert` (email)

### Error Alert Workflow
1. API error occurs
2. `slackAlerts.js` captures error details
3. Generates AI fix prompt
4. Captures screenshot (if frontend error)
5. Emails alerts@ via SMTP
6. Deduplicates to prevent spam

---

## Maintenance Scripts

Located in `scripts/` directory:
- **`add-created-at-index.mjs`** - Adds `created_at` indexes
- **`add-events-indexes.mjs`** - Adds event table indexes
- **`create-sync-log-table.mjs`** - Creates sync log table
- **`optimize-database-performance.mjs`** - Database optimization
- **`optimize-products-cache-indexes.mjs`** - Removes redundant indexes
- **`populate-albums-cache.mjs`** - Manual albums cache population
- **`send-weekly-newsletter.mjs`** - Manual newsletter send
*(Removed)* Square sync scripts deleted (`sync-square.mjs`, `sync-square-sales.mjs`, `test-cron-endpoints.mjs`).
- **`validate-staff-picks.mjs`** - Validates staff picks

---

## Schedule Summary

| Time (UTC) | Day | Process | Endpoint |
|------------|-----|---------|----------|
| 6:00 AM | Daily | Catalog sync | `/api/catalog-sync-nightly` |
| 7:45 AM | Monday | Staff picks | `/api/staff-picks-weekly` |
| 8:00 AM | 1st | Monthly report | `/api/monthly-report` |
| 9:00 AM | Friday | Weekly Newsletter | `/api/weekly-newsletter-bulk` |
| 10:40 PM | Daily | Instagram events | `/api/instagram-events-sync` |

---

## Data Flow

### Product Data Flow
```
Square Catalog API → catalog-sync-nightly / webhooks → products_cache → albums_cache → /api/products → Frontend
```

### Sales Data Flow
```
Square Orders API → (removed sync) → sales_orders + sales_line_items → products_cache (sold_count) → Analytics
```

### Newsletter Flow
```
email_list → /api/weekly-newsletter-bulk → SMTP (SGR_SMTP_URL) → Email Delivery
```

---

## Error Handling

- **API Errors**: Captured by `slackAlerts.js`, emailed to alerts@
- **Database Errors**: Retry logic in `api/db.js` for connection issues
- **Sync Failures**: Logged to `sync_log` table, errors sent to alerts
- **Email Failures**: Logged, but don't block newsletter process

---

## Notes

- All cron jobs run on Vercel
- All 11 Spiral Make scenarios inactive (confirmed Make API 2026-11-14); `MAKE_*` env gone from Vercel
- Google review replies **parked**: in-repo code behind flag `googleReviews` (off); Make scenarios OFF; unpark only after GBP API approval (`docs/make-google-review-flow.md`)
