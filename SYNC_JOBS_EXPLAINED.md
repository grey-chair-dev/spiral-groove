# Sync Jobs Explained

## Overview

Square sync jobs have been removed. There is no scheduled Square catalog pull.

---

## (Removed) Products Sync

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

## (Removed) Sales Sync
*(Removed)* This project no longer runs a Square “sales pull” job.

## Sync Logging

Historically, the products sync logged to the `sync_log` table:

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

---

## ⚡ Query/index optimization (recommended)

To keep Neon fast as inventory + orders grow, run:

```bash
npm run db:optimize
```

This adds indexes that directly support the hot API paths:

- **`/api/products`**
  - `albums_cache` indexes for the stock/date filter and `ORDER BY created_at DESC`
- **`/api/orders`** / **`/api/orders/update`**
  - indexes for `order_number` and `square_order_id`
  - expression indexes for `pickup_details` lookup keys (email/phone)
- **`/api/pay`**
  - indexes for `customers.email` and `customers.square_customer_id`
  - `order_items.order_id` (also used by reporting)

The script finishes by running `ANALYZE` on relevant tables to refresh planner stats.

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

*(Removed)* Square sync endpoints no longer exist.

---

## Troubleshooting

### Products Not Updating
If products are not updating, check your inventory webhook ingest (`POST /api/inventory/log`) and your database state (`products_cache`, `albums_cache`).

### Sales Not Syncing
*(Removed)* Sales sync has been deleted.
3. Check if orders exist in Square for the time range
4. Review `last_synced_at` in `sales_sync_state`

### Both Syncs Failing
1. Check database connection (`DATABASE_URL`)
2. Verify Square API credentials
3. Check Vercel cron job configuration
4. Review function logs in Vercel dashboard
