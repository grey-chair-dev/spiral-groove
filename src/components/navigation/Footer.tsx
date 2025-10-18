'use client';

import { useState } from 'react';
import Link from 'next/link';

const navigation = {
  main: [
    { name: 'Shop', href: '/shop' },
    { name: 'Event Space', href: '/event-space' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
    { name: 'Partners', href: '/partners' },
    { name: 'Promotions', href: '/promotions' },
  ],
  social: [
    {
      name: 'Instagram',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
      ),
    },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="bg-primary-black text-primary-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand and description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-accent-teal flex items-center justify-center">
                <span className="text-primary-cream font-display font-bold text-sm">SG</span>
              </div>
              <span className="text-primary-cream font-display font-bold text-lg">
                Spiral Groove Records
              </span>
            </div>
            <p className="text-neutral-gray text-sm leading-relaxed mb-6 max-w-md">
              Your premier destination for vinyl records, events, and music community in Milford, OH. 
              Discover rare finds and connect with fellow music enthusiasts.
            </p>
            
            {/* Business info */}
            <div className="space-y-2 text-sm">
              <p className="text-primary-cream">
                <span className="font-semibold">Address:</span> 215 Main St, Milford, OH 45150
              </p>
              <p className="text-primary-cream">
                <span className="font-semibold">Phone:</span> (513) 555-0123
              </p>
              <p className="text-primary-cream">
                <span className="font-semibold">Email:</span> info@spiralgrooverecords.com
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-neutral-gray hover:text-accent-amber transition-colors duration-200 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Stay in the Groove</h3>
            <p className="text-neutral-gray text-sm mb-4">
              Get updates on new arrivals, events, and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-primary-cream text-primary-black border border-accent-teal/20 rounded-small focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-transparent text-sm"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-accent-teal text-primary-cream font-accent font-semibold text-sm py-2 px-4 rounded-small hover:bg-accent-amber transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-accent-teal/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-neutral-gray text-sm">
              © {new Date().getFullYear()} Spiral Groove Records. All rights reserved.
            </div>

            {/* Social links */}
            <div className="flex space-x-4">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-neutral-gray hover:text-accent-amber transition-colors duration-200"
                  aria-label={item.name}
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>

            {/* Legal links */}
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-neutral-gray hover:text-accent-amber transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-neutral-gray hover:text-accent-amber transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}