'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Card, { CardContent } from '@/components/ui/Card';
import { mockTestimonials } from '@/lib/mock-data';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  image?: string;
  album_cover?: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
  autoRotate?: boolean;
  rotationInterval?: number;
}

export default function Testimonials({
  testimonials = mockTestimonials,
  title = 'What Our Customers Say',
  subtitle = 'Join thousands of satisfied music lovers who trust Spiral Groove Records',
  autoRotate = true,
  rotationInterval = 5000
}: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!autoRotate || isHovered || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, isHovered, rotationInterval, testimonials.length]);

  const currentTestimonial = testimonials[currentIndex] || testimonials[0];

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-accent-amber' : 'text-neutral-gray/30'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-primary-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-primary-cream mb-4">
            {title}
          </h2>
          <p className="text-lg text-primary-cream/80 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="relative">
          {/* Main testimonial */}
          <Card
            variant="default"
            className="max-w-4xl mx-auto bg-primary-cream/5 border-accent-teal/20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <CardContent className="p-8 text-center">
              {/* Album cover */}
              {currentTestimonial.album_cover && (
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto rounded-large overflow-hidden shadow-lg">
                    <Image
                      src={currentTestimonial.album_cover}
                      alt="Album cover"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Quote */}
              <blockquote className="text-xl lg:text-2xl text-primary-cream mb-6 leading-relaxed">
                "{currentTestimonial.text}"
              </blockquote>

              {/* Rating */}
              <div className="flex justify-center mb-4">
                {renderStars(currentTestimonial.rating)}
              </div>

              {/* Author */}
              <div className="flex items-center justify-center space-x-4">
                {currentTestimonial.image && (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-left">
                  <div className="font-semibold text-primary-cream">
                    {currentTestimonial.name}
                  </div>
                  <div className="text-primary-cream/60 text-sm">
                    {currentTestimonial.location}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-accent-teal scale-125'
                      : 'bg-primary-cream/30 hover:bg-primary-cream/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Previous/Next buttons */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex((prev) => 
                  prev === 0 ? testimonials.length - 1 : prev - 1
                )}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-cream/10 hover:bg-primary-cream/20 rounded-full flex items-center justify-center text-primary-cream transition-all duration-300"
                aria-label="Previous testimonial"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setCurrentIndex((prev) => 
                  prev === testimonials.length - 1 ? 0 : prev + 1
                )}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-cream/10 hover:bg-primary-cream/20 rounded-full flex items-center justify-center text-primary-cream transition-all duration-300"
                aria-label="Next testimonial"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
