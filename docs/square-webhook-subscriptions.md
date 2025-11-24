# Square Webhook Subscriptions Guide

This guide recommends which Square webhook events to subscribe to for Spiral Groove Records.

## 🎯 Recommended Webhook Events

### Essential Events (Start with these)

#### 1. **Order Events**
- ✅ `order.created` - When a new order is placed
- ✅ `order.updated` - When order status changes (processing → shipped → delivered)
- ✅ `order.fulfillment.updated` - When fulfillment status changes

**Why:** Track order lifecycle, update customer order status, sync with your database

#### 2. **Payment Events**
- ✅ `payment.created` - When a payment is processed
- ✅ `payment.updated` - When payment status changes (pending → completed → refunded)

**Why:** Confirm payments, handle refunds, update order payment status

### Recommended Events (Add as needed)

#### 3. **Inventory Events** (if syncing inventory)
- ⚠️ `inventory.count.updated` - When inventory quantities change
- ⚠️ `inventory.physical.count.updated` - When physical inventory counts are updated

**Why:** Keep your website inventory in sync with Square POS

**Note:** These can be high-frequency events. Only enable if you need real-time inventory sync.

#### 4. **Catalog Events** (if syncing products)
- ⚠️ `catalog.version.updated` - When catalog changes (new products, price updates, etc.)

**Why:** Sync product catalog changes from Square to your website

**Note:** This fires for ANY catalog change. You may want to poll the catalog API instead.

#### 5. **Customer Events** (if managing customer accounts)
- ⚠️ `customer.created` - When a new customer is created
- ⚠️ `customer.updated` - When customer information is updated

**Why:** Sync customer data between Square and your database

### Optional Events

#### 6. **Refund Events**
- `refund.created` - When a refund is issued
- `refund.updated` - When refund status changes

**Why:** Track refunds, update order status, notify customers

#### 7. **Dispute Events** (if handling disputes)
- `dispute.created` - When a payment dispute is created
- `dispute.updated` - When dispute status changes

**Why:** Handle chargebacks and disputes

#### 8. **Checkout Events** (if using Square Checkout API)
- ⚠️ `checkout.updated` - When a checkout session is updated
- ⚠️ `checkout.completed` - When a checkout is completed

**Why:** Track online checkout sessions, handle abandoned carts, confirm completed checkouts

**Note:** Only needed if you're using Square's Checkout API for online orders. If you're using Orders API directly, you don't need these.

#### 9. **Loyalty Events** (if you have a loyalty program)
- ⚠️ `loyalty.account.created` - When a customer enrolls in loyalty program
- ⚠️ `loyalty.account.updated` - When loyalty account info changes
- ⚠️ `loyalty.account.deleted` - When a loyalty account is deleted
- ⚠️ `loyalty.event.created` - When points are earned/redeemed

**Why:** Track loyalty program activity, sync points/balances, manage customer rewards

**Note:** Only needed if you're using Square's Loyalty program feature.

## 📋 Recommended Subscription List

### For a Record Store (E-commerce Focus)

**Minimum Setup:**
```
✅ order.created
✅ order.updated
✅ payment.created
✅ payment.updated
```

**Full Setup (with inventory sync):**
```
✅ order.created
✅ order.updated
✅ order.fulfillment.updated
✅ payment.created
✅ payment.updated
✅ refund.created
✅ refund.updated
⚠️ inventory.count.updated (only if real-time sync needed)
```

**Advanced Setup (with catalog sync):**
```
✅ order.created
✅ order.updated
✅ order.fulfillment.updated
✅ payment.created
✅ payment.updated
✅ refund.created
✅ refund.updated
✅ customer.created
✅ customer.updated
⚠️ inventory.count.updated
⚠️ catalog.version.updated (consider polling instead)
```

**Full Setup (with Checkout & Loyalty):**
```
✅ order.created
✅ order.updated
✅ order.fulfillment.updated
✅ payment.created
✅ payment.updated
✅ refund.created
✅ refund.updated
✅ customer.created
✅ customer.updated
✅ customer.deleted
⚠️ inventory.count.updated
⚠️ catalog.version.updated
⚠️ checkout.updated (if using Square Checkout API)
⚠️ checkout.completed (if using Square Checkout API)
⚠️ loyalty.account.created (if using Square Loyalty)
⚠️ loyalty.account.updated (if using Square Loyalty)
⚠️ loyalty.account.deleted (if using Square Loyalty)
⚠️ loyalty.event.created (if using Square Loyalty)
```

## 🚀 Setting Up Subscriptions in Square

### Step 1: Go to Webhooks Section

1. Log in to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Select your application
3. Navigate to **Webhooks** in the sidebar

### Step 2: Add Webhook Endpoint

1. Click **"Add Endpoint"** or **"Configure"**
2. Enter your webhook URL:
   ```
   https://yourdomain.com/api/square/webhooks
   ```
3. Select the events you want (see recommendations above)
4. Click **"Save"**

### Step 3: Copy Signature Key

