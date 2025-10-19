"use client";

import { ShoppingCart, Search, Menu, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import CartDrawer from "./cart/CartDrawer";
import { useEffect, useState } from "react";

export default function Header() {
  const toggleCart = useStore((s) => s.toggleCart);
  const cartItems = useStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const cartCount = mounted ? cartItems.reduce((sum, item) => sum + item.qty, 0) : 0;
  
  return (
    <header className="sticky top-0 z-50 bg-primary-black text-text-light">
      {/* We Buy Records Banner */}
      <div className="bg-accent-teal text-text-dark text-center py-1 text-xs font-medium">
        <Link href="/contact/buy-records" className="hover:text-accent-amber transition-colors">
          We Buy Records - Get Cash for Your Vinyl Collection
        </Link>
      </div>
      
      {/* Top section with logo, search, and cart */}
      <div className="container h-20 flex items-center gap-4">
        <Link href="/" className="flex items-center p-2">
          <Image 
            src="/logo.png" 
            alt="Spiral Groove Records" 
            width={240} 
            height={80} 
            className="h-20 w-auto"
          />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <input className="border border-neutral-300 rounded h-9 pl-9 pr-3 text-sm w-80 lg:w-[28rem] text-black"
              placeholder="Search records, artists, genres" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          </div>
          <button className="text-white p-2 relative" onClick={toggleCart}>
            <ShoppingCart size={20} />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button className="text-white p-2 relative">
            <User size={20} />
          </button>
        </div>
      </div>
      
      {/* Bottom section with navigation menu - constrained to logo/search boundaries */}
      <div className="bg-primary-cream border-t border-neutral-200">
        <div className="container h-12 flex items-center">
          <button className="lg:hidden btn-secondary mr-4" aria-label="Open navigation">
            <Menu size={18} />
          </button>
          {/* Navigation constrained to match logo and search bar width */}
          <div className="flex-1 flex justify-center">
            <nav className="flex items-center gap-6 text-sm max-w-4xl">
                {/* SHOP - Dropdown */}
                <div className="relative group">
                  <Link href="/shop" className="text-text-dark hover:text-accent-amber font-accent font-bold uppercase transition-150 flex items-center gap-1">
                    Shop
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-primary-cream border border-neutral-200 rounded-large shadow-modal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link href="/shop" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">All Vinyl</Link>
                      <Link href="/shop/new-arrivals" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">New Arrivals</Link>
                      <Link href="/shop?filter=used" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">Used Records</Link>
                      <Link href="/shop?category=equipment" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">Turntables & Equipment</Link>
                      <Link href="/shop?category=crafts" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">Vinyl Crafts</Link>
                    </div>
                  </div>
                </div>
                
                {/* EVENTS - Dropdown */}
                <div className="relative group">
                  <Link href="/events" className="text-text-dark hover:text-accent-amber font-accent font-bold uppercase transition-150 flex items-center gap-1">
                    Events
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-primary-cream border border-neutral-200 rounded-large shadow-modal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link href="/events" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">Upcoming Shows</Link>
                      <Link href="/events/book" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">Book the Space</Link>
                      <Link href="/events/past" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">Past Performances</Link>
                    </div>
                  </div>
                </div>
                
                {/* COMMUNITY - Dropdown */}
                <div className="relative group">
                  <Link href="/community/staff-picks" className="text-text-dark hover:text-accent-amber font-accent font-bold uppercase transition-150 flex items-center gap-1">
                    Community
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-primary-cream border border-neutral-200 rounded-large shadow-modal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link href="/community/staff-picks" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">Staff Picks</Link>
                      <Link href="/community/record-of-month" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">Record of the Month</Link>
                      <Link href="/blog" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">Blog / News</Link>
                      <Link href="/community/partnerships" className="block px-4 py-2 text-sm text-text-dark hover:bg-accent-teal hover:text-text-light transition-150">Partnerships</Link>
                    </div>
                  </div>
                </div>
                
                {/* ABOUT - Simple Link */}
                <Link href="/about" className="text-text-dark hover:text-accent-amber font-accent font-bold uppercase transition-150">
                  About
                </Link>
                
                    {/* CONTACT - Simple Link */}
                    <Link href="/contact" className="text-text-dark hover:text-accent-amber font-accent font-bold uppercase transition-150">
                      Contact
                    </Link>
            </nav>
          </div>
        </div>
      </div>
      
      <CartDrawer />
    </header>
  );
}

