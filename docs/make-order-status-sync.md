# Make.com → Order status sync

Square **`order.fulfillment.updated`** webhooks update Neon and send customer email. You can do both in Make:

1. **PostgreSQL** — write `orders.status` + `updated_at` in Neon (fast, visible in Make).
2. **HTTP PATCH** `/api/orders/update` — send ready/complete emails (and re-apply the same status with normalization).

The API normalizes status in `api/orderStatusNormalize.js`. If you only use Postgres, you must map status correctly in Make and **always set `updated_at`**.

## Square activity → Neon status

| Square Dashboard activity | Square fulfillment `state` | Send to API as `status` | Customer email |
|---------------------------|------------------------------|-------------------------|----------------|
| Order created / payment   | `PROPOSED` / `RESERVED`      | `PROPOSED` or `RESERVED` | (none — confirmation already sent at checkout) |
| **1 item marked as Ready** | **`PREPARED`**              | **`PREPARED`**          | **Ready for pickup** |
| Picked up / fulfillment complete | `COMPLETED`           | `COMPLETED`             | Order complete + review request |

## Do not use `order.state` alone for pickup orders

Square has two layers:

- **Order state** — can be `OPEN` or `COMPLETED` while fulfillment is still in progress.
- **Pickup fulfillment state** — `PROPOSED` → `RESERVED` → **`PREPARED`** (Ready) → **`COMPLETED`** (picked up).

**Wrong (caused Keith Stam / ORD-MO8T3WGA-Z6IY bug):** Map “marked as Ready” → `COMPLETED`.  
The website then shows **Picked up** and skips the ready email.

**Correct:** Map “marked as Ready” → `PREPARED`.

## “Order Status Updates” scenario — keep Postgres + fix these fields

Your flow (webhook → **Postgres** → HTTP) is fine. The bug was **incomplete Postgres mapping**, not “Postgres vs API.”

### 1. Filter the webhook (first module or before Postgres)

Only run when:

- **`{{1.type}}`** = `order.fulfillment.updated`

Do **not** run on `order.updated` (that uses top-level `order.state`, which is not “Ready for pickup”).

### 2. PostgreSQL module (“Update Status”) — required fields

| Column | Value in Make |
|--------|----------------|
| **Filter** `square_order_id` | `equal` → `{{1.data.object.order_fulfillment_updated.order_id}}` |
| **`status`** | `{{1.data.object.order_fulfillment_updated.fulfillment_update[1].new_state}}` |
| **`updated_at`** | `{{now}}` ← **was empty; this caused the Keith / stuck-timestamp issue** |

Use bundle index **`[1]`** (first fulfillment update) in the UI, not `[]`.

Leave other columns **empty** so you don’t overwrite `pickup_details`, `order_number`, etc.

**Status values from Square (write as-is):**

| Square `new_state` | Neon `status` |
|--------------------|---------------|
| `PROPOSED` | `PROPOSED` |
| `RESERVED` | `RESERVED` |
| `PREPARED` | `PREPARED` (Ready for pickup) |
| `COMPLETED` | `COMPLETED` (picked up) |
| `CANCELED` | `CANCELED` |

Only use fulfillment `new_state`, never `order_updated.state`.

### 3. HTTP module (emails) — after Postgres

Keep **PATCH** `https://spiralgrooverecords.com/api/orders/update` **after** the Postgres step.

Body (same status as Postgres):

```json
{
  "square_order_id": "{{1.data.object.order_fulfillment_updated.order_id}}",
  "status": "{{1.data.object.order_fulfillment_updated.fulfillment_update[1].new_state}}",
  "fulfillment_state": "{{1.data.object.order_fulfillment_updated.fulfillment_update[1].new_state}}",
  "delivery_method": "pickup",
  "forceEmail": true
}
```

**Filter on HTTP route:** run when `new_state` is **`PREPARED`** or **`COMPLETED`** (send emails). You can skip **`RESERVED`** if you don’t want mail for that step.

Postgres can still update `RESERVED`; HTTP only needs to fire for customer-facing changes.

With `forceEmail: true`, the API sends even if Postgres already wrote the same status.

### 4. Optional: Postgres-only (no HTTP)

If you drop the HTTP module, customers **won’t** get ready/complete emails unless another scenario sends them. Not recommended.

### 5. Test

Mark a test order **Ready** in Square → in Neon: `status = PREPARED`, `updated_at` ≈ now → customer gets **Ready for pickup** email.

---

## Recommended Make.com HTTP module body

```json
{
  "order_id": "{{square_order_id}}",
  "order_number": "{{optional_ord_number}}",
  "status": "{{fulfillment_state_or_mapped_status}}",
  "fulfillment_state": "{{pickup_fulfillment.state}}",
  "event_type": "{{activity_label_lowercase}}",
  "delivery_method": "pickup"
}
```

Use the **pickup fulfillment** `state` field from Square, not the top-level order `state`, when the order is in-store pickup.

## API normalization (deployed in code)

Even if Make sends `COMPLETED` for a pickup order without `fulfillment_state: COMPLETED`, the API downgrades to **`PREPARED`** (`pickup_completed_guard`). Explicit fields improve logging and avoid surprises:

- `fulfillment_state`: `PREPARED` | `COMPLETED`
- `event_type`: e.g. `marked_as_ready`, `picked_up`

## Manual fix + resend email

```bash
curl -X PATCH "https://YOUR_DEPLOYMENT/api/orders/update" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_WEBHOOK_SECRET" \
  -d '{
    "order_id": "ORD-XXXXX-XXXX",
    "status": "PREPARED",
    "forceEmail": true
  }'
```

`forceEmail: true` bypasses deduplication and sends even if status was already correct.

## Environment

- `MAKE_EMAIL_WEBHOOK_URL` — customer status emails
- `WEBHOOK_SECRET` (optional) — `x-webhook-secret` header on `/api/orders/update`

## Verify

1. **Neon:** `orders.status` = `PREPARED` for ready, `COMPLETED` only after pickup.
2. **Site:** `/order-status` shows **Ready**, not **Picked up**, when `PREPARED`.
3. **Make email history:** subject `Ready for pickup: ORD-...`.

## Square token note

`SQUARE_ACCESS_TOKEN` must include **Orders read** scope for `/api/orders/reconcile` to pull live fulfillment state. If Square returns `401 UNAUTHORIZED`, the reconcile endpoint falls back to DB heuristics (pickup + `COMPLETED` + never updated → `PREPARED`).

## Bulk reconcile (fix existing DB rows)

Compare every Neon order to Square fulfillment state:

```bash
# Dry run (report mismatches only)
node scripts/reconcile-order-statuses.mjs

# Apply fixes locally (needs .env.local: SGR_DATABASE_URL; Square token optional)
node scripts/reconcile-order-statuses.mjs --apply

# Heuristic-only (when Square Orders API returns 401)
node scripts/reconcile-order-statuses.mjs --heuristic --apply

# Against a deployed site
node scripts/reconcile-order-statuses.mjs --http --url https://YOUR_DEPLOYMENT --apply
```

Or call the API directly:

```bash
curl -X POST "https://YOUR_DEPLOYMENT/api/orders/reconcile?apply=1" \
  -H "x-webhook-secret: $WEBHOOK_SECRET"
```
