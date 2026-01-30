/**
 * Health check endpoint for Square adapter
 * 
 * Example: VITE_ADAPTER_HEALTH_URL=https://your-app.vercel.app/api/square/health
 */

// Avoid depending on `@vercel/node` types (not installed in this repo).
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check if Square credentials are configured
  const hasAccessToken = !!process.env.SQUARE_ACCESS_TOKEN
  const hasLocationId = !!process.env.SQUARE_LOCATION_ID

  if (!hasAccessToken || !hasLocationId) {
    return res.status(503).json({
      status: 'degraded',
      message: 'Square credentials not fully configured',
    })
  }

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}

