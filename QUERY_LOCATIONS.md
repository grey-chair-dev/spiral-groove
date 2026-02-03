# Database Query Locations

## Main Query Files

### 1. **Square Sync** (`api/squareSync.js`)
**Purpose:** Syncs products from Square to `products_cache` table

**Key Query - Setting `created_at`:**
```javascript
// Line 274-290: Square API provides both createdAt and updatedAt
const squareCreatedAt = it.createdAt || it.created_at || null
const squareUpdatedAt = it.updatedAt || it.updated_at || null

rows.push({
  // ...
  created_at: squareCreatedAt || squareUpdatedAt, // Use Square's createdAt if available, else updatedAt
  updated_at: squareUpdatedAt,
})

// Line 338: Preserves existing created_at on updates
created_at = COALESCE(products_cache.created_at, EXCLUDED.created_at)
```

**Note:** Square's Catalog API provides `created_at` (or `createdAt`). We use it directly, with `updated_at` as a fallback.

---

### 2. **Products API** (`api/products.js`)
**Purpose:** Fetches products from database for frontend

**Key Query - Filtering by `created_at`:**
```sql
-- Line 137-169: Query from albums_cache
SELECT 
  id, name, description, price_dollars, category, all_categories,
  stock_count, image_url, rating, review_count, sold_count,
  last_sold_at, last_stocked_at, last_adjustment_at,
  created_at  -- Used for "New Arrivals" filtering
FROM albums_cache
WHERE 
  stock_count > 0
  OR (
    stock_count = 0 
    AND (
      (last_stocked_at IS NOT NULL AND last_stocked_at >= $1::timestamptz)
      OR
      (last_stocked_at IS NULL AND created_at >= $1::timestamptz)
    )
  )
ORDER BY created_at DESC, id ASC
```

**Frontend Filtering:**
- `src/components/CatalogPage.tsx` (Line 33-44): Filters products by `createdAt` for "New Arrivals" (last 2 weeks)

---

### 3. **Albums Cache** (`api/albumsCache.js`)
**Purpose:** Pre-filters albums for faster queries

**Key Query:**
```sql
-- Line 54-72: Populates albums_cache from products_cache
INSERT INTO albums_cache (...)
SELECT ... FROM products_cache
WHERE 
  -- Album filtering logic
  AND (
    stock_count > 0
    OR (
      stock_count = 0 
      AND (
        (last_stocked_at IS NOT NULL AND last_stocked_at >= $3::timestamptz)
        OR
        (last_stocked_at IS NULL AND created_at >= $3::timestamptz)
      )
    )
  )
ORDER BY created_at DESC, id ASC
```

---

## Square API Response

**Square Catalog API Response:**
```json
{
  "id": "...",
  "type": "ITEM",
  "created_at": "2026-01-15T10:00:00Z",  // ✅ Available - actual creation date
  "updated_at": "2026-02-01T12:00:00Z"   // ✅ Available - last update date
}
```

**What We're Doing:**
1. Use `created_at` from Square directly (checks both `createdAt` and `created_at` for compatibility)
2. Fallback to `updated_at` if `created_at` is not available
3. Preserve existing `created_at` on subsequent syncs (don't overwrite once set)

**Why This Matters:**
- We now get the actual creation date from Square
- Existing products keep their original `created_at` (preserved on updates)
- New products get the accurate creation date from Square

---

## Where `created_at` is Used

1. **Sync:** `api/squareSync.js` - Sets `created_at` from Square's `updated_at`
2. **Query:** `api/products.js` - Orders by `created_at DESC` and filters by date
3. **Frontend:** `src/components/CatalogPage.tsx` - Filters "New Arrivals" by `createdAt`
4. **Cache:** `api/albumsCache.js` - Copies `created_at` to `albums_cache` table

---

## Potential Solutions

Since Square doesn't provide `created_at`, options are:

1. **Keep current approach:** Use `updated_at` as proxy, preserve on updates
2. **Track first sync date:** Add a `first_synced_at` column to track when we first saw the product
3. **Use inventory history:** Check `inventory` table for earliest stock date (if available)
