import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Configure Google Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spiralgrooverecords.com"),
  title: "Spiral Groove Records | Coming Soon",
  description: "Milford's favorite record shop. New website coming soon. Visit us at 215B Main St, Milford, OH.",
  alternates: {
    canonical: "https://spiralgrooverecords.com/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/icon.svg", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "Spiral Groove Records | Coming Soon",
    description: "Milford's favorite record shop. New website coming soon.",
    url: "https://spiralgrooverecords.com/",
    siteName: "Spiral Groove Records",
    locale: "en_US",
    type: "website",
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


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {/* LocalBusiness Schema */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        {children}
      </body>
    </html>
  );
}
