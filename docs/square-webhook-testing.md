# Testing Square Webhooks

This guide covers how to test your Square webhook integration.

## 🧪 Testing Methods

### Method 1: Square Sandbox Test Events (Easiest)

Square provides built-in test event functionality in the Sandbox environment.

#### Step 1: Access Test Events

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Select your application
3. Navigate to **Webhooks** → **Subscriptions**
4. Click on your webhook subscription
5. Look for **"Test Events"** or **"Send Test Event"** button

#### Step 2: Send Test Events

1. Select an event type (e.g., `order.created`, `payment.created`)
2. Click **"Send Test Event"**
3. Square will send a test webhook to your endpoint
4. Check your server logs to verify it was received

#### Step 3: Verify Receipt

Check your webhook handler logs to confirm:
- Event was received
- Signature verification passed
- Event was processed correctly

### Method 2: Local Testing with ngrok

For local development, you need to expose your local server to the internet.

#### Step 1: Install ngrok

```bash
# macOS (using Homebrew)
brew install ngrok

# Or download from https://ngrok.com/download
```

#### Step 2: Start Your Dev Server

```bash
npm run dev
# Server runs on http://localhost:3000
```

#### Step 3: Start ngrok Tunnel

```bash
ngrok http 3000
```

You'll get output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

#### Step 4: Update Webhook URL in Square

1. Go to Square Developer Dashboard → Webhooks
2. Edit your webhook subscription
3. Update **Notification URL** to:
   ```
   https://abc123.ngrok.io/api/square/webhooks
   ```
4. Save the webhook

#### Step 5: Test

1. Send a test event from Square Dashboard
2. Or trigger a real event (create test order, etc.)
3. Watch your terminal/logs for incoming webhooks

**Note:** The ngrok URL changes each time you restart ngrok (unless you have a paid plan). You'll need to update the webhook URL each time.

### Method 3: Vercel Preview Deployment

Deploy to Vercel and use the preview URL for testing.

#### Step 1: Deploy to Vercel

```bash
# Push to GitHub
git push origin development

# Vercel will auto-deploy and give you a preview URL
# Example: https://spiral-groove-records-abc123.vercel.app
```

#### Step 2: Update Webhook URL

1. Go to Square Developer Dashboard → Webhooks
2. Update **Notification URL** to:
   ```
   https://your-preview-url.vercel.app/api/square/webhooks
   ```
3. Save

#### Step 3: Test

Send test events or trigger real events. The webhook will hit your Vercel preview deployment.

### Method 4: Manual API Testing

You can manually trigger events using Square's API.

#### Create a Test Order

```bash
curl -X POST \
  'https://connect.squareupsandbox.com/v2/orders' \
  -H 'Authorization: Bearer YOUR_SQUARE_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'Square-Version: 2023-10-18' \
  -d '{
    "order": {
      "location_id": "YOUR_LOCATION_ID",
      "line_items": [
        {
          "name": "Test Record",
          "quantity": "1",
          "base_price_money": {
            "amount": 2500,
            "currency": "USD"
          }
        }
      ]
    },
    "idempotency_key": "test-order-'$(date +%s)'"
  }'
```

This will trigger `order.created` webhook.

#### Create a Test Payment

```bash
curl -X POST \
  'https://connect.squareupsandbox.com/v2/payments' \
  -H 'Authorization: Bearer YOUR_SQUARE_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'Square-Version: 2023-10-18' \
  -d '{
    "source_id": "cnon:card-nonce-ok",
    "amount_money": {
      "amount": 2500,
      "currency": "USD"
    },
    "idempotency_key": "test-payment-'$(date +%s)'"
  }'
```

This will trigger `payment.created` webhook.

## 🔍 Verifying Webhook Receipt

### Check Server Logs

Your webhook handler should log incoming events:

```typescript
// In your webhook handler
console.log('Webhook received:', {
  type: event.type,
  timestamp: new Date().toISOString(),
  signature: request.headers.get('x-square-signature')
});
```

### Check Response Status

Square expects a `200 OK` response. If you return an error, Square will retry.

### Verify Signature

Always verify the webhook signature to ensure it's from Square:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  body: string,
  signature: string,
  signatureKey: string
): boolean {
  const hash = crypto
    .createHmac('sha256', signatureKey)
    .update(body)
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hash)
  );
}
```

## 🐛 Troubleshooting

### Webhook Not Received

**Check:**
1. ✅ Webhook URL is correct and accessible
2. ✅ Server is running and endpoint exists
3. ✅ Firewall/security groups allow incoming requests
4. ✅ HTTPS is used (required for production)
5. ✅ Webhook subscription is active in Square Dashboard

### Signature Verification Failing

**Check:**
1. ✅ `SQUARE_WEBHOOK_SIGNATURE_KEY` is correct
2. ✅ Using the raw request body (not parsed JSON)
3. ✅ Signature header is `x-square-signature`
4. ✅ Signature key matches the webhook endpoint

### Events Not Triggering

**Check:**
1. ✅ Events are selected in webhook subscription
2. ✅ Using correct environment (sandbox vs production)
3. ✅ Test events are being sent from Square Dashboard
4. ✅ Webhook subscription is enabled

### Local Testing Issues

**If ngrok isn't working:**
- Try alternative: [localtunnel](https://localtunnel.github.io/www/)
- Or use Vercel preview deployments
- Or test directly in production (with caution)

## 📝 Testing Checklist

- [ ] Webhook endpoint is accessible (returns 200 OK)
- [ ] Signature verification is working
- [ ] Test events are received from Square
- [ ] Events are logged correctly
- [ ] Event data is parsed correctly
- [ ] Database updates work (if applicable)
- [ ] Error handling works (test with invalid signature)
- [ ] Idempotency is handled (test duplicate events)

## 🧪 Quick Test Script

Create a simple test to verify your webhook:

```bash
# Test webhook endpoint is accessible
curl -X POST http://localhost:3000/api/square/webhooks \
  -H "Content-Type: application/json" \
  -H "x-square-signature: test-signature" \
  -d '{"type": "test.event", "data": {}}'
```

## 📊 Monitoring Webhooks

### Square Dashboard

1. Go to **Webhooks** → **Subscriptions**
2. Click on your subscription
3. View **"Event Log"** or **"Delivery History"**
4. See which events were sent and their status

### Your Application Logs

Monitor your application logs for:
- Incoming webhook requests
- Signature verification results
- Event processing status
- Any errors

## 🔗 Resources

- [Square Webhooks Documentation](https://developer.squareup.com/docs/webhooks/overview)
- [Square Test Events](https://developer.squareup.com/docs/webhooks/step4receive)
- [Webhook Signature Verification](https://developer.squareup.com/docs/webhooks/step3validate)
- [ngrok Documentation](https://ngrok.com/docs)

---

## 💡 Quick Start Testing

**Fastest way to test:**

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Set up ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Update webhook URL in Square:**
   - Use the ngrok HTTPS URL
   - Example: `https://abc123.ngrok.io/api/square/webhooks`

4. **Send test event from Square Dashboard:**
   - Go to Webhooks → Test Events
   - Select an event type
   - Click "Send Test Event"

5. **Check your logs:**
   - You should see the webhook received in your terminal
   - Verify signature validation passes
   - Confirm event is processed

That's it! Your webhook is working. 🎉

