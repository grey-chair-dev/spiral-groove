# Catalog sync – database

## Slow image update query

The nightly sync runs `UPDATE products SET image_url = ... FROM image_mapping WHERE products.square_image_id = image_mapping.image_id`. That query is fast only if `products.square_image_id` is indexed.

### Required index (created automatically by sync)

The sync calls `ensureProductsIndexes()` at the start of each run, which runs:

```sql
CREATE INDEX IF NOT EXISTS idx_products_square_image_id
ON products (square_image_id)
WHERE square_image_id IS NOT NULL;
```

### If you still see “Slow database query” for image_mapping

1. **Create the index manually** (one-time, if the sync hasn’t run yet or failed before `ensureProductsIndexes`):

   ```sql
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_square_image_id
   ON products (square_image_id)
   WHERE square_image_id IS NOT NULL;
   ANALYZE products;
   ```

2. **Chunk size** – Image updates are chunked (default 120 objects per query). To tune:

   - `CATALOG_SYNC_IMAGE_BATCH_SIZE=120` (default; keep each query under ~1s)
   - Lower to 80 if alerts persist; raise to 200 if DB is strong and you want fewer round-trips.
