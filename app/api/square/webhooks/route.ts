import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Raw body (required for signature verification)
    const body = await request.text();

    // DIAGNOSTIC LOGGING - Compare with webhook.site to find body differences
    console.log("=== RAW BODY DIAGNOSTICS ===");
    console.log("RAW BODY (length):", body.length);
    console.log("RAW BODY (first 200 chars):", body.substring(0, 200));
    console.log("RAW BODY (last 200 chars):", body.substring(Math.max(0, body.length - 200)));
    console.log("RAW BODY (JSON stringified):", JSON.stringify(body.substring(0, 500))); // First 500 chars as JSON to see hidden chars

    // Log all headers for comparison
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("=== ALL HEADERS ===");
    console.log(JSON.stringify(headers, null, 2));

    // New Webhook Subscriptions API header
    // (This is the ONLY correct header for 2025-10-16 API)
    const signature = request.headers.get('x-square-signature')?.trim() || null;

    // Attempt to parse JSON for test-event detection
    let parsedBody: any = null;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // ignore, body may not be JSON
    }

    // Square sandbox test events (from Webhooks → "Send Test Event")
    // 1. Have NO signature
    // 2. merchant_id starts with 6SSW
    const isSquareTestEvent =
      !signature &&
      parsedBody &&
      typeof parsedBody.merchant_id === "string" &&
      parsedBody.merchant_id.startsWith("6SSW");

    console.log("Webhook received:", {
      timestamp: new Date().toISOString(),
      hasSignature: !!signature,
      merchant_id: parsedBody?.merchant_id,
      isTestEvent: isSquareTestEvent,
      bodyLength: body.length,
      url: request.url
    });

    // --------------------------
    //  TEST EVENTS — SKIP SIGNATURE
    // --------------------------
    if (isSquareTestEvent) {
      console.log("Square TEST event detected — skipping signature validation.");

      return NextResponse.json({
        success: true,
        test: true,
        type: parsedBody?.type,
        event_id: parsedBody?.event_id,
        received_at: new Date().toISOString()
      });
    }

    // --------------------------
    //  REAL EVENTS — MUST BE SIGNED
    // --------------------------
    if (!signature) {
      console.error("Missing x-square-signature for a non-test event.");
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 400 }
      );
    }

    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    if (!webhookSignatureKey) {
      console.error("SQUARE_WEBHOOK_SIGNATURE_KEY missing in env.");
      return NextResponse.json(
        { error: "Webhook signature key not configured" },
        { status: 500 }
      );
    }

    // Square Webhook Subscriptions API (current):
    // signature = HMAC_SHA256(body, signature_key)
    const expectedSignature = crypto
      .createHmac("sha256", webhookSignatureKey)
      .update(body)
      .digest("base64");

    // Convert both to binary buffers (required)
    const receivedBuf = Buffer.from(signature, "base64");
    const expectedBuf = Buffer.from(expectedSignature, "base64");

    // DIAGNOSTIC LOGGING - Compare signatures
    console.log("=== SIGNATURE VERIFICATION ===");
    console.log("Received signature (first 50 chars):", signature.substring(0, 50));
    console.log("Expected signature (first 50 chars):", expectedSignature.substring(0, 50));
    console.log("Received signature (base64):", signature);
    console.log("Expected signature (base64):", expectedSignature);
    console.log("Body used for signature (length):", body.length);
    console.log("Body used for signature (first 100 chars):", body.substring(0, 100));
    console.log("Signature verification:", {
      match: receivedBuf.equals(expectedBuf),
      receivedLength: receivedBuf.length,
      expectedLength: expectedBuf.length,
      receivedBase64: signature,
      expectedBase64: expectedSignature
    });

    // Must match EXACT binary length for timingSafeEqual
    if (receivedBuf.length !== expectedBuf.length) {
      console.error("Signature length mismatch");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Timing-safe comparison
    if (!crypto.timingSafeEqual(receivedBuf, expectedBuf)) {
      console.error("Invalid webhook signature (not equal)");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // --------------------------
    //  PARSE EVENT
    // --------------------------
    const { type, event_id, data } = parsedBody;

    console.log("Verified webhook event:", {
      type,
      event_id,
      timestamp: new Date().toISOString()
    });

    // Handle events
    switch (type) {
      case "order.created":
        await handleOrderCreated(data);
        break;
      case "order.updated":
        await handleOrderUpdated(data);
        break;
      case "order.fulfillment.updated":
        await handleOrderFulfillmentUpdated(data);
        break;
      case "payment.created":
        await handlePaymentCreated(data);
        break;
      case "payment.updated":
        await handlePaymentUpdated(data);
        break;
      case "refund.created":
        await handleRefundCreated(data);
        break;
      case "refund.updated":
        await handleRefundUpdated(data);
        break;
      case "customer.created":
        await handleCustomerCreated(data);
        break;
      case "customer.updated":
        await handleCustomerUpdated(data);
        break;
      case "customer.deleted":
        await handleCustomerDeleted(data);
        break;
      case "inventory.count.updated":
        await handleInventoryCountUpdated(data);
        break;
      case "catalog.version.updated":
        await handleCatalogVersionUpdated(data);
        break;
      // Loyalty events
      case "loyalty.account.created":
      case "loyalty.account.updated":
      case "loyalty.account.deleted":
      case "loyalty.event.created":
      case "loyalty.program.created":
      case "loyalty.program.updated":
      case "loyalty.promotion.created":
      case "loyalty.promotion.updated":
        await handleLoyaltyEvent(type, data);
        break;

      default:
        console.log(`Unhandled event type: ${type}`);
    }

    return NextResponse.json({
      success: true,
      type,
      event_id,
      received_at: new Date().toISOString()
    });

  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/* -------------------------
   EVENT HANDLERS
------------------------- */

async function handleOrderCreated(data: any) { console.log("Order created:", data); }
async function handleOrderUpdated(data: any) { console.log("Order updated:", data); }
async function handleOrderFulfillmentUpdated(data: any) { console.log("Fulfillment updated:", data); }
async function handlePaymentCreated(data: any) { console.log("Payment created:", data); }
async function handlePaymentUpdated(data: any) { console.log("Payment updated:", data); }
async function handleRefundCreated(data: any) { console.log("Refund created:", data); }
async function handleRefundUpdated(data: any) { console.log("Refund updated:", data); }
async function handleCustomerCreated(data: any) { console.log("Customer created:", data); }
async function handleCustomerUpdated(data: any) { console.log("Customer updated:", data); }
async function handleCustomerDeleted(data: any) { console.log("Customer deleted:", data); }
async function handleInventoryCountUpdated(data: any) { console.log("Inventory updated:", data); }
async function handleCatalogVersionUpdated(data: any) { console.log("Catalog updated:", data); }
async function handleLoyaltyEvent(type: string, data: any) { console.log(`Loyalty event: ${type}`, data); }