1. After saving, Square will generate a **Webhook Signature Key**
2. Copy it immediately (you won't be able to see it again)
3. Add it to your `.env.local`:
   ```env
   SQUARE_WEBHOOK_SIGNATURE_KEY=your_signature_key_here
   ```

## 💡 Event Handling Recommendations

### Order Events

**`order.created`:**
- Create order record in your database
- Send order confirmation email
- Update inventory (if applicable)
- Notify staff of new order

**`order.updated`:**
- Update order status in database
- Send status update email to customer
- Update tracking information if shipped

**`order.fulfillment.updated`:**
- Update fulfillment status
- Send shipping notification
- Update tracking number

### Payment Events

**`payment.created`:**
- Confirm payment received
- Update order payment status
- Trigger order fulfillment process

**`payment.updated`:**
- Handle refunds
- Update payment status
- Notify customer of payment changes

### Inventory Events

**`inventory.count.updated`:**
- Sync inventory quantities
- Update product availability on website
- Trigger low stock alerts

**⚠️ Warning:** Inventory events can fire frequently. Consider:
- Debouncing/throttling updates
- Batching updates
- Using polling instead for less critical inventory

### Checkout Events

**`checkout.updated`:**
- Track checkout session progress
- Handle abandoned cart recovery
- Update checkout status in real-time

**`checkout.completed`:**
- Confirm successful checkout completion
- Trigger order processing
- Send confirmation emails

**Note:** These are only needed if using Square's Checkout API. If you're using Orders API directly, `order.created` covers this.

### Loyalty Events

**`loyalty.account.created`:**
- Track new loyalty program enrollments
- Welcome new loyalty members
- Sync customer loyalty status

**`loyalty.account.updated`:**
- Update loyalty account information
- Sync account changes to your database

**`loyalty.account.deleted`:**
- Handle loyalty account deletions
- Clean up loyalty data

**`loyalty.event.created`:**
- Track points earned/redeemed
- Update customer point balances
- Trigger rewards notifications
- Sync loyalty activity to your database

**Note:** Only subscribe to these if you're actively using Square's Loyalty program feature.

## 🧪 Testing Webhooks

### Using Square Sandbox

1. **Enable Test Mode:**
   - Use sandbox credentials
   - Set `SQUARE_ENVIRONMENT=sandbox` in `.env.local`

2. **Test Events:**
   - Square Sandbox allows you to trigger test events
   - Go to Webhooks → Test Events
   - Select an event type and trigger it

3. **Monitor Logs:**
   - Check your webhook endpoint logs
   - Verify events are received and processed correctly

### Local Development

For local testing, use a tunnel service:

1. **Using ngrok:**
   ```bash
   ngrok http 3000
   # Use the ngrok URL: https://your-ngrok-url.ngrok.io/api/square/webhooks
   ```

2. **Using Vercel Preview:**
   - Deploy to Vercel
   - Use preview deployment URL for webhook
   - Test with real events

## 📊 Event Frequency Considerations

| Event Type | Frequency | Impact |
|------------|----------|--------|
| `order.created` | Low-Medium | High - Critical for order processing |
| `order.updated` | Medium | High - Important for status tracking |
| `payment.created` | Low-Medium | High - Critical for payment confirmation |
| `payment.updated` | Low | Medium - Important for refunds |
| `inventory.count.updated` | High | Medium - Can be resource-intensive |
| `catalog.version.updated` | Low | Low - Consider polling instead |
| `checkout.updated` | Medium | Medium - Useful for cart tracking |
| `checkout.completed` | Low-Medium | High - Critical if using Checkout API |
| `loyalty.event.created` | Medium-High | Medium - Can be frequent if active program |
| `loyalty.account.*` | Low | Low-Medium - Only if using loyalty program |

## 🔒 Security Best Practices

1. **Always verify webhook signatures** - Use `SQUARE_WEBHOOK_SIGNATURE_KEY`
2. **Use HTTPS** - Webhooks must be served over HTTPS
3. **Idempotency** - Handle duplicate events gracefully
4. **Rate limiting** - Implement rate limiting on webhook endpoint
5. **Logging** - Log all webhook events for debugging

## 📝 Quick Checklist

- [ ] Decide which events you need (start with minimum setup)
- [ ] Set up webhook endpoint in Square Dashboard
- [ ] Add webhook URL: `https://yourdomain.com/api/square/webhooks`
- [ ] Select recommended events
- [ ] Copy Webhook Signature Key
- [ ] Add to `.env.local`: `SQUARE_WEBHOOK_SIGNATURE_KEY`
- [ ] Implement webhook handler in `/api/square/webhooks/route.ts`
- [ ] Test with Square Sandbox
- [ ] Monitor webhook logs
- [ ] Add more events as needed

## 🔗 Resources

- [Square Webhooks Documentation](https://developer.squareup.com/docs/webhooks/overview)
- [Square Webhook Events Reference](https://developer.squareup.com/reference/square/webhooks)
- [Webhook Signature Verification](https://developer.squareup.com/docs/webhooks/step3validate)

---

## 💬 Recommendation for Spiral Groove Records

**Start with this minimal set:**
```
✅ order.created
✅ order.updated  
✅ payment.created
✅ payment.updated
```

**Add later if needed:**
- `order.fulfillment.updated` - If you want real-time shipping updates
- `refund.created` - If you process refunds
- `inventory.count.updated` - Only if you need real-time inventory sync (consider polling instead)
- `checkout.updated` / `checkout.completed` - If using Square Checkout API for online orders
- `loyalty.*` events - If you have a Square Loyalty program

**Do you need Checkout events?**
- ✅ **Yes** - If you're using Square's Checkout API (hosted checkout pages)
- ❌ **No** - If you're using Orders API directly (you already have `order.created`)

**Do you need Loyalty events?**
- ✅ **Yes** - If you have Square Loyalty program enabled
- ❌ **No** - If you don't have a loyalty program or use a different loyalty system

This gives you full order and payment tracking without overwhelming your system with too many events.

