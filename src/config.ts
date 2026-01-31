export type FeatureFlags = {
  enableAbout: boolean
  enableEvents: boolean
  enableMaintenancePage: boolean
  enableComingSoonPage: boolean
  enableSocialLinks: boolean
  enablePromoBar: boolean
  enableNewsletter: boolean
}

const maintenancePageEnabled =
  (import.meta.env.VITE_ENABLE_MAINTENANCE_PAGE ?? 'false').toString().toLowerCase() === 'true'

const comingSoonPageEnabled =
  (import.meta.env.VITE_ENABLE_COMING_SOON_PAGE ?? 'false').toString().toLowerCase() === 'true'

const socialLinksEnabled =
  (import.meta.env.VITE_ENABLE_SOCIAL_LINKS ?? 'true').toString().toLowerCase() !== 'false'

const promoBarEnabled =
  (import.meta.env.VITE_ENABLE_PROMO_BAR ?? 'true').toString().toLowerCase() !== 'false'

const newsletterEnabled =
  (import.meta.env.VITE_ENABLE_NEWSLETTER ?? 'true').toString().toLowerCase() !== 'false'

export const featureFlags: FeatureFlags = {
  enableAbout: true,
  enableEvents: true,
  enableMaintenancePage: maintenancePageEnabled,
  enableComingSoonPage: comingSoonPageEnabled,
  enableSocialLinks: socialLinksEnabled,
  enablePromoBar: promoBarEnabled,
  enableNewsletter: newsletterEnabled,
}

export type SiteConfig = {
  appId: string
  brandName: string
  tagline: string
  hero: {
    headline: string
    subheading: string
    primaryCta: string
    secondaryCta: string
  }
  about: {
    heading: string
    body: string
    highlights: string[]
  }
  events: {
    title: string
    date: string
    description: string
  }[]
  contact: {
    phone: string
    email: string
    location: string
    hours: string
  }
  legal: {
    privacyUrl: string
    termsUrl: string
  }
  social: {
    facebook?: string
    instagram?: string
    twitter?: string
    tiktok?: string
    linkedin?: string
  }
  promoBar?: {
    enabled: boolean
    message: string
  }
}

const platformAppId =
  typeof window === 'undefined'
    ? undefined
    : (window as Window & { __app_id?: string }).__app_id

export const siteConfig: SiteConfig = {
  appId: import.meta.env.VITE_APP_ID ?? platformAppId ?? 'spiral-groove',
  brandName: 'Spiral Groove Records',
  tagline: 'Records, gear, and good hangs in Milford.',
  hero: {
    headline: 'Spiral Groove Records',
    subheading:
      'New & used vinyl, turntables, and a community space for listening parties and local showcases.',
    primaryCta: 'Browse the stacks',
    secondaryCta: 'Get in touch',
  },
  about: {
    heading: 'Independent shop. Community vibes.',
    body: 'We’re a record shop built for crate diggers—new arrivals, staff picks, and gear you can trust. Stop in, say hi, and stay in the groove.',
    highlights: [
      'New & used vinyl + curated staff picks',
      'Turntables, accessories, and essentials',
      'Events, listening parties, and more',
    ],
  },
  events: [],
  contact: {
    phone: '(513) 600-8018',
    email: 'adam@spiralgrooverecords.com',
    location: '215B Main Street, Milford, OH 45150',
    hours: 'See in-store signage for current hours',
  },
  legal: {
    privacyUrl: 'https://spiralgrooverecords.com/privacy',
    termsUrl: 'https://spiralgrooverecords.com/terms',
  },
  social: {
    facebook: 'https://www.facebook.com/spiralgrooverecords',
    instagram: 'https://www.instagram.com/spiral_groove_records_/?hl=en',
    tiktok: 'https://www.tiktok.com/@spiral_groove',
  },
  promoBar: {
    enabled: true,
    message: 'Store pickup available · New arrivals every week',
  },
}

