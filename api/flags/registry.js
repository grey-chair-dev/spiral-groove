/**
 * Vercel Flags — shared registry for serverless handlers.
 * Flag `subscription` must match the key in the Vercel Flags dashboard.
 *
 * Requires FLAGS and FLAGS_SECRET (run `vercel env pull` after linking the project).
 */
import { flag } from 'flags/next'
import { vercelAdapter } from '@flags-sdk/vercel'

export const subscriptionFlag = flag({
  key: 'subscription',
  adapter: vercelAdapter(),
  description: 'Subscription-related UI and offers (e.g. newsletter upsell, recurring programs).',
  defaultValue: false,
  options: [
    { value: false, label: 'Off' },
    { value: true, label: 'On' },
  ],
})
