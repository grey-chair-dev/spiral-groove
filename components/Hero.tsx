"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="section">
      <div className="card p-6 md:p-10 relative overflow-hidden min-h-[600px]">
        {/* Static Hero Collage Background */}
        <div className="absolute inset-0">
          <Image
            src="/hero-collage.jpg"
            alt="Recent vinyl arrivals collage"
            fill
            className="object-cover opacity-30"
            priority
            sizes="100vw"
            onError={(e) => {
              // Fallback to gradient background if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
              }
            }}
          />
        </div>
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-black/30 via-primary-black/50 to-primary-black/70" />
        
        {/* Content Layer */}
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center min-h-[500px]">
          <div>
            <h1 className="font-display font-bold text-[54px] md:text-[54px] text-[36px] leading-[120%] text-text-light drop-shadow-lg">
              Discover Your Next Favorite Record
            </h1>
            <p className="mt-2 font-accent font-semibold text-accent-teal text-lg drop-shadow-md">
              Spiral Groove Records
            </p>
            <p className="mt-4 font-body font-normal text-[18px] md:text-[18px] text-[16px] leading-[160%] text-neutral-200 max-w-prose drop-shadow-md">
              Independent record shop and community hub at 215B Main St, Milford, OH. Specializing in new & used vinyl, tapes, CDs, audio gear, and vinyl crafts. Serving Milford, Clermont County, and Greater Cincinnati with nationwide online reach.
            </p>
            
            {/* Trust indicators */}
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent-teal rounded-full"></span>
                <span>15+ Years in Business</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent-teal rounded-full"></span>
                <span>10,000+ Records</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent-teal rounded-full"></span>
                <span>Free Local Delivery</span>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a className="btn text-lg px-8 py-4" href="/shop">Browse Vinyl Collection</a>
              <a className="btn-secondary text-lg px-8 py-4" href="/events">View Upcoming Events</a>
            </div>
            
            {/* New Arrivals CTA */}
            <div className="mt-4">
              <a className="btn-secondary text-base px-6 py-3" href="/shop/new-arrivals">
                View New Arrivals
              </a>
            </div>
          </div>
          
          {/* Hero Image - Now Smaller and Positioned */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
            <Image 
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Vinyl records collection at Spiral Groove Records"
              fill
              className="object-cover transition-transform group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-black/20 to-transparent" />
            
            {/* Floating elements */}
            <div className="absolute top-4 right-4 bg-accent-teal text-text-light px-3 py-1 rounded-full text-sm font-semibold">
              New Arrivals
            </div>
            <div className="absolute bottom-4 left-4 bg-primary-black/80 text-text-light px-3 py-2 rounded-large">
              <div className="text-xs text-neutral-300">Now Playing</div>
              <div className="font-semibold">Miles Davis - Kind of Blue</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
