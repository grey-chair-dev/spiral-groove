import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { enqueueWebhookTask, isWebhookQueueEnabled } from "@/lib/webhooks/queue";
import { handleWebhookEvent, logInfo as workerLog } from "@/lib/webhooks/handlers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WEBHOOK_LOG_PREFIX = '[SquareWebhook]';

const logInfo = (message: string, context: Record<string, unknown> = {}) => {
  console.info(WEBHOOK_LOG_PREFIX, message, context);
};

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
    logInfo('Test event received', { merchant });
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

  logInfo('Event received', { type: parsed.type, merchant });

  // Queue for async processing; fall back to inline processing if queue missing
  if (isWebhookQueueEnabled()) {
    await enqueueWebhookTask(parsed.type, parsed.data);
  } else {
    workerLog('Queue disabled; processing synchronously', { type: parsed.type });
    await handleWebhookEvent(parsed.type, parsed.data);
  }

  return NextResponse.json({ success: true });
}

