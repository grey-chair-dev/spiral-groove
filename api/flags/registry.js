/**
 * Vercel Flags — shared registry for serverless handlers.
 * Flag keys must match the Vercel Flags dashboard.
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

export const googleReviewsFlag = flag({
  key: 'googleReviews',
  adapter: vercelAdapter(),
  description: 'Google Business Profile review auto-reply + owner email for low-star reviews.',
  defaultValue: false,
  options: [
    { value: false, label: 'Off' },
    { value: true, label: 'On' },
  ],
})
