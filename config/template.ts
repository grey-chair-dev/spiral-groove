export type SiteFeatureFlags = {
  enableEvents: boolean;
  enableBlog: boolean;
  enableWishlist: boolean;
  enableStaffPortal: boolean;
};

export type BrandingConfig = {
  siteName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  logoPath: string;
};

export type CommerceProvider = 'ecs';

export type CommerceConfig = {
  provider: CommerceProvider;
  locationId: string;
};

export type TemplateConfig = {
  branding: BrandingConfig;
  features: SiteFeatureFlags;
  commerce: CommerceConfig;
};

const templateConfig: TemplateConfig = {
  branding: {
    siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Local Commerce Shop',
    tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE ?? 'Curated Finds for Music Lovers',
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? '#C539B4',
    secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR ?? '#18181B',
    logoPath: process.env.NEXT_PUBLIC_LOGO_PATH ?? '/logo.svg',
  },
  features: {
    enableEvents: process.env.NEXT_PUBLIC_ENABLE_EVENTS !== 'false',
    enableBlog: process.env.NEXT_PUBLIC_ENABLE_BLOG !== 'false',
    enableWishlist: process.env.NEXT_PUBLIC_ENABLE_WISHLIST !== 'false',
    enableStaffPortal: process.env.NEXT_PUBLIC_ENABLE_STAFF_PORTAL !== 'false',
  },
  commerce: {
    provider: 'ecs',
    locationId: process.env.ECS_LOCATION_ID ?? '',
  },
};

export default templateConfig;


