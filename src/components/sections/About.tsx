'use client';

import Image from 'next/image';
import Link from 'next/link';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Button from '@/components/ui/Button';
import { SITE_CONFIG } from '@/lib/constants';

interface AboutProps {
  showFullContent?: boolean;
  className?: string;
}

export default function About({ showFullContent = false, className }: AboutProps) {
  const stats = [
    { label: 'Years in Business', value: '15+' },
    { label: 'Vinyl Records', value: '10,000+' },
    { label: 'Happy Customers', value: '5,000+' },
    { label: 'Events Hosted', value: '200+' }
  ];

  const values = [
    {
      title: 'Authenticity',
      description: 'Every record in our collection is carefully curated and accurately graded. What you see online is exactly what you get.',
      icon: '🎵'
    },
    {
      title: 'Community',
      description: 'We\'re more than a record store - we\'re a hub for music lovers to connect, discover, and share their passion.',
      icon: '🤝'
    },
    {
      title: 'Expertise',
      description: 'Our knowledgeable staff can help you find the perfect record, whether you\'re a seasoned collector or just starting out.',
      icon: '🎧'
    }
  ];

  if (showFullContent) {
    return (
      <SectionWrapper background="primary" padding="xxl" className={className}>
        <div className="max-w-6xl mx-auto">
          {/* Hero section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary-black mb-6">
              Our Story
            </h1>
            <p className="text-xl text-neutral-gray max-w-3xl mx-auto leading-relaxed">
              Spiral Groove Records was born from a simple belief: music should be experienced, 
              not just consumed. We're passionate about preserving the analog warmth of vinyl 
              while building a community of music lovers in the heart of Milford, Ohio.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-display font-bold text-accent-teal mb-2">
                  {stat.value}
                </div>
                <div className="text-neutral-gray text-sm lg:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-display font-semibold text-primary-black mb-3">
                  {value.title}
                </h3>
                <p className="text-neutral-gray leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/contact">
              <Button size="lg">
                Visit Our Store
              </Button>
            </Link>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper background="secondary" padding="lg" className={className}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl font-display font-bold text-primary-cream mb-6">
              Your Neighborhood Record Store
            </h2>
            <p className="text-lg text-primary-cream/80 mb-6 leading-relaxed">
              Since 2009, Spiral Groove Records has been the heart of Milford's music scene. 
              We specialize in new and used vinyl, audio equipment, and creating a space 
              where music lovers can discover, connect, and celebrate the analog experience.
            </p>
            <p className="text-primary-cream/80 mb-8 leading-relaxed">
              Our knowledgeable staff curates every record with care, ensuring accurate 
              condition grading and fair pricing. From rare finds to new releases, 
              we're your trusted source for quality vinyl.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/about">
                <Button variant="outline" className="border-primary-cream text-primary-cream hover:bg-primary-cream hover:text-primary-black">
                  Learn More
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="text" className="text-primary-cream hover:text-accent-amber">
                  Browse Collection
                </Button>
              </Link>
            </div>
          </div>

          {/* Image placeholder */}
          <div className="relative">
            <div className="aspect-square bg-accent-teal/20 rounded-large flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎵</div>
                <p className="text-primary-cream text-lg font-semibold">Store Photo</p>
                <p className="text-primary-cream/60 text-sm">Coming Soon</p>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-amber/20 rounded-full animate-float" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent-teal/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
