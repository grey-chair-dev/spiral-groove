# How to Fix the Make.com Order Status Scenario

**Scenario:** Order Status Updates (Spiral Groove Records)  
**Scenario ID:** 3690250  
**Current Status:** Inactive (flagged invalid due to errors)  
**Issue:** 404 errors when trying to update order status via webhook

---

## Quick Fix Steps

### 1. Open the Scenario in Make.com

1. Log into Make.com with your GCD account
2. Navigate to **Scenarios**
3. Find and open **"Order Status Updates"** (Spiral Groove Records, ID `3690250`)

### 2. Locate the HTTP Module

The scenario has a **router** with two branches:
- **Branch A:** Logs usage to internal Make webhook (working fine)
- **Branch B:** PATCHes order status to Spiral Groove's site ← **this is the failing module**

Look for the module labeled something like:
- "Update Order Status" or "MakeRequest" or "HTTP" 
- It should be making a PATCH request to an API endpoint

### 3. Update the URL

In the HTTP module settings:

**Current URL (wrong):**
```
https://spiralgrooverecords.com/api/orders/update
```

**New URL (correct):**
```
https://www.spiralgrooverecords.com/api/orders/update
```

**Change:** Add `www.` before `spiralgrooverecords.com`

### 4. Verify the Body Payload (should already be correct)

The body should look something like this:

```json
{
  "square_order_id": "{{1.data.object.order_fulfillment_updated.order_id}}",
  "status": "{{1.data.object.order_fulfillment_updated.fulfillment_update[1].new_state}}",
  "fulfillment_state": "{{1.data.object.order_fulfillment_updated.fulfillment_update[1].new_state}}",
  "delivery_method": "pickup",
  "forceEmail": true
}
```

If it looks different but has the key fields (`square_order_id` or `order_id`, and `status`), that's fine — just make sure the URL is updated.

### 5. Optional: Check if Webhook Secret is Set

If the HTTP module includes a header `x-webhook-secret`, make sure it matches the `WEBHOOK_SECRET` environment variable in Vercel. If you're not sure what this is, you can:
- Check Vercel dashboard → Project Settings → Environment Variables
- OR remove the header entirely (it's optional for internal webhooks)

### 6. Save and Reactivate

1. Click **Save** in the HTTP module
2. Click **OK** or **Save** on the scenario editor
3. **Turn ON** the scenario (toggle the switch in the top-right)
4. If Make.com shows an "invalid" warning, click to **clear the flag** or **revalidate**

---

## Test the Fix

### Option 1: Trigger from Square (recommended)

1. Open **Square Dashboard** → **Orders**
2. Find a test order (or create one)
3. Mark it as **Ready** (if it's a pickup order)
4. Go back to **Make.com** → **History** tab for this scenario
5. You should see a new execution with **success** status (green checkmark)
6. Check the Spiral Groove database or order status page to confirm the status updated

### Option 2: Manual Test with Curl

```bash
curl -X PATCH "https://www.spiralgrooverecords.com/api/orders/update" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "YOUR_ACTUAL_ORDER_NUMBER",
    "status": "PREPARED",
    "forceEmail": true
  }'
```

Replace `YOUR_ACTUAL_ORDER_NUMBER` with a real order number from the database (e.g., `ORD-1234-ABCD`).

**Expected response:**
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

## Why This Fixes the Issue

The problem wasn't with the API endpoint itself — it's been working correctly all along. The issue was:

1. **Make.com was configured to hit:** `https://spiralgrooverecords.com/api/orders/update`
2. **That URL returns an HTTP 307 redirect** to `https://www.spiralgrooverecords.com/api/orders/update`
3. **Make.com's HTTP module doesn't follow redirects automatically**, so it stopped at the redirect and reported "404 Not Found"

By using the `www` subdomain directly, we skip the redirect and hit the API endpoint immediately.

---

## What the API Does

For reference, when this webhook fires successfully, it:

1. ✅ Looks up the order in the Neon database by `square_order_id`
2. ✅ Updates the `status` field (e.g., `PREPARED`, `COMPLETED`, `CANCELLED`)
3. ✅ Updates the `updated_at` timestamp
4. ✅ Normalizes status values (Square "Ready" → "PREPARED")
5. ✅ Sends customer email notifications (status update, review request, or refund notice)
6. ✅ Optionally merges tracking info into the order record

**The endpoint is fully functional** — this was purely a configuration issue.

---

## Troubleshooting

### If you still get errors after updating the URL:

1. **"Order not found" error:**
   - The order might not exist in the database yet
   - Check that order creation webhooks are working properly
   - Verify the `square_order_id` being sent matches what's in the database

2. **"Unauthorized" error:**
   - The `x-webhook-secret` header doesn't match the Vercel environment variable
   - Either update the header value or remove it entirely

3. **Timeout errors:**
   - Increase the timeout setting in the HTTP module to 60+ seconds
   - Check Vercel function logs for any database connection issues

4. **Still getting 404:**
   - Double-check you saved the URL change with `www.`
   - Make sure there are no extra spaces or characters in the URL
   - Verify the scenario is actually ON (active)

---

## Additional Resources

- **Full diagnosis:** See `MAKE_WEBHOOK_FIX.md` in the repo
- **API documentation:** See `docs/make-order-status-sync.md`
- **API endpoint code:** `api/orders/update.js` (lines 1-467)
- **Pull Request:** https://github.com/grey-chair-dev/spiral-groove/pull/5

---

**Summary:** Change the HTTP module URL to `https://www.spiralgrooverecords.com/api/orders/update`, save, and turn the scenario back on. That's it!
