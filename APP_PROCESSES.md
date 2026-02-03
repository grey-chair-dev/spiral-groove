# Spiral Groove Records - All Processes

## Overview
This document lists all processes, cron jobs, API endpoints, and background tasks in the Spiral Groove Records application.

---

## 🕐 Scheduled Cron Jobs (Vercel)

### 1. **Products Sync** (`/api/square/sync`)
- **Schedule**: Daily at 6:00 AM UTC (`0 6 * * *`)
- **Purpose**: Syncs Square catalog items to `products_cache` table
- **What it does**:
  - Fetches all products from Square Catalog API
  - Updates `products_cache` with product info, prices, images, categories
  - Updates inventory counts
  - Deletes products that no longer exist in Square
  - Populates `albums_cache` table after sync completes
- **Tables Updated**: `products_cache`, `albums_cache`
- **Logs**: Creates entry in `sync_log` table

### 2. **Sales Sync** (`/api/square/sales-sync`)
- **Schedule**: Daily at 6:30 AM UTC (`30 6 * * *`)
- **Purpose**: Syncs Square orders to database
- **What it does**:
  - Fetches orders from Square (last 24 hours by default)
  - Inserts orders into `sales_orders` table
  - Inserts line items into `sales_line_items` table
  - Updates `sold_count` and `last_sold_at` in `products_cache`
- **Tables Updated**: `sales_orders`, `sales_line_items`, `products_cache`, `sales_sync_state`
- **Logs**: Creates entry in `sync_log` table

### 3. **Weekly Newsletter** (`/api/weekly-newsletter-bulk`)
- **Schedule**: Every Friday at 9:00 AM UTC (`0 9 * * 5`)
- **Purpose**: Sends weekly newsletter to all subscribers
- **What it does**:
  - Fetches all newsletter subscribers from `email_list` table
  - For each subscriber:
    - Fetches upcoming events
    - Fetches new records (last 2 weeks)
    - Generates personalized recommendations based on purchase history
    - Sends HTML email via Make.com webhook
  - Logs results to Slack
- **Tables Used**: `email_list`, `events`, `products_cache`, `orders`, `order_items`

---

## 🔌 API Endpoints

### Product & Catalog
- **`GET /api/products`** - Fetches all products from `albums_cache` (or `products_cache` fallback)
- **`GET /api/staff-picks`** - Fetches staff picks with product data merged
- **`GET /api/sales/best-sellers`** - Fetches best-selling products

### Orders & Payments
- **`POST /api/pay`** - Processes Square payment and creates order
- **`GET /api/orders`** - Fetches orders (with authentication)
- **`POST /api/orders/update`** - Updates order status
- **`GET /api/orders/:id`** - Gets specific order details

### Events
- **`GET /api/events`** - Fetches upcoming events
- **`POST /api/event-inquiry`** - Handles event RSVP/inquiry

### Newsletter & Email
- **`POST /api/newsletter`** - Subscribes user to newsletter
- **`POST /api/newsletter/unsubscribe`** - Unsubscribes user
- **`POST /api/weekly-newsletter`** - Sends test newsletter to single email
- **`POST /api/weekly-newsletter-bulk`** - Sends newsletter to all subscribers (cron)

### Contact & Forms
- **`POST /api/contact-inquiry`** - Handles contact form submissions
- **`POST /api/signup`** - User account signup
- **`POST /api/forgot-password`** - Password reset request

### Sync & Admin
- **`GET/POST /api/square/sync`** - Syncs Square products (cron + manual)
- **`GET/POST /api/square/sales-sync`** - Syncs Square sales (cron + manual)
- **`POST /api/inventory/log`** - Logs inventory changes from Square webhooks

### Utilities
- **`GET /api/robots.js`** - Returns robots.txt
- **`POST /api/webhook/test`** - Test webhook endpoint
- **`POST /api/notifyWebhook`** - Generic webhook notification handler

---

## 🔄 Background Processes

