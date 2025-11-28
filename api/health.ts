import { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Health check endpoint for the data adapter
 * Route: /api/health
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check if Square credentials are configured
  const hasSquareConfig = !!(
    process.env.SQUARE_ACCESS_TOKEN &&
    process.env.SQUARE_LOCATION_ID
  )

  return res.status(200).json({
    status: hasSquareConfig ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'square-data-adapter',
    configured: hasSquareConfig,
  })
}

