/**
 * Dynamic robots.txt handler
 * Returns different robots.txt content based on hostname
 */

import { withWebHandler } from './_vercelNodeAdapter.js'

export async function webHandler(request) {
  const url = new URL(request.url)
  const hostname = url.hostname
  
  // Check if staging/preview environment
  const isStaging = hostname.includes('greychair.io') || 
                    (hostname.includes('vercel.app') && !hostname.includes('spiralgrooverecords.com'))
  
  if (isStaging) {
    // Staging: Disallow indexing
    return new Response(
      `User-agent: *
Disallow: /

# Staging environment - not for indexing
`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'X-Robots-Tag': 'noindex,nofollow',
        },
      }
    )
  } else {
    // Production: Allow indexing
    return new Response(
      `User-agent: *
Allow: /

Sitemap: https://www.spiralgrooverecords.com/sitemap.xml
`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'X-Robots-Tag': 'index,follow',
        },
      }
    )
  }
}

export const config = {
  runtime: 'nodejs',
}

export default withWebHandler(webHandler)

