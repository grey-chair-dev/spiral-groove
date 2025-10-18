'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Shop', href: '/shop' },
  { name: 'Event Space', href: '/event-space' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-primary-black border-b border-accent-teal/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-accent-teal flex items-center justify-center">
                <span className="text-primary-cream font-display font-bold text-lg">SG</span>
              </div>
              <span className="text-primary-cream font-display font-bold text-xl hidden sm:block">
                Spiral Groove Records
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-primary-cream hover:text-accent-amber transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-amber transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right side - Cart and CTA */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <button className="text-primary-cream hover:text-accent-amber transition-colors duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </button>

            {/* Newsletter CTA */}
            <Link
              href="/newsletter"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-accent-teal text-primary-cream font-accent font-semibold text-sm rounded-medium hover:bg-accent-amber transition-colors duration-200"
            >
              Join Newsletter
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden text-primary-cream hover:text-accent-amber transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-primary-black border-t border-accent-teal/20">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-primary-cream hover:text-accent-amber hover:bg-accent-teal/10 transition-colors duration-200 rounded-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/newsletter"
              className="block mx-3 mt-4 px-4 py-2 bg-accent-teal text-primary-cream font-accent font-semibold text-sm rounded-medium hover:bg-accent-amber transition-colors duration-200 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Join Newsletter
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}