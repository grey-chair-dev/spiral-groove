// Send data to an external webhook (fire and forget)
// We don't wait for the response - if it fails, we just log it
// This way webhook failures don't break the main request
export async function sendWebhook(
  url: string,
  data: Record<string, any>
): Promise<void> {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch((error) => {
    // Log it but don't throw - we don't want webhook issues to break the user experience
    console.error('Webhook error:', error);
  });
}

