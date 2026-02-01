# Sync Jobs Explained

## Overview

There are **two separate sync jobs** that run daily via Vercel cron:

1. **Products Sync** (`/api/square/sync`) - 6:00 AM UTC
2. **Sales Sync** (`/api/square/sales-sync`) - 6:30 AM UTC

---

## 1. Products Sync (`/api/square/sync`)

### What It Does
Syncs **Square catalog items** (products) to the `products_cache` table in Neon.

### Data Synced
- ✅ **Product Information**: Name, description, price, category
- ✅ **Variations**: Each product variation (size, color, etc.)
- ✅ **Images**: Product images from Square
- ✅ **Inventory**: Current stock counts
- ✅ **Categories**: Product categories and tags
- ✅ **Metadata**: Created/updated timestamps

### Tables Updated
- `products_cache` - Main product catalog table

### Schedule
- **Cron**: Daily at 6:00 AM UTC (`0 6 * * *`)
- **Default**: Full sync (all products)
- **Manual**: Can sync specific items via POST with `squareItemIds` or `squareVariationIds`

### Example Response
```json
{
  "success": true,
  "result": {
    "items": 150,
    "variations": 200,
    "upserted": 200
  }
}
```

---

## 2. Sales Sync (`/api/square/sales-sync`)

### What It Does
Syncs **Square orders** (sales transactions) to Neon database.

### Data Synced
- ✅ **Orders**: Order records from Square
- ✅ **Line Items**: Individual items in each order
- ✅ **Sold Counts**: Updates `sold_count` in `products_cache`
- ✅ **Last Sold Dates**: Updates `last_sold_at` timestamps

### Tables Updated
- `orders` - Order records
- `order_items` - Line items for each order
- `products_cache` - Updates `sold_count` and `last_sold_at`
- `sales_sync_state` - Tracks last sync timestamp

### Schedule
- **Cron**: Daily at 6:30 AM UTC (`30 6 * * *`)
- **Default**: Last 24 hours (incremental)
- **Manual**: Can backfill historical orders via POST

### Example Response
```json
{
  "success": true,
  "range": {
    "startAt": "2025-01-31T06:30:00Z",
    "endAt": "2025-02-01T06:30:00Z"
  },
  "pages": 3,
  "orders": 45,
  "insertedLineItems": 120,
  "lastSyncedAt": "2025-02-01T06:25:00Z"
}
```

---

## Key Differences

| Feature | Products Sync | Sales Sync |
|---------|--------------|------------|
| **Source** | Square Catalog API | Square Orders API |
| **Target Table** | `products_cache` | `orders`, `order_items` |
| **Frequency** | Daily (full sync) | Daily (incremental) |
| **Time Range** | All products | Last 24 hours |
| **Purpose** | Keep product catalog up-to-date | Track sales & update analytics |
| **Also Updates** | - | `products_cache.sold_count` |

---

## Sync Logging

Both syncs are now logged to the `sync_log` table:

```sql
SELECT 
  sync_type,
  status,
  started_at,
  completed_at,
  duration_ms,
  items_processed,
  items_created,
  error_message
FROM sync_log
ORDER BY created_at DESC
LIMIT 10;
```

### Log Fields
- `sync_type`: `"products"` or `"sales"`
- `status`: `"success"` or `"error"`
- `duration_ms`: How long the sync took
- `items_processed`: Number of items/orders processed
- `items_created`: Number of new records created
- `error_message`: Error details if failed

---

## Monitoring

### Check Last Sync
```sql
-- Last successful products sync
SELECT * FROM sync_log 
WHERE sync_type = 'products' AND status = 'success'
ORDER BY completed_at DESC LIMIT 1;

-- Last successful sales sync
SELECT * FROM sync_log 
WHERE sync_type = 'sales' AND status = 'success'
ORDER BY completed_at DESC LIMIT 1;
```

### Check for Errors
```sql
-- Recent sync errors
SELECT 
  sync_type,
  started_at,
  error_message,
  duration_ms
FROM sync_log
WHERE status = 'error'
ORDER BY started_at DESC
LIMIT 10;
```

### Sync Health
```sql
-- Sync success rate (last 30 days)
SELECT 
  sync_type,
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM sync_log
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY sync_type;
```

---

## Manual Execution

### Products Sync
```bash
# Full sync
curl -X POST https://your-domain.com/api/square/sync \
  -H "x-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"full": true}'

# Sync specific items
curl -X POST https://your-domain.com/api/square/sync \
  -H "x-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"squareItemIds": ["ITEM_ID_1", "ITEM_ID_2"]}'
```

### Sales Sync
```bash
# Sync last 24 hours (default)
curl -X POST https://your-domain.com/api/square/sales-sync \
  -H "x-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json"

# Backfill specific date range
curl -X POST https://your-domain.com/api/square/sales-sync \
  -H "x-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "startAt": "2025-01-01T00:00:00Z",
    "endAt": "2025-01-31T23:59:59Z"
  }'
```

---

## Troubleshooting

### Products Not Updating
1. Check `sync_log` for recent products sync errors
2. Verify `SQUARE_ACCESS_TOKEN` is set
3. Check Square API rate limits
4. Review sync logs in Vercel dashboard

### Sales Not Syncing
1. Check `sync_log` for recent sales sync errors
2. Verify `sales_sync_state` table exists
3. Check if orders exist in Square for the time range
4. Review `last_synced_at` in `sales_sync_state`

### Both Syncs Failing
1. Check database connection (`DATABASE_URL`)
2. Verify Square API credentials
3. Check Vercel cron job configuration
4. Review function logs in Vercel dashboard
