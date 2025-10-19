import ProductGrid from "@/components/ProductGrid";

export default function NewArrivals() {
  return (
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
        
        <ProductGrid />
      </section>
    </div>
  );
}
