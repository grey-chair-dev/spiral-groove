# External & Internal APIs – Curated E-Commerce Template

This document enumerates the third-party integrations and first-party endpoints required to implement the reusable storefront. New sections highlight the initial full-inventory sync workflow and the operational interfaces for webhook retries.

## 1. External APIs (Third-Party Services)

### ECS (or Any ECS)

| API | Purpose | Key Calls |
| --- | --- | --- |
| Catalog API | Full synchronization of items, prices, and metadata. | `listCatalog`, `retrieveCatalogObject` |
| Inventory API | Real-time stock checks / decrements for online orders. | `retrieveInventoryCount`, `batchChangeInventory` |
| Orders API (optional) | Create/manage orders inside the ECS. | `createOrder`, `retrieveOrder` |
| Webhooks | Push notifications for item, inventory, and order events. | `INVENTORY_COUNT_UPDATED`, `ITEM_UPDATED`, etc. |
| Checkout API | Hosted checkout for PCI compliance. | `createPaymentLink` / `CreateCheckout` |

### Discogs (Data Enrichment)

| API | Purpose | Key Calls |
| --- | --- | --- |
| Database Search | Staff lookup by item title or catalog number. | `GET /database/search` |
| Release Data | Pull full metadata (makers, labels, genres, images). | `GET /releases/{release_id}` |

## 2. Internal API Surface

| Endpoint | Method | Purpose | Auth |
| --- | --- | --- | --- |
| `/api/v1/health` | GET | Health check for DB + ECS connectivity. | Public |
| `/api/v1/products` | GET | Product listing with filters/search. | Public |
| `/api/v1/products/:id` | GET | Single product (ECS + enrichment). | Public |
| `/api/v1/customer/register` | POST | Customer signup. | Public |
| `/api/v1/customer/login` | POST | Issue auth token. | Public |
| `/api/v1/wishlist` | GET/POST/DELETE | Manage wishlist items. | Customer |
| `/api/v1/checkout` | POST | Validate cart, create ECS checkout link, product order. | Customer |
| `/api/v1/order/status` | GET | Lookup by order number + email. | Public |
| `/api/v1/orders/history` | GET | Authenticated order history. | Customer |
| `/api/v1/events/inquiry` | POST | Capture Event Space Rental submissions (see §4). | Public |
| `/api/v1/staff/login` | POST | Staff authentication. | Public |
| `/api/v1/staff/product-details/:id` | PUT | Update enrichment attributes. | Staff |
| `/api/v1/staff/discogs-search` | GET | Proxy to Discogs for staff UI. | Staff |
| `/api/v1/staff/genres` | GET/POST | CRUD for lookup tables. | Staff |
| `/api/v1/staff/orders` | GET/PUT | View/update customer orders. | Staff |
| `/api/v1/staff/sync/catalog` | POST | **New:** Trigger full ECS catalog ingest (see §3). | Staff (rate-limited) |
| `/api/v1/staff/webhooks/dlq` | GET | **New:** Inspect webhook DLQ contents. | Staff (2FA recommended) |
| `/api/v1/staff/webhooks/dlq/:taskId/retry` | POST | **New:** Replay a DLQ item back to the queue. | Staff |

## 3. Initial Full Inventory Sync Runbook

**When to run:** During onboarding, after mass updates in the ECS, or if the webhook queue falls behind.

**Workflow:**
1. Authenticated staff member calls `POST /api/v1/staff/sync/catalog`.
2. Endpoint paginates through the Catalog API (`cursor` support) and upserts items into `ECS_Item` + `Item_Detail`.
3. Progress is streamed via logs/metrics; optional job product stored to prevent concurrent runs.
4. After completion, trigger cache revalidation for `/products`, `/inventory`, and any ISR routes.

**Safeguards:**
- Enforce concurrency = 1 (reject if a sync is already running).
- Respect ECS rate limits (tunable delay between pages).
- Provide a dry-run flag for staging environments.
- Abort with alerting if >5% of items fail to sync.

## 4. Event Inquiry Capture

`POST /api/v1/events/inquiry`

- **Payload:** `{ name, email, phone?, eventType, preferredDate, attendeeCount?, message }`
- **Actions:** Persist to `Event_Inquiry`, notify staff via email/Slack, optionally forward to CRM (Make.com/Zapier).
- **Response:** `202 Accepted` with tracking ID to show user confirmation.

## 5. Webhook DLQ Operations

- `GET /api/v1/staff/webhooks/dlq` returns a paginated list of failed tasks (event type, attempts, timestamps, trimmed payload).
- `POST /api/v1/staff/webhooks/dlq/:taskId/retry` requeues the payload for processing. Requires CSRF protection + audit logging (who retried, when, reason).
- Consider an optional `DELETE /api/v1/staff/webhooks/dlq/:taskId` for permanently discarding poison messages once handled offline.

Authentication for these endpoints MUST use staff JWT + an HMAC-signed header (or IP allow list) because DLQ payloads often contain sensitive customer/order data.


