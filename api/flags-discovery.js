import { createFlagsDiscoveryEndpoint } from 'flags/next'
import { getProviderData } from '@flags-sdk/vercel'
import { withWebHandler } from './_vercelNodeAdapter.js'
import * as flags from './flags/registry.js'

export const config = {
  runtime: 'nodejs',
}

const discoveryHandler = createFlagsDiscoveryEndpoint(async () => getProviderData(flags))

/**
 * GET /.well-known/vercel/flags (rewritten from vercel.json)
 * Flags Explorer discovery endpoint.
 */
export async function webHandler(request) {
  return discoveryHandler(request)
}

export default withWebHandler(webHandler)