### 1. **Error Alerting System** (`api/slackAlerts.js`)
- **Trigger**: Automatic on API errors
- **What it does**:
  - Detects errors, slow queries, and performance issues
  - Sends alerts to Make.com webhook (`MAKE_ALERTS_WEBHOOK_URL`)
  - Includes stack traces, context, AI fix prompts, screenshots (frontend errors)
  - Deduplicates alerts to prevent spam
  - Detects error spikes (10+ errors in 5 minutes)
- **Alert Types**:
  - API errors (4xx, 5xx)
  - Slow database queries (>500ms)
  - Slow API responses (>2000ms)
  - Frontend errors (with screenshots)
  - Error frequency spikes

### 2. **Email System** (`api/sendEmail.js`)
- **Trigger**: Various endpoints call this
- **What it does**:
  - Sends emails via Make.com webhook (`MAKE_EMAIL_WEBHOOK_URL`)
  - Email types:
    - Newsletter subscription confirmations
    - Order confirmations
    - Order status updates
    - Password reset emails
    - Weekly newsletter
    - Alert emails
- **Templates**: Defined in `api/emailTemplates.js`

### 3. **Performance Tracking** (`api/performanceTracker.js`)
- **Trigger**: Automatic on API requests
- **What it does**:
  - Tracks response times per endpoint
  - Monitors query durations
  - Sends alerts for slow performance

### 4. **Albums Cache Population** (`api/albumsCache.js`)
- **Trigger**: After products sync completes
- **What it does**:
  - Creates `albums_cache` table if missing
  - Populates with only album products (filters out DVDs, etc.)
  - Pre-filters for faster queries
  - Updates indexes

---

## 📝 Manual Scripts (npm run)

### Database Management
- **`npm run db:index-events`** - Adds indexes to `events` table
- **`npm run db:index-created-at`** - Adds `created_at` indexes to `products_cache` and `albums_cache`
- **`npm run db:optimize`** - Optimizes database performance (adds missing indexes, updates statistics)

### Sync Jobs
- **`npm run sync:square`** - Manual Square products sync
- **`npm run sync:sales`** - Manual Square sales sync

### Newsletter
- **`npm run send:weekly-newsletter`** - Sends test weekly newsletter

### Validation
- **`npm run validate:staff-picks`** - Validates staff picks against products in database

### Development
- **`npm run dev`** - Starts Vite dev server (frontend)
- **`npm run dev:api`** - Starts API dev server
- **`npm run build`** - Builds production bundle
- **`npm run build:css`** - Builds Tailwind CSS

---

## 🔗 Webhook Handlers

### Square Webhooks
- **`POST /api/inventory/log`** - Receives inventory change webhooks from Square
  - Updates `inventory` table
  - Updates `products_cache.stock_count`
  - Updates `last_stocked_at` and `last_adjustment_at`

### Make.com Webhooks
- **`MAKE_ALERTS_WEBHOOK_URL`** - Receives error alerts
- **`MAKE_EMAIL_WEBHOOK_URL`** - Receives email send requests

---

## 📊 Database Tables

### Product Tables
- **`products_cache`** - Main product catalog (synced from Square)
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
- **`sync_log`** - Sync job execution logs
- **`sales_sync_state`** - Sales sync state tracking

---

## 🔐 Authentication & Security

### Rate Limiting
- Implemented in `lib/rate-limit.ts`
- Prevents API abuse

### Webhook Security
- **`WEBHOOK_SECRET`** - Required for manual sync triggers (non-cron)
- **Vercel Cron** - Automatically authenticated via `x-vercel-cron` header

### Environment Variables
- **`SQUARE_ACCESS_TOKEN`** - Square API authentication
- **`SQUARE_LOCATION_ID`** - Square location ID
- **`SQUARE_ENVIRONMENT`** - `production` or `sandbox`
- **`SGR_DATABASE_URL`** - Neon PostgreSQL connection string
- **`MAKE_ALERTS_WEBHOOK_URL`** - Make.com alerts webhook
- **`MAKE_EMAIL_WEBHOOK_URL`** - Make.com email webhook
- **`WEBHOOK_SECRET`** - Secret for manual API calls

