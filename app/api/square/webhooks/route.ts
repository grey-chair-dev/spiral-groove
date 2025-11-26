import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Parse safely
  let parsed: any = null;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const merchant = parsed?.merchant_id;
  const signature = request.headers.get("x-square-hmacsha256-signature");

  // --- SQUARE TEST EVENT ---
  // Test events NEVER include a signature AND merchant_id starts with 6SSW
  if (!signature && typeof merchant === "string" && merchant.startsWith("6SSW")) {
    console.log("Square TEST EVENT — skipping signature validation");
    return NextResponse.json({ success: true, test: true });
  }

  // --- REAL WEBHOOK VALIDATION ---
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 401 }
    );
  }

  const expected = crypto
    .createHmac("sha256", key)
    .update(rawBody)
    .digest("base64");

  const receivedBuf = Buffer.from(signature, "base64");
  const expectedBuf = Buffer.from(expected, "base64");

  if (
    receivedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(receivedBuf, expectedBuf)
  ) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  console.log("VALID SQUARE EVENT:", parsed.type);

  // Route event types
  await routeEvent(parsed.type, parsed.data);

  return NextResponse.json({ success: true });
}

/* -------------------------
   EVENT ROUTER
------------------------- */

async function routeEvent(type: string, data: any) {
  switch (type) {
    case "order.created": return handleOrderCreated(data);
    case "order.updated": return handleOrderUpdated(data);
    case "order.fulfillment.updated": return handleOrderFulfillmentUpdated(data);

    case "payment.created": return handlePaymentCreated(data);
    case "payment.updated": return handlePaymentUpdated(data);

    case "refund.created": return handleRefundCreated(data);
    case "refund.updated": return handleRefundUpdated(data);

    case "customer.created": return handleCustomerCreated(data);
    case "customer.updated": return handleCustomerUpdated(data);
    case "customer.deleted": return handleCustomerDeleted(data);

    case "inventory.count.updated": return handleInventoryCountUpdated(data);

    case "catalog.version.updated": return handleCatalogVersionUpdated(data);

    case "loyalty.account.created":
    case "loyalty.account.updated":
    case "loyalty.account.deleted":
    case "loyalty.event.created":
    case "loyalty.program.created":
    case "loyalty.program.updated":
    case "loyalty.promotion.created":
    case "loyalty.promotion.updated":
      return handleLoyaltyEvent(type, data);

    default:
      console.log("Unhandled Square event:", type);
  }
}

/* -------------------------
   EVENT HANDLERS
------------------------- */

async function handleOrderCreated(data: any) { console.log("Order created", data); }
async function handleOrderUpdated(data: any) { console.log("Order updated", data); }
async function handleOrderFulfillmentUpdated(data: any) { console.log("Order fulfillment updated", data); }

async function handlePaymentCreated(data: any) { console.log("Payment created", data); }
async function handlePaymentUpdated(data: any) { console.log("Payment updated", data); }

async function handleRefundCreated(data: any) { console.log("Refund created", data); }
async function handleRefundUpdated(data: any) { console.log("Refund updated", data); }

async function handleCustomerCreated(data: any) { console.log("Customer created", data); }
async function handleCustomerUpdated(data: any) { console.log("Customer updated", data); }
async function handleCustomerDeleted(data: any) { console.log("Customer deleted", data); }

async function handleInventoryCountUpdated(data: any) { 
  console.log("Inventory updated", data);
  // Note: With caching, inventory will refresh on next request after cache expires (5 min)
}

async function handleCatalogVersionUpdated(data: any) { 
  console.log("Catalog version updated", data);
  // Note: With caching, products will refresh on next request after cache expires
  // Or you can manually revalidate the cache if needed
}

async function handleLoyaltyEvent(type: string, data: any) { console.log(`Loyalty event ${type}`, data); }
