import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import EditorialGrid from "@/components/EditorialGrid";
import AudioPlayer from "@/components/AudioPlayer";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Hero />
      
      {/* Section Divider */}
      <div className="border-t border-neutral-200"></div>
      
      {/* New Arrivals Section */}
      <section className="section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-semibold text-[36px] md:text-[36px] text-[28px] leading-[130%] text-text-dark">New Arrivals</h2>
            <p className="text-neutral-600 mt-2">Fresh vinyl just added to our collection</p>
          </div>
          <a className="link" href="/shop/new-arrivals">View all</a>
        </div>
        <ProductGrid limit={6} />
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
        <ProductGrid limit={4} />
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
        <ProductGrid limit={8} />
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
                src="https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Turntables"
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
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Amplifiers"
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
                src="https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Accessories"
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
            <p className="text-neutral-600 mt-2">Join our vibrant music community</p>
          </div>
          <a className="link" href="/events">View all</a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Live Music Event"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-highlight-red text-text-light">This Saturday</span>
              </div>
              <div className="absolute bottom-4 right-4">
                <span className="badge bg-accent-teal text-text-light">7:00 PM</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-lg mb-1">Live Jazz Night</h3>
              <p className="text-sm text-neutral-600 mb-3">March 15, 2025 • Intimate basement venue</p>
              <p className="text-sm text-neutral-600 mb-4">Intimate shows in our basement event space featuring local and touring artists</p>
              <a href="/events/jazz-night" className="btn w-full text-center">Get Tickets</a>
            </div>
          </div>
          
          <div className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Record Fair"
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
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Vinyl Crafts"
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
