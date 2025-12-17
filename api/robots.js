/**
 * Dynamic robots.txt endpoint
 * Serves noindex for staging, normal for production
 */

import { withWebHandler } from './_vercelNodeAdapter.js';

export async function webHandler(request) {
  const hostname = request.headers.get('host') || '';
  const isStaging = hostname.includes('greychair.io');
  
  const robotsContent = isStaging
    ? `User-agent: *
Disallow: /

# Staging environment - not for indexing`
    : `User-agent: *
Allow: /

Sitemap: https://spiralgrooverecords.com/sitemap.xml`;

  return new Response(robotsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export const config = {
  runtime: 'nodejs',
};

export default withWebHandler(webHandler);
