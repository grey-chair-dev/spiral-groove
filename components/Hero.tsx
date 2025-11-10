"use client";

import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-texture-vinyl">
      {/* Full-width background image: real photo of couch + vinyl wall */}
      <div className="absolute inset-0">
          <Image
          src="/images/store-interior.jpg"
          alt="Spiral Groove Records interior with couch and vinyl wall"
            fill
          className="object-cover"
          priority
            onError={(e) => {
            // Fallback to placeholder if image doesn't exist
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
          }}
        />
        {/* Warm overlay with vinyl grain texture */}
        <div className="absolute inset-0 hero-overlay">
          <div className="absolute inset-0 vinyl-grain-texture"></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container px-4 py-12 sm:py-16 md:py-32 min-h-[70vh] sm:min-h-[80vh] flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="groovy-text text-3xl sm:text-5xl md:text-7xl lg:text-8xl mb-3 sm:mb-4 text-white animate-fade-in-up drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] leading-tight">
            Milford's Home for Vinyl Lovers
          </h1>
          
          {/* Sub-heading */}
          <p className="text-base sm:text-lg md:text-xl text-white/95 mb-6 sm:mb-10 max-w-2xl mx-auto px-4 animate-fade-in-up drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] font-medium" style={{ animationDelay: '0.2s' }}>
            Dig through new arrivals, chat music, or swing by the shop — we've got something spinning every day.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link href="/shop" className="btn-primary text-base sm:text-xl px-6 sm:px-10 py-3 sm:py-5 w-full sm:w-auto">
              Shop New Vinyl
            </Link>
            <Link href="/about" className="btn-secondary text-base sm:text-xl px-6 sm:px-10 py-3 sm:py-5 bg-transparent border-2 border-white text-white hover:bg-white hover:text-contrast-navy w-full sm:w-auto">
              Visit the Store
            </Link>
          </div>
          
          {/* Visual cue: floating vinyl icon */}
          <div className="absolute bottom-20 right-10 animate-bob hidden md:block" style={{ animationDelay: '0.6s' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-white/80">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="20" cy="20" r="6" fill="currentColor" />
              </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
