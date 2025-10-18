'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { SITE_CONFIG } from '@/lib/constants';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: 'Discover Your Groove',
      subtitle: 'Your premier destination for vinyl records, events, and music community in Milford, OH',
      cta: 'Shop New Arrivals',
      ctaLink: '/shop',
      secondaryCta: 'Explore Event Space',
      secondaryCtaLink: '/event-space',
      background: 'bg-gradient-to-br from-primary-cream to-accent-teal/20'
    },
    {
      title: 'Authentic Analog Experience',
      subtitle: 'Curated vinyl selection with knowledgeable staff and real-time inventory accuracy',
      cta: 'Browse Collection',
      ctaLink: '/shop',
      secondaryCta: 'Learn More',
      secondaryCtaLink: '/about',
      background: 'bg-gradient-to-br from-accent-teal/10 to-primary-cream'
    },
    {
      title: 'Community First',
      subtitle: 'Join our growing community of music lovers through events, workshops, and local partnerships',
      cta: 'View Events',
      ctaLink: '/event-space',
      secondaryCta: 'Join Newsletter',
      secondaryCtaLink: '/newsletter',
      background: 'bg-gradient-to-br from-primary-cream to-accent-amber/20'
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const currentSlideData = heroSlides[currentSlide] || heroSlides[0];

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background with vinyl texture */}
      <div className={`absolute inset-0 ${currentSlideData.background} transition-all duration-1000`}>
        <div className="absolute inset-0 bg-vinyl-texture opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-black/20 to-transparent" />
      </div>

      {/* Floating vinyl records animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 rounded-full border-4 border-accent-teal/20 animate-float"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-black mb-6 animate-fade-in-up">
          {currentSlideData.title}
        </h1>
        
        <p className="text-lg sm:text-xl lg:text-2xl text-primary-black/80 mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {currentSlideData.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link href={currentSlideData.ctaLink}>
            <Button size="lg" className="w-full sm:w-auto">
              {currentSlideData.cta}
            </Button>
          </Link>
          
          <Link href={currentSlideData.secondaryCtaLink}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {currentSlideData.secondaryCta}
            </Button>
          </Link>
        </div>

        {/* Store info */}
        <div className="mt-12 text-sm text-primary-black/60 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <p className="mb-2">
            <span className="font-semibold">📍 {SITE_CONFIG.address.full}</span>
          </p>
          <p>
            <span className="font-semibold">📞 {SITE_CONFIG.contact.phone}</span>
          </p>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-accent-teal scale-125' 
                : 'bg-primary-black/30 hover:bg-primary-black/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-black/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-black/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
