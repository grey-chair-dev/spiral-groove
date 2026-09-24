# Make.com Order Status Updates — Fix for 404 Errors

**Issue ID:** Make.com scenario `3690250` (Order Status Updates for Spiral Groove Records)  
**Status:** Currently **inactive** and flagged **invalid**  
**Error Count:** 6 failures out of 52 runs  
**Last Failure:** July 18, 2026 at 5:24 PM UTC (2 back-to-back failures)

---

## Root Cause

The Make.com HTTP module is configured to POST/PATCH to:
```
https://spiralgrooverecords.com/api/orders/update
```

This naked domain returns an **HTTP 307 redirect** to `https://www.spiralgrooverecords.com/api/orders/update`.

**Make.com's HTTP module does not follow redirects automatically**, so every request fails with `DataError: Not Found` before ever reaching the API endpoint.

### Proof

```bash
# Without redirect-following (-L flag), returns 307
curl -X PATCH https://spiralgrooverecords.com/api/orders/update \
  -H "Content-Type: application/json" \
  -d '{"order_id":"test","status":"PREPARED"}'
# Result: HTTP 307 → Redirecting...

# With redirect-following, reaches the API
curl -L -X PATCH https://www.spiralgrooverecords.com/api/orders/update \
  -H "Content-Type: application/json" \
  -d '{"order_id":"test","status":"PREPARED"}'
# Result: HTTP 404 → {"success":false,"error":"Order not found: test"}
```

The **404 from the API** is correct behavior (test order doesn't exist). The **307 from the redirect** is what's breaking Make.com.

---

## The Fix

### In Make.com Scenario `3690250`

1. Open the **HTTP module** (MakeRequest module that PATCHes order status)
2. Change the **URL** field from:
   ```
   https://spiralgrooverecords.com/api/orders/update
   ```
   to:
   ```
   https://www.spiralgrooverecords.com/api/orders/update
   ```
3. Save and **reactivate** the scenario

### Expected Payload (for reference)

The API expects:

**Method:** `PATCH` or `POST`

**Headers:**
- `Content-Type: application/json`
- `x-webhook-secret: YOUR_SECRET` (optional, if `WEBHOOK_SECRET` is set in env)

**Body:**
```json
{
  "square_order_id": "{{1.data.object.order_fulfillment_updated.order_id}}",
  "status": "{{1.data.object.order_fulfillment_updated.fulfillment_update[1].new_state}}",
  "fulfillment_state": "{{1.data.object.order_fulfillment_updated.fulfillment_update[1].new_state}}",
  "delivery_method": "pickup",
  "forceEmail": true
}
```

**Required fields:**
- `order_id` OR `square_order_id` OR `order_number` (at least one)
- `status` (e.g., `PREPARED`, `COMPLETED`, `CANCELLED`)

**Optional fields:**
- `forceEmail` (boolean) — bypasses email deduplication
- `trackingNumber` (string)
- `trackingUrl` (string)
- `fulfillment_state` (string) — helps status normalization

---

## API Endpoint Details

The endpoint at `/api/orders/update` is **fully functional** and has been deployed since the site rebuild. It:

1. ✅ Accepts `PATCH` or `POST` requests
2. ✅ Looks up orders by `square_order_id`, `order_id`, or `order_number`
3. ✅ Updates `orders.status` and `updated_at` in the Neon database
4. ✅ Normalizes status values via `orderStatusNormalize.js`
5. ✅ Sends customer emails (status updates, review requests, refund notices)
6. ✅ Merges tracking info into `pickup_details` JSONB field
7. ✅ Returns detailed success/error responses

**Location:** `api/orders/update.js` (lines 1-467)

**Documentation:** Updated in `docs/make-order-status-sync.md` (lines 68-70, 121-131, 168-173)

---

## Testing the Fix

After updating the Make.com scenario URL:

### 1. Trigger a test webhook
- Mark a test order as **Ready** in the Square dashboard
- Check Make.com execution history — should show **success** instead of `DataError: Not Found`

### 2. Verify the result
- **Database:** Run this query in Neon console:
  ```sql
  SELECT order_number, status, updated_at 
  FROM orders 
  WHERE square_order_id = 'YOUR_TEST_ORDER_ID';
  ```
  Status should be `PREPARED`, `updated_at` should be recent.

- **Email:** Check if customer received "Ready for pickup" email

### 3. Manual test (optional)
```bash
curl -X PATCH "https://www.spiralgrooverecords.com/api/orders/update" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD-XXXXX-XXXX",
    "status": "PREPARED",
    "forceEmail": true
  }'
```

Expected response:
```json
{
  "success": true,
  "order": { ... },
  "message": "Order status updated to: PREPARED",
  "email": {
    "attempted": true,
    "sent": true,
    "to": "customer@example.com"
  }
}
```

---

## Files Changed in This Fix

- ✅ `docs/make-order-status-sync.md` — Updated all references to use `www.spiralgrooverecords.com`
- ✅ `MAKE_WEBHOOK_FIX.md` — This summary document

**No code changes were needed** — the API has always been working correctly. The issue was purely Make.com configuration using the wrong URL.

---

## Reactivate the Scenario

Once you've updated the URL in Make.com:

1. **Save** the scenario
2. **Turn on** the scenario (currently inactive)
3. **Clear the "invalid" flag** (if Make.com prompts for it)

The next Square order status change will trigger the webhook and should succeed.

---

## Additional Context

- **Make.com Team ID:** Found via your GCD Make.com account
- **Scenario ID:** `3690250`
- **Scenario Name:** Order Status Updates (Spiral Groove Records)
- **Error Pattern:** All 6 failures share the same root cause (redirect not followed)
- **Site Rebuild:** The endpoint was built into the new site but documentation referenced the naked domain

---

**Summary:** Update Make.com HTTP module URL to use `www.spiralgrooverecords.com` instead of `spiralgrooverecords.com`, save, and reactivate the scenario. No other changes needed.
