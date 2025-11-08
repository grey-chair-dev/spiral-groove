import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Configure Google Fonts
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spiralgrooverecords.com"),
  title: "Spiral Groove Records | Milford, OH Vinyl Shop",
  description: "Buy vinyl, turntables, and accessories. Join live shows and community events at Milford's local record shop. New & used vinyl, audio gear, events. Serving Clermont County & Greater Cincinnati.",
  alternates: {
    canonical: "https://spiralgrooverecords.com/",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Spiral Groove Records | Milford, OH Vinyl Shop",
    description: "Buy vinyl, turntables, and accessories. Join live shows and community events at Milford's local record shop.",
    url: "https://spiralgrooverecords.com/",
    siteName: "Spiral Groove Records",
    images: [
      {
        url: "/images/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Spiral Groove Records - Milford's Local Vinyl Shop",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spiral Groove Records | Milford, OH Vinyl Shop",
    description: "Discover new vinyl, attend live events, and be part of Milford's music community.",
    images: ["/images/og-banner.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#00B3A4",
};

// LocalBusiness Schema
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Spiral Groove Records",
  "image": "https://spiralgrooverecords.com/images/storefront.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "215B Main St",
    "addressLocality": "Milford",
    "addressRegion": "OH",
    "postalCode": "45150",
    "addressCountry": "US",
  },
  "telephone": "+1-513-600-8018",
  "openingHours": "Mo-Su 12:00-21:00",
  "url": "https://spiralgrooverecords.com",
  "priceRange": "$$",
  "sameAs": [
    "https://www.instagram.com/spiral_groove_records_/",
    "https://www.facebook.com/spiralgrooverecords/",
    "https://www.tiktok.com/@spiral_groove",
  ],
};

// Global Breadcrumb Schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://spiralgrooverecords.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Shop",
      item: "https://spiralgrooverecords.com/shop",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Events",
      item: "https://spiralgrooverecords.com/events",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfairDisplay.variable} ${inter.variable} ${poppins.variable}`}>
        {/* LocalBusiness Schema */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        {/* Global Breadcrumb Schema */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
        {/* Analytics - Plausible */}
        <Script
          defer
          data-domain="spiralgrooverecords.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
