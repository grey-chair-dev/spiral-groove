import ProductGrid from "@/components/ProductGrid";
import Filters from "@/components/Filters";
import DemoBanner from "@/components/DemoBanner";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import type { Metadata } from "next";
import { isSquareConfigured } from "@/lib/square";

// Add noindex when using placeholder content (before Square is configured)
export const metadata: Metadata = !isSquareConfigured() ? {
  title: "Shop | Spiral Groove Records",
  description: "Browse our collection of vinyl records, turntables, amplifiers, and audio accessories. New and used vinyl from all genres.",
  alternates: {
    canonical: "https://spiralgrooverecords.com/shop",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Shop Vinyl Records | Spiral Groove Records",
    description: "Browse our collection of vinyl records, turntables, amplifiers, and audio accessories.",
    url: "https://spiralgrooverecords.com/shop",
    images: [{ url: "https://spiralgrooverecords.com/images/og-shop.jpg", width: 1200, height: 630 }],
  },
} : {
  title: "Shop | Spiral Groove Records",
  description: "Browse our collection of vinyl records, turntables, amplifiers, and audio accessories. New and used vinyl from all genres.",
  alternates: {
    canonical: "https://spiralgrooverecords.com/shop",
  },
  openGraph: {
    title: "Shop Vinyl Records | Spiral Groove Records",
    description: "Browse our collection of vinyl records, turntables, amplifiers, and audio accessories.",
    url: "https://spiralgrooverecords.com/shop",
    images: [{ url: "https://spiralgrooverecords.com/images/og-shop.jpg", width: 1200, height: 630 }],
  },
};

export default function ShopPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "https://spiralgrooverecords.com" },
          { name: "Shop", item: "https://spiralgrooverecords.com/shop" },
        ]}
      />
      <DemoBanner />
      <div className="section">
        <h1 className="font-display font-bold text-4xl md:text-5xl text-text-dark mb-2">Vinyl Records for Sale in Milford, OH</h1>
        <p className="text-lg text-neutral-600 mb-6">Browse our collection of new and used vinyl records, turntables, amplifiers, and audio accessories</p>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <Filters />
        </aside>
        <div className="lg:col-span-3">
          <ProductGrid />
        </div>
      </div>
    </div>
    </>
  );
}
