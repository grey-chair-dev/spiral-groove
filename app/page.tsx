import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import EditorialGrid from "@/components/EditorialGrid";
import AudioPlayer from "@/components/AudioPlayer";
import EventCard from "@/components/EventCard";
import Image from "next/image";
import Script from "next/script";
import type { Metadata } from "next";
import DemoBanner from "@/components/DemoBanner";

export const metadata: Metadata = {
  title: "Spiral Groove Records | Milford, OH Vinyl Shop",
  description: "Buy vinyl, turntables, and accessories. Join live shows and community events at Milford's local record shop. New & used vinyl, audio gear, events. Serving Clermont County & Greater Cincinnati.",
  alternates: {
    canonical: "https://spiralgrooverecords.com/",
  },
};

export default function Home() {
  const structuredData = {
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
      "addressCountry": "US"
    },
    "telephone": "+1-513-600-8018",
    "openingHours": "Mo-Su 12:00-21:00",
    "url": "https://spiralgrooverecords.com",
    "priceRange": "$$",
    "sameAs": [
      "https://www.instagram.com/spiral_groove_records_/",
      "https://www.facebook.com/spiralgrooverecords/",
      "https://www.tiktok.com/@spiral_groove"
    ]
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <DemoBanner />
      <Hero />
      
      {/* Hidden h1 for SEO - main content is in Hero */}
      <h1 className="sr-only">Spiral Groove Records - Milford's Local Vinyl Shop</h1>
      
      {/* Section Divider */}
      <div className="border-t border-neutral-200"></div>
      
      {/* New Arrivals Section */}
      <section className="section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-semibold text-[36px] md:text-[36px] text-[28px] leading-[130%] text-text-dark">New Arrivals</h2>
            <p className="text-neutral-600 mt-2">Fresh vinyl just added to our collection. <a href="/shop/new-arrivals" className="text-accent-teal hover:underline">Browse all new arrivals</a> or <a href="/shop" className="text-accent-teal hover:underline">shop by category</a>.</p>
          </div>
          <a className="link" href="/shop/new-arrivals">View all</a>
        </div>
        <ProductGrid limit={6} section="new-arrivals" />
      </section>

      {/* Section Divider */}
      <div className="border-t border-neutral-200"></div>
      
      {/* Featured Products Section */}
      <section className="section bg-white">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-semibold text-[36px] md:text-[36px] text-[28px] leading-[130%] text-text-dark">Staff Picks</h2>
            <p className="text-neutral-600 mt-2">Hand-picked favorites from our team</p>
          </div>
          <a className="link" href="/shop">View all</a>
        </div>
        <ProductGrid limit={4} section="staff-picks" />
      </section>

      {/* Section Divider */}
      <div className="border-t border-neutral-200"></div>

      {/* New & Used Vinyl Section */}
      <section className="section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-semibold text-[36px] md:text-[36px] text-[28px] leading-[130%] text-text-dark">New & Used Vinyl</h2>
            <p className="text-neutral-600 mt-2">Discover your next favorite record</p>
          </div>
          <a className="link" href="/shop">View all</a>
        </div>
        <ProductGrid limit={8} section="vinyl" />
      </section>

      {/* Section Divider */}
      <div className="border-t border-neutral-200"></div>

      {/* Audio Equipment Section */}
      <section className="section bg-white">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-semibold text-[36px] md:text-[36px] text-[28px] leading-[130%] text-text-dark">Audio Equipment & Accessories</h2>
            <p className="text-neutral-600 mt-2">Everything you need for the perfect listening experience</p>
          </div>
          <a className="link" href="/shop?category=equipment">View all</a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image 
                src="/images/placeholders/equipment.jpg" 
                alt="Turntables at Spiral Groove Records"
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-accent-teal text-text-light">From $199</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-xl mb-2">Turntables</h3>
              <p className="text-sm text-neutral-600 mb-4">Quality record players for every budget, from entry-level to audiophile grade</p>
              <a href="/shop?category=turntables" className="btn-secondary w-full text-center">Shop Turntables</a>
            </div>
          </div>
          
          <div className="card group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image 
                src="/images/placeholders/equipment.jpg" 
                alt="Amplifiers at Spiral Groove Records"
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-accent-amber text-text-dark">From $299</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-xl mb-2">Amplifiers</h3>
              <p className="text-sm text-neutral-600 mb-4">Tube and solid-state amplifiers to power your vinyl collection</p>
              <a href="/shop?category=amplifiers" className="btn-secondary w-full text-center">Shop Amplifiers</a>
            </div>
          </div>
          
          <div className="card group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image 
                src="/images/placeholders/equipment.jpg" 
                alt="Audio Accessories at Spiral Groove Records"
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-highlight-red text-text-light">From $15</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-xl mb-2">Accessories</h3>
              <p className="text-sm text-neutral-600 mb-4">Styli, cartridges, cleaning supplies, and everything in between</p>
              <a href="/shop?category=accessories" className="btn-secondary w-full text-center">Shop Accessories</a>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="border-t border-neutral-200"></div>

      {/* Events Section */}
      <section className="section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-semibold text-[36px] md:text-[36px] text-[28px] leading-[130%] text-text-dark">Events & Community</h2>
            <p className="text-neutral-600 mt-2">Join our vibrant music community. <a href="/events" className="text-accent-teal hover:underline">View upcoming events</a> or <a href="/events/book" className="text-accent-teal hover:underline">book our event space</a>.</p>
          </div>
          <a className="link" href="/events">View all</a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <EventCard
            image="/images/placeholders/vinyl.jpg"
            alt="Live Jazz Night event at Spiral Groove Records"
            title="Live Jazz Night"
            date="March 15, 2025 • Intimate basement venue"
            description="Intimate shows in our basement event space featuring local and touring artists"
            badge={{ text: "This Saturday", className: "bg-highlight-red text-text-light" }}
            timeBadge="7:00 PM"
            href="/events"
            eventTitle="Live Jazz Night"
          />
          
          <div className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="/images/placeholders/vinyl.jpg" 
                alt="Record Fair event at Spiral Groove Records"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-accent-amber text-text-dark">Monthly</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-lg mb-1">Record Fair</h3>
              <p className="text-sm text-neutral-600 mb-3">First Saturday of every month</p>
              <p className="text-sm text-neutral-600 mb-4">Monthly vinyl trading events with collectors, dealers, and music lovers</p>
              <a href="/events/record-fair" className="btn w-full text-center">Learn More</a>
            </div>
          </div>
          
          <div className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="/images/placeholders/crafts.jpg" 
                alt="Vinyl Crafts at Spiral Groove Records"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-accent-teal text-text-light">Handmade</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-lg mb-1">Vinyl Crafts</h3>
              <p className="text-sm text-neutral-600 mb-3">Unique handmade items</p>
              <p className="text-sm text-neutral-600 mb-4">Handmade bowls, décor, and unique items crafted from recycled vinyl</p>
              <a href="/shop?category=crafts" className="btn w-full text-center">Shop Crafts</a>
            </div>
          </div>
        </div>
      </section>


    </>
  );
}
