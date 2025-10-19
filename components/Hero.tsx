"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic carousel items from /carousel/ directory
  const carouselItems = [
    {
      src: '/carousel/new.png',
      alt: 'New arrivals collection',
      link: '/shop/new-arrivals'
    },
    {
      src: '/carousel/events.png',
      alt: 'Upcoming events and live music',
      link: '/events'
    },
    {
      src: '/carousel/community.png',
      alt: 'Community events and gatherings',
      link: '/community'
    }
  ];

  // Auto-advance carousel every 5 seconds (if more images are added)
  useEffect(() => {
    if (!mounted || carouselItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted, carouselItems.length]);

  if (!mounted) {
    return (
      <section className="section">
        <div className="relative overflow-hidden min-h-[600px] rounded-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-black to-neutral-800" />
        </div>
      </section>
    );
  }

  const currentItem = carouselItems[currentSlide];

  return (
    <section className="section">
      <div className="relative overflow-hidden min-h-[600px] rounded-none">
        {/* Carousel Background */}
        <Link href={currentItem.link} className="absolute inset-0 block">
          <Image
            src={currentItem.src}
            alt={currentItem.alt}
            fill
            className="object-cover transition-all duration-1000 ease-in-out"
            priority={currentSlide === 0}
            sizes="100vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
              }
            }}
          />
        </Link>
        
        

        {/* Carousel Indicators - Only show if more than 1 image */}
        {carouselItems.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-500 ease-in-out ${
                index === currentSlide 
                  ? 'bg-accent-teal scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Navigation Arrows - Only show if more than 1 image */}
        {carouselItems.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((prev) => prev === 0 ? carouselItems.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-primary-black/50 text-text-light p-3 rounded-full hover:bg-primary-black/75 transition-all duration-500 ease-in-out z-20"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselItems.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary-black/50 text-text-light p-3 rounded-full hover:bg-primary-black/75 transition-all duration-500 ease-in-out z-20"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
