### DB Query Timings Report

- **Generated**: 2026-02-06T01:30:57.107Z
- **Env**: `development`
- **DB URL configured**: true

## GET /api/products

- **Handler duration**: 626ms
- **DB queries captured**: 1
- **Handler result**: `200`

### Top queries (by total time)

| total ms | count | max ms | ok/err | sql (normalized) |
|---:|---:|---:|---:|---|
| 539 | 1 | 539 | 1/0 | `SELECT id, name, description, price_dollars, category, all_categories, stock_count, image_url, created_at, synced_at FROM albums_cache WHERE ($1::timestamptz IS NULL) OR (created_a` |

### First 15 query timings (raw)

```
  539ms  ok=true   SELECT id, name, description, price_dollars, category, all_categories, stock_count, image_url, created_at, synced_at FROM albums_cache WHERE ($1::timestamptz IS NULL) OR (created_a
```

## GET /api/products?limit=500

- **Handler duration**: 111ms
- **DB queries captured**: 1
- **Handler result**: `200`

### Top queries (by total time)

| total ms | count | max ms | ok/err | sql (normalized) |
|---:|---:|---:|---:|---|
| 108 | 1 | 108 | 1/0 | `SELECT id, name, description, price_dollars, category, all_categories, stock_count, image_url, created_at, synced_at FROM albums_cache WHERE ($1::timestamptz IS NULL) OR (created_a` |

### First 15 query timings (raw)

```
  108ms  ok=true   SELECT id, name, description, price_dollars, category, all_categories, stock_count, image_url, created_at, synced_at FROM albums_cache WHERE ($1::timestamptz IS NULL) OR (created_a
```

## GET /api/events

- **Handler duration**: 26ms
- **DB queries captured**: 1
- **Handler result**: `200`

### Top queries (by total time)

| total ms | count | max ms | ok/err | sql (normalized) |
|---:|---:|---:|---:|---|
| 24 | 1 | 24 | 1/0 | `SELECT id, is_event, event_type, event_name, artist, venue, event_date::text AS date_iso, TO_CHAR(event_date, 'MON FMDD') AS date_label, (NULLIF(start_time::text, ''))::time AS sta` |

### First 15 query timings (raw)

```
   24ms  ok=true   SELECT id, is_event, event_type, event_name, artist, venue, event_date::text AS date_iso, TO_CHAR(event_date, 'MON FMDD') AS date_label, (NULLIF(start_time::text, ''))::time AS sta
```

## GET /api/catalog-sync-nightly (cron)

- **Handler duration**: 53931ms
- **DB queries captured**: 71
- **Handler result**: `200`

### Top queries (by total time)

| total ms | count | max ms | ok/err | sql (normalized) |
|---:|---:|---:|---:|---|
| 6166 | 17 | 798 | 17/0 | `WITH payload AS ( SELECT ($1)::jsonb AS j ), items AS ( SELECT i.* FROM payload p CROSS JOIN LATERAL jsonb_array_elements(p.j) AS obj CROSS JOIN LATERAL jsonb_to_record(obj) AS i( ` |
| 1616 | 1 | 1616 | 1/0 | `INSERT INTO albums_cache ( id, square_item_id, square_variation_id, name, description, price_cents, category, all_categories, stock_count, image_url, rating, review_count, sold_cou` |
| 1589 | 17 | 178 | 17/0 | `WITH payload AS ( SELECT NULLIF(($1), '')::jsonb AS j ), image_mapping AS ( SELECT obj->>'id' AS image_id, obj->'image_data'->>'url' AS actual_url FROM payload CROSS JOIN LATERAL j` |
| 462 | 1 | 462 | 1/0 | `UPDATE products p SET category = COALESCE( (SELECT name FROM categories WHERE square_category_id = p.reporting_category LIMIT 1), p.category ), all_categories = COALESCE( (SELECT a` |
| 419 | 17 | 100 | 17/0 | `INSERT INTO catalog_sync_state (key, value, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()` |
| 147 | 1 | 147 | 1/0 | `REINDEX TABLE albums_cache` |
| 129 | 1 | 129 | 1/0 | `WITH payload AS ( SELECT ($1)::jsonb AS j ), cat_rows AS ( SELECT obj->>'id' AS square_category_id, (obj->'category_data'->>'name')::text AS name, (obj->'category_data'->>'parent_i` |
| 113 | 1 | 113 | 1/0 | `TRUNCATE TABLE albums_cache` |
| 96 | 1 | 96 | 1/0 | `ANALYZE albums_cache` |
| 88 | 1 | 88 | 1/0 | `SELECT square_variation_id FROM products WHERE square_variation_id IS NOT NULL ORDER BY synced_at DESC LIMIT 1000;` |
| 45 | 1 | 45 | 1/0 | `WITH payload AS ( SELECT NULLIF(($1), '')::jsonb AS j ), inventory_counts AS ( SELECT (c->>'catalog_object_id')::text AS square_variation_id, GREATEST(COALESCE(NULLIF(c->>'quantity` |
| 32 | 2 | 20 | 2/0 | `SELECT value FROM catalog_sync_state WHERE key = $1 LIMIT 1` |
| 23 | 1 | 23 | 1/0 | `CREATE TABLE IF NOT EXISTS albums_cache ( id TEXT PRIMARY KEY, square_item_id TEXT, square_variation_id TEXT, name TEXT NOT NULL, description TEXT, price_cents BIGINT NOT NULL DEFA` |
| 21 | 1 | 21 | 1/0 | `CREATE INDEX IF NOT EXISTS idx_albums_cache_stock_count ON albums_cache (stock_count) WHERE stock_count > 0` |
| 20 | 1 | 20 | 1/0 | `CREATE INDEX IF NOT EXISTS idx_albums_cache_zero_stock_active ON albums_cache (last_active_at, created_at DESC, id ASC) WHERE stock_count = 0` |
| 19 | 1 | 19 | 1/0 | `CREATE TABLE IF NOT EXISTS catalog_sync_state ( key TEXT PRIMARY KEY, value JSONB, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() )` |
| 19 | 1 | 19 | 1/0 | `CREATE INDEX IF NOT EXISTS idx_albums_cache_synced_at_desc ON albums_cache (synced_at DESC)` |
| 18 | 1 | 18 | 1/0 | `CREATE INDEX IF NOT EXISTS idx_albums_cache_created_desc ON albums_cache (created_at DESC, id ASC)` |
| 18 | 1 | 18 | 1/0 | `CREATE INDEX IF NOT EXISTS idx_albums_cache_square_variation_id_unique ON albums_cache (square_variation_id) WHERE square_variation_id IS NOT NULL` |
| 16 | 1 | 16 | 1/0 | `ALTER TABLE albums_cache ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ GENERATED ALWAYS AS (COALESCE(last_stocked_at, created_at)) STORED` |
| 15 | 1 | 15 | 1/0 | `CREATE INDEX IF NOT EXISTS idx_albums_cache_zero_stock_recent ON albums_cache (last_stocked_at, created_at DESC) WHERE stock_count = 0` |
| 14 | 1 | 14 | 1/0 | `CREATE INDEX IF NOT EXISTS idx_albums_cache_category_created ON albums_cache (category, created_at DESC, id ASC)` |

