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
  metadataBase: new URL("https://localcommercetemplate.com"),
  title: "Local Commerce Template | Coming Soon",
  description: "Milford's favorite product shop. New website coming soon. Visit us at 215B Main St, Milford, OH.",
  alternates: {
    canonical: "https://localcommercetemplate.com/",
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
    title: "Local Commerce Template | Coming Soon",
    description: "Milford's favorite product shop. New website coming soon.",
    url: "https://localcommercetemplate.com/",
    siteName: "Local Commerce Template",
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
  "name": "Local Commerce Template",
  "image": "https://localcommercetemplate.com/images/storefront.jpg",
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
  "url": "https://localcommercetemplate.com",
  "priceRange": "$$",
  "sameAs": [
    "https://www.instagram.com/localcommerceshop/",
    "https://www.facebook.com/localcommercetemplate/",
    "https://www.tiktok.com/@localcommerceshop",
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