---

## 📈 Monitoring & Logging

### Sync Logging
- All sync jobs log to `sync_log` table
- Includes: status, duration, items processed, metadata

### Error Logging
- Errors sent to Make.com webhook
- Includes: stack traces, context, AI fix prompts

### Performance Monitoring
- Tracks response times per endpoint
- Alerts on slow queries (>500ms) and slow APIs (>2000ms)

---

## 🎯 Key Workflows

### Product Sync Workflow
1. Cron triggers `/api/square/sync` at 6:00 AM UTC
2. Fetches all items from Square Catalog API
3. Processes variations and inventory
4. Upserts into `products_cache`
5. Deletes products no longer in Square
6. Populates `albums_cache` table
7. Logs results to `sync_log`

### Sales Sync Workflow
1. Cron triggers `/api/square/sales-sync` at 6:30 AM UTC
2. Fetches orders from Square (last 24 hours)
3. Inserts into `sales_orders` and `sales_line_items`
4. Updates `sold_count` and `last_sold_at` in `products_cache`
5. Updates `sales_sync_state` with last sync timestamp
6. Logs results to `sync_log`

### Weekly Newsletter Workflow
1. Cron triggers `/api/weekly-newsletter-bulk` every Friday at 9:00 AM UTC
2. Fetches all subscribers from `email_list`
3. For each subscriber:
   - Fetches upcoming events
   - Fetches new records (last 2 weeks)
   - Generates personalized recommendations
   - Sends email via Make.com webhook
4. Logs results to Slack

### Error Alert Workflow
1. API error occurs
2. `slackAlerts.js` captures error details
3. Generates AI fix prompt
4. Captures screenshot (if frontend error)
5. Sends to Make.com webhook
6. Deduplicates to prevent spam

---

## 🛠️ Maintenance Scripts

Located in `scripts/` directory:
- **`add-created-at-index.mjs`** - Adds `created_at` indexes
- **`add-events-indexes.mjs`** - Adds event table indexes
- **`create-sync-log-table.mjs`** - Creates sync log table
- **`optimize-database-performance.mjs`** - Database optimization
- **`optimize-products-cache-indexes.mjs`** - Removes redundant indexes
- **`populate-albums-cache.mjs`** - Manual albums cache population
- **`send-weekly-newsletter.mjs`** - Manual newsletter send
- **`sync-square.mjs`** - Manual Square sync
- **`sync-square-sales.mjs`** - Manual sales sync
- **`test-cron-endpoints.mjs`** - Tests cron endpoints
- **`validate-staff-picks.mjs`** - Validates staff picks

---

## 📅 Schedule Summary

| Time (UTC) | Day | Process | Endpoint |
|------------|-----|---------|----------|
| 6:00 AM | Daily | Products Sync | `/api/square/sync` |
| 6:30 AM | Daily | Sales Sync | `/api/square/sales-sync` |
| 9:00 AM | Friday | Weekly Newsletter | `/api/weekly-newsletter-bulk` |

---

## 🔄 Data Flow

### Product Data Flow
```
Square Catalog API → /api/square/sync → products_cache → albums_cache → /api/products → Frontend
```

### Sales Data Flow
```
Square Orders API → /api/square/sales-sync → sales_orders + sales_line_items → products_cache (sold_count) → Analytics
```

### Newsletter Flow
```
email_list → /api/weekly-newsletter-bulk → Make.com Webhook → Email Delivery
```

---

## 🚨 Error Handling

- **API Errors**: Captured by `slackAlerts.js`, sent to Make.com
- **Database Errors**: Retry logic in `api/db.js` for connection issues
- **Sync Failures**: Logged to `sync_log` table, errors sent to alerts
- **Email Failures**: Logged, but don't block newsletter process

---

## 📝 Notes

- All cron jobs run on Vercel
- Manual triggers require `WEBHOOK_SECRET` header in production
- Development mode allows GET requests without authentication
- All syncs are idempotent (safe to run multiple times)
- `albums_cache` is repopulated after each products sync
