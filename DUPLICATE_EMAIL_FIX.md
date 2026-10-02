# Fix: Duplicate Order Status Update Emails

## Problem

Customers were receiving multiple emails for the same order status update (e.g., multiple "Ready for pickup" emails for the same order).

## Root Causes

1. **Weak deduplication logic** in `api/sendEmail.js`:
   - The auto-generated dedupeKey used 30-second time buckets (`dedupeTtlMs / 10`)
   - Emails sent more than 30 seconds apart were not deduplicated
   - In-memory deduplication resets between serverless invocations

2. **`forceEmail: true` bypassing deduplication**:
   - Make.com scenarios were using `forceEmail: true`, which completely bypasses deduplication
   - If Square sends duplicate webhooks, each would trigger a new email

3. **Insufficient logging**:
   - No clear logging to identify when duplicate emails were being sent
   - Difficult to debug the source of duplicates

## Solution

### 1. Improved Deduplication Logic (`api/sendEmail.js`)

**Before:**
```javascript
const key = dedupeKey || `email:${type}:${to}:${Date.now() - (Date.now() % (dedupeTtlMs / 10))}`
```

**After:**
```javascript
// Use explicit dedupeKey if provided, otherwise generate a stable key based on type and recipient
const key = dedupeKey || `email:${type}:${to}`
```

**Changes:**
- Removed time-bucketing that allowed emails >30 seconds apart to slip through
- Now uses a simple, stable key: `email:{type}:{recipient}`
- Added memory cleanup to prevent memory leaks in long-running processes
- Added enhanced logging to track when emails are sent vs. deduplicated

### 2. Enhanced Logging (`api/orders/update.js` & `api/sendEmail.js`)

Added comprehensive logging for:
- When status hasn't changed (skipping email)
- Email deduplication details (type, recipient, dedupeKey)
- When `forceEmail` is used (with warning)
- All email send attempts with full context

### 3. Updated Documentation (`docs/make-order-status-sync.md`)

**Removed `forceEmail: true` from Make.com webhook examples:**

**Before:**
```json
{
  "square_order_id": "...",
  "status": "PREPARED",
  "forceEmail": true
}
```

**After:**
```json
{
  "square_order_id": "...",
  "status": "PREPARED"
}
```

**Added warnings:**
- ⚠️ Do NOT use `"forceEmail": true` in automated Make scenarios
- Only use `forceEmail: true` for manual one-off resends
- Explained that deduplication protects against duplicate webhook triggers

## How It Works Now

### Normal Operation (Automated)

1. Square webhook triggers Make.com scenario
2. Make calls `/api/orders/update` **without** `forceEmail`
3. API checks if status actually changed
4. If changed, attempts to send email with dedupeKey: `order_status_update:{ORDER_NUMBER}:{STATUS}`
5. Deduplication logic checks if this exact email was sent in the last 5 minutes
6. If yes: skips email and logs `reason: 'deduped'`
7. If no: sends email and records in dedupeMap

### Manual Resend (When Needed)

Use the script or curl with `forceEmail: true`:

```bash
node scripts/resend-order-status-email.mjs ORD-XXXXX-XXXX PREPARED --force
```

This bypasses deduplication and sends the email regardless.

## Testing

### Test for Duplicate Prevention

1. Create a test order in Square
2. Mark it as "Ready" in Square Dashboard
3. Wait for webhook → email sent
4. Immediately mark it as "Proposed" then "Ready" again
5. **Expected**: Second "Ready" email is deduplicated and not sent
6. Check logs for: `[Email Webhook] Skipping duplicate email`

### Test for forceEmail

1. Use the resend script with `--force`:
   ```bash
   node scripts/resend-order-status-email.mjs ORD-TEST-123 PREPARED --force
   ```
2. **Expected**: Email sent even if recently sent
3. Check logs for: `[Email Webhook] Force-sending email (deduplication bypassed)`

## Migration Notes

### For Make.com Scenarios

**ACTION REQUIRED**: Remove `"forceEmail": true` from the HTTP module body in your "Order Status Updates" scenario.

**Before:**
```json
{
  "square_order_id": "{{1.data.object.order_fulfillment_updated.order_id}}",
  "status": "{{1.data.object.order_fulfillment_updated.fulfillment_update[1].new_state}}",
  "forceEmail": true
}
```

**After:**
```json
{
  "square_order_id": "{{1.data.object.order_fulfillment_updated.order_id}}",
  "status": "{{1.data.object.order_fulfillment_updated.fulfillment_update[1].new_state}}"
}
```

### Monitoring

Check logs for these patterns:

**Normal deduplication working:**
```
[Email Webhook] Skipping duplicate email: { type: 'order_status_update', to: 'customer@example.com', dedupeKey: 'order_status_update:ORD-ABC:PREPARED' }
```

**Status unchanged (expected):**
```
[Orders Update API] Skipping email: status unchanged (PREPARED -> PREPARED)
```

**Unexpected force-send (investigate):**
```
[Email Webhook] Force-sending email (deduplication bypassed): { type: 'order_status_update', to: '...', dedupeKey: '...' }
```

## Benefits

1. **Prevents duplicate emails** from duplicate webhook triggers
2. **Maintains customer trust** by not spamming them
3. **Better debugging** with comprehensive logs
4. **Proper use of forceEmail** only for manual operations
5. **5-minute deduplication window** provides sufficient protection while allowing legitimate status changes

## Files Changed

- `api/sendEmail.js` - Improved deduplication logic and logging
- `api/orders/update.js` - Enhanced logging for email sends
- `docs/make-order-status-sync.md` - Updated documentation and warnings
- `DUPLICATE_EMAIL_FIX.md` - This document