### First 15 query timings (raw)

```
   19ms  ok=true   CREATE TABLE IF NOT EXISTS catalog_sync_state ( key TEXT PRIMARY KEY, value JSONB, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() )
   20ms  ok=true   SELECT value FROM catalog_sync_state WHERE key = $1 LIMIT 1
   12ms  ok=true   SELECT value FROM catalog_sync_state WHERE key = $1 LIMIT 1
  129ms  ok=true   WITH payload AS ( SELECT ($1)::jsonb AS j ), cat_rows AS ( SELECT obj->>'id' AS square_category_id, (obj->'category_data'->>'name')::text AS name, (obj->'category_data'->>'parent_i
  798ms  ok=true   WITH payload AS ( SELECT ($1)::jsonb AS j ), items AS ( SELECT i.* FROM payload p CROSS JOIN LATERAL jsonb_array_elements(p.j) AS obj CROSS JOIN LATERAL jsonb_to_record(obj) AS i( 
   65ms  ok=true   WITH payload AS ( SELECT NULLIF(($1), '')::jsonb AS j ), image_mapping AS ( SELECT obj->>'id' AS image_id, obj->'image_data'->>'url' AS actual_url FROM payload CROSS JOIN LATERAL j
   16ms  ok=true   INSERT INTO catalog_sync_state (key, value, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  508ms  ok=true   WITH payload AS ( SELECT ($1)::jsonb AS j ), items AS ( SELECT i.* FROM payload p CROSS JOIN LATERAL jsonb_array_elements(p.j) AS obj CROSS JOIN LATERAL jsonb_to_record(obj) AS i( 
  131ms  ok=true   WITH payload AS ( SELECT NULLIF(($1), '')::jsonb AS j ), image_mapping AS ( SELECT obj->>'id' AS image_id, obj->'image_data'->>'url' AS actual_url FROM payload CROSS JOIN LATERAL j
   25ms  ok=true   INSERT INTO catalog_sync_state (key, value, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  256ms  ok=true   WITH payload AS ( SELECT ($1)::jsonb AS j ), items AS ( SELECT i.* FROM payload p CROSS JOIN LATERAL jsonb_array_elements(p.j) AS obj CROSS JOIN LATERAL jsonb_to_record(obj) AS i( 
   67ms  ok=true   WITH payload AS ( SELECT NULLIF(($1), '')::jsonb AS j ), image_mapping AS ( SELECT obj->>'id' AS image_id, obj->'image_data'->>'url' AS actual_url FROM payload CROSS JOIN LATERAL j
   16ms  ok=true   INSERT INTO catalog_sync_state (key, value, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  351ms  ok=true   WITH payload AS ( SELECT ($1)::jsonb AS j ), items AS ( SELECT i.* FROM payload p CROSS JOIN LATERAL jsonb_array_elements(p.j) AS obj CROSS JOIN LATERAL jsonb_to_record(obj) AS i( 
   68ms  ok=true   WITH payload AS ( SELECT NULLIF(($1), '')::jsonb AS j ), image_mapping AS ( SELECT obj->>'id' AS image_id, obj->'image_data'->>'url' AS actual_url FROM payload CROSS JOIN LATERAL j
```

