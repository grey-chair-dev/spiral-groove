import ProductGrid from "@/components/ProductGrid";
import DemoBanner from "@/components/DemoBanner";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import type { Metadata } from "next";
import { isSquareConfigured } from "@/lib/square";

// Add noindex when using placeholder content (before Square is configured)
export const metadata: Metadata = !isSquareConfigured() ? {
  title: "New Arrivals | Spiral Groove Records",
  description: "Fresh vinyl just added to our collection. Discover the latest releases and rare finds that just arrived at Spiral Groove Records.",
  alternates: {
    canonical: "https://spiralgrooverecords.com/shop/new-arrivals",
  },
  robots: {
    index: false,
    follow: false,
  },
} : {
  title: "New Arrivals | Spiral Groove Records",
  description: "Fresh vinyl just added to our collection. Discover the latest releases and rare finds that just arrived at Spiral Groove Records.",
  alternates: {
    canonical: "https://spiralgrooverecords.com/shop/new-arrivals",
  },
};

export default function NewArrivals() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "https://spiralgrooverecords.com" },
          { name: "Shop", item: "https://spiralgrooverecords.com/shop" },
          { name: "New Arrivals", item: "https://spiralgrooverecords.com/shop/new-arrivals" },
        ]}
      />
      <DemoBanner />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section bg-gradient-to-b from-neutral-50 to-white">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-display font-bold text-5xl md:text-6xl text-text-dark mb-4">
            New Arrivals
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Fresh vinyl just added to our collection. Discover the latest releases and rare finds that just arrived at Spiral Groove Records.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="section">
        <div className="mb-8">
          <h2 className="font-display font-semibold text-3xl text-text-dark mb-2">
            Recently Added
          </h2>
          <p className="text-neutral-600">
            These records were added to our inventory in the last 30 days
          </p>
        </div>
        
        <ProductGrid section="new-arrivals" />
      </section>
    </div>
    </>
  );
}
