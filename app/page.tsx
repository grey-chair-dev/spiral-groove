import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import EditorialGrid from "@/components/EditorialGrid";
import AudioPlayer from "@/components/AudioPlayer";
import EventCard from "@/components/EventCard";
import Image from "next/image";
import Script from "next/script";
import type { Metadata } from "next";
import DemoBanner from "@/components/DemoBanner";
import WavyDivider from "@/components/WavyDivider";
import RecordDivider from "@/components/RecordDivider";

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
      
      {/* Record Edge Divider */}
      <RecordDivider color="#E96B3A" />
      
      {/* New Arrivals Section */}
      <section className="section bg-cream bg-texture-vinyl px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="groovy-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 text-warm-red leading-tight">Straight from the crates</h2>
            <p className="text-contrast-navy mt-2 text-base sm:text-lg">Fresh vinyl just added to our collection.</p>
          </div>
          <a className="link-accent font-semibold text-sm sm:text-base self-start sm:self-auto" href="/shop/new-arrivals">View all →</a>
        </div>
        <ProductGrid limit={8} section="new-arrivals" />
      </section>

      {/* Record Edge Divider */}
      <RecordDivider color="#00B3A4" />
      
      {/* Featured Products Section */}
      <section className="section bg-cream bg-texture-vinyl px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="groovy-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 text-secondary-yellow leading-tight">Our weekend spins</h2>
            <p className="text-contrast-navy mt-2 text-base sm:text-lg">Hand-picked favorites from our team — what we're actually listening to</p>
          </div>
          <a className="link-accent font-semibold text-sm sm:text-base self-start sm:self-auto" href="/shop">View all →</a>
        </div>
        <ProductGrid limit={4} section="staff-picks" />
      </section>

      {/* Record Edge Divider */}
      <RecordDivider color="#CBAE88" flip />

      {/* New & Used Vinyl Section */}
      <section className="section bg-cream bg-texture-vinyl px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="groovy-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 text-primary-orange leading-tight">New & Used Vinyl</h2>
            <p className="text-contrast-navy mt-2 text-base sm:text-lg">What's spinning in Milford this week</p>
          </div>
          <a className="link-accent font-semibold text-sm sm:text-base self-start sm:self-auto" href="/shop">View all →</a>
        </div>
        <ProductGrid limit={8} section="vinyl" />
      </section>

      {/* Record Edge Divider */}
      <RecordDivider color="#E96B3A" />

      {/* Audio Equipment Section */}
      <section className="section bg-cream bg-texture-vinyl px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="groovy-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 text-teal leading-tight">Audio Equipment & Accessories</h2>
            <p className="text-contrast-navy mt-2 text-base sm:text-lg">Everything you need for the perfect listening experience — from entry-level to audiophile grade</p>
          </div>
          <a className="link-accent font-semibold text-sm sm:text-base self-start sm:self-auto" href="/shop?category=equipment">View all →</a>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
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

      {/* Record Edge Divider */}
      <RecordDivider color="#00B3A4" flip />

      {/* Events Section */}
      <section className="section bg-teal/90 text-white bg-texture-vinyl px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="groovy-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 text-white leading-tight">Events & Community</h2>
            <p className="text-white/90 mt-2 text-base sm:text-lg">Live jazz nights, record swaps, and maybe a basement dance-off or two.</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
              <a href="/events" className="btn-primary bg-white text-teal hover:bg-mustard hover:text-white text-center text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">View upcoming events</a>
              <a href="/events/book" className="btn-secondary border-white text-white hover:bg-white hover:text-teal text-center text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">Book our event space</a>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
          <EventCard
            image="/images/placeholders/vinyl.jpg"
            alt="Live Jazz Night event at Spiral Groove Records"
            title="Live Jazz Night"
            date="March 15, 2025 • Intimate basement venue"
            description="Intimate shows in our basement event space featuring local and touring artists"
            badge={{ text: "This Saturday", className: "bg-warm-red text-white" }}
            timeBadge="7:00 PM"
            href="/events"
            eventTitle="Live Jazz Night"
          />
          
          <div className="bg-white rounded-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="/images/placeholders/vinyl.jpg" 
                alt="Record Fair event at Spiral Groove Records"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-mustard text-white">Monthly</span>
              </div>
              <div className="absolute bottom-4 right-4">
                <span className="badge bg-teal text-white">First Saturday</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-lg mb-1 text-contrast-navy">Record Fair 🎷</h3>
              <p className="text-sm text-neutral-600 mb-3">First Saturday of every month</p>
              <p className="text-sm text-neutral-600 mb-4">Monthly vinyl trading events with collectors, dealers, and music lovers</p>
              <a href="/events/record-fair" className="btn-primary w-full text-center">Get Tickets</a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="/images/placeholders/crafts.jpg" 
                alt="Vinyl Crafts at Spiral Groove Records"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-teal text-white">Handmade</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-lg mb-1 text-contrast-navy">Vinyl Crafts</h3>
              <p className="text-sm text-neutral-600 mb-3">Unique handmade items</p>
              <p className="text-sm text-neutral-600 mb-4">Handmade bowls, décor, and unique items crafted from recycled vinyl</p>
              <a href="/shop?category=crafts" className="btn-primary w-full text-center">Shop Crafts</a>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-white/80 italic">
            Tag us <a href="https://www.instagram.com/spiral_groove_records_/?hl=en" className="text-mustard hover:underline font-semibold">@spiral_groove_records_</a> when you visit!
          </p>
        </div>
      </section>


    </>
  );
}
