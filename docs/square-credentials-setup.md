# How to Get Square Location ID and Webhook Signature Key

This guide walks you through finding your Square Location ID and Webhook Signature Key in the Square Developer Dashboard.

## 📍 Getting Your Square Location ID

### Method 1: From Square Developer Dashboard

1. **Log in to Square Developer Dashboard**
   - Go to: https://developer.squareup.com/apps
   - Sign in with your Square account

2. **Navigate to Locations**
   - In the left sidebar, click **"Locations"**
   - Or go directly to: https://developer.squareup.com/apps/{your-app-id}/locations

3. **Find Your Location**
   - You'll see a list of locations associated with your Square account
   - Each location will have:
     - **Location Name** (e.g., "Spiral Groove Records")
     - **Location ID** (a long string like `LXXXXXXXXXXXXX`)

4. **Copy the Location ID**
   - Click on the location you want to use
   - Copy the **Location ID** (it starts with `L` followed by alphanumeric characters)
   - Example: `L1234567890ABCDEF`

### Method 2: Using Square API

If you have multiple locations or want to programmatically get it:

```bash
curl -X GET \
  'https://connect.squareupsandbox.com/v2/locations' \
  -H 'Authorization: Bearer YOUR_SQUARE_ACCESS_TOKEN' \
  -H 'Square-Version: 2023-10-18'
```

This will return a JSON response with all locations and their IDs:

```json
{
  "locations": [
    {
      "id": "L1234567890ABCDEF",
      "name": "Spiral Groove Records",
      "address": {
        "address_line_1": "215B Main St",
        "locality": "Milford",
        "administrative_district_level_1": "OH",
        "postal_code": "45150",
        "country": "US"
      }
    }
  ]
}
```

### Method 3: From Square Dashboard (Business Account)

1. **Log in to Square Dashboard**
   - Go to: https://squareup.com/dashboard
   - Sign in with your business account

2. **Go to Settings**
   - Click on **Settings** in the left sidebar
   - Click on **Locations**

3. **View Location Details**
   - Click on your location
   - The Location ID is shown in the URL or in the location details

## 🔐 Getting Your Webhook Signature Key

The Webhook Signature Key is used to verify that webhook requests are actually coming from Square.

### Step 1: Enable Webhooks

1. **Go to Webhooks Section**
   - In Square Developer Dashboard, go to: https://developer.squareup.com/apps/{your-app-id}/webhooks
   - Or navigate: **Your App** → **Webhooks** in the sidebar

2. **Set Up Webhook Endpoint**
   - Click **"Add Endpoint"** or **"Configure"**
   - Enter your webhook URL (e.g., `https://yourdomain.com/api/square/webhooks`)
   - Select the events you want to listen to
   - **Recommended events:** See [Webhook Subscriptions Guide](./square-webhook-subscriptions.md) for recommendations
   - **Minimum setup:** `order.created`, `order.updated`, `payment.created`, `payment.updated`

### Step 2: Get the Signature Key

1. **After Setting Up Webhook**
   - Once you've configured a webhook endpoint, Square will generate a **Webhook Signature Key**
   - This key is unique to your webhook endpoint

2. **Find the Signature Key**
   - In the webhook configuration page, look for **"Signature Key"** or **"Webhook Signature Key"**
   - It will be a long string (usually 32+ characters)
   - Example: `sq0sig-1234567890abcdefghijklmnopqrstuvwxyz`

3. **Copy the Key**
   - Click **"Show"** or **"Reveal"** to view the full key
   - Copy it to your `.env.local` file

### Alternative: Generate New Signature Key

If you need to regenerate the key:

1. Go to your webhook configuration
2. Click **"Regenerate Signature Key"** or **"Reset Key"**
3. Copy the new key immediately (you won't be able to see it again)

**⚠️ Important:** If you regenerate the key, you must update it in your `.env.local` file and redeploy your application.

## 🔧 Adding to Your Environment Variables

Once you have both values, add them to your `.env.local`:

```env
# Square API Configuration
SQUARE_ACCESS_TOKEN=your_access_token_here
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=your_application_id_here
SQUARE_LOCATION_ID=L1234567890ABCDEF  # ← Add your Location ID here
SQUARE_WEBHOOK_SIGNATURE_KEY=sq0sig-1234567890abcdefghijklmnopqrstuvwxyz  # ← Add your Webhook Signature Key here
```

## 🧪 Testing Your Location ID

You can test if your Location ID is correct:

```bash
curl -X GET \
  "https://connect.squareupsandbox.com/v2/locations/YOUR_LOCATION_ID" \
  -H 'Authorization: Bearer YOUR_SQUARE_ACCESS_TOKEN' \
  -H 'Square-Version: 2023-10-18'
```

If successful, you'll get location details. If you get an error, the Location ID might be incorrect.

## 🧪 Testing Your Webhook Signature Key

The webhook signature key is used to verify incoming webhook requests. You can test it by:

1. **Set up a test webhook endpoint** in your app
2. **Trigger a test event** from Square Dashboard
3. **Verify the signature** in your webhook handler

Example verification code (Node.js):

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(body, signature, signatureKey) {
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

## 📝 Quick Checklist

- [ ] Logged into Square Developer Dashboard
- [ ] Found Location ID from Locations page
- [ ] Configured webhook endpoint
- [ ] Copied Webhook Signature Key
- [ ] Added both to `.env.local`
- [ ] Tested Location ID with API call
- [ ] Verified webhook signature in code

## 🆘 Troubleshooting

### "Location ID not found"
- Make sure you're using the correct environment (sandbox vs production)
- Verify the Location ID starts with `L`
- Check that the location is associated with your Square account

### "Webhook Signature Key not working"
- Ensure you copied the entire key (no spaces or line breaks)
- Verify the key matches the webhook endpoint URL
- Check that you're using the correct key for the correct environment
- Regenerate the key if needed

### "Can't find Webhook Signature Key"
- Make sure you've set up at least one webhook endpoint
- The key is only visible when you first create the webhook
- If you lost it, regenerate it from the webhook settings

## 🔗 Useful Links

- [Square Developer Dashboard](https://developer.squareup.com/apps)
- [Square Locations API Documentation](https://developer.squareup.com/reference/square/locations-api)
- [Square Webhooks Documentation](https://developer.squareup.com/docs/webhooks/overview)
- [Square Webhook Signature Verification](https://developer.squareup.com/docs/webhooks/step3validate)

---

**Note:** For **sandbox** environment, use sandbox credentials. For **production**, use production credentials and make sure your webhook endpoint is publicly accessible via HTTPS.

