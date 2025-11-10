"use client";

import { ShoppingCart, Search, Menu, User } from "lucide-react";
import Link from "next/link";
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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary-orange to-supporting-red text-text-light shadow-lg">
      {/* We Buy Records Banner */}
      <div className="bg-secondary-yellow text-contrast-navy text-center py-2 text-sm font-bold">
        <Link href="/contact/buy-records" className="hover:text-primary-orange transition-colors">
          ✨ We Buy Records - Get Cash for Your Vinyl Collection ✨
        </Link>
      </div>
      
      {/* Top section with logo, search, and cart */}
      <div className="container h-16 sm:h-20 flex items-center gap-2 sm:gap-4 px-4">
        <Link href="/" className="flex items-center p-1 sm:p-2 hover:opacity-90 transition-opacity flex-shrink-0">
          <span className="groovy-text text-xl sm:text-2xl md:text-3xl lg:text-4xl text-secondary-yellow drop-shadow-lg leading-tight">
            Spiral Groove Records
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="relative hidden sm:block">
            <input className="border-2 border-secondary-yellow rounded-full h-10 pl-10 pr-4 text-sm w-48 md:w-80 lg:w-[28rem] text-contrast-navy bg-background-cream placeholder:text-contrast-navy/60 focus:outline-none focus:ring-2 focus:ring-secondary-yellow"
              placeholder="Search records, artists, genres" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-orange" size={16} />
          </div>
          <button 
            className="text-white p-2 relative" 
            onClick={toggleCart}
            aria-label={`Shopping cart${mounted && cartCount > 0 ? ` with ${cartCount} item${cartCount > 1 ? 's' : ''}` : ''}`}
          >
            <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            className="text-white p-2 relative hidden sm:block"
            aria-label="User account"
          >
            <User size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button 
            className="text-white p-2 relative sm:hidden"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </div>
      </div>
      
      {/* Bottom section with navigation menu - constrained to logo/search boundaries */}
      <div className="bg-background-cream border-t-2 border-secondary-yellow/50">
        <div className="container h-auto sm:h-14 flex flex-col sm:flex-row items-stretch sm:items-center px-4">
          <button className="sm:hidden btn-secondary py-2 my-2 w-full justify-center" aria-label="Open navigation">
            <Menu size={18} className="mr-2" />
            <span>Menu</span>
          </button>
          {/* Navigation constrained to match logo and search bar width */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden sm:flex items-center gap-4 md:gap-6 text-sm max-w-4xl">
                {/* SHOP - Dropdown */}
                <div className="relative group">
                  <Link href="/shop" className="text-contrast-navy hover:text-primary-orange font-groovy text-lg transition-150 flex items-center gap-1">
                    Shop
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-background-cream border-2 border-primary-orange rounded-2xl shadow-modal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link href="/shop" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">All Vinyl</Link>
                      <Link href="/catalog" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">Full Catalog</Link>
                      <Link href="/shop/new-arrivals" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">New Arrivals</Link>
                      <Link href="/shop?filter=used" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">Used Records</Link>
                      <Link href="/shop?category=equipment" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">Turntables & Equipment</Link>
                      <Link href="/shop?category=crafts" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">Vinyl Crafts</Link>
                    </div>
                  </div>
                </div>
                
                {/* EVENTS - Dropdown */}
                <div className="relative group">
                  <Link href="/events" className="text-contrast-navy hover:text-primary-orange font-groovy text-lg transition-150 flex items-center gap-1">
                    Events
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-background-cream border-2 border-primary-orange rounded-2xl shadow-modal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link href="/events" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">Upcoming Shows</Link>
                      <Link href="/events/book" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">Book the Space</Link>
                      <Link href="/events/past" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">Past Performances</Link>
                    </div>
                  </div>
                </div>
                
                {/* COMMUNITY - Dropdown */}
                <div className="relative group">
                  <Link href="/community/staff-picks" className="text-contrast-navy hover:text-primary-orange font-groovy text-lg transition-150 flex items-center gap-1">
                    Community
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-background-cream border-2 border-primary-orange rounded-2xl shadow-modal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link href="/community/staff-picks" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">Staff Picks</Link>
                      <Link href="/community/record-of-month" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">Record of the Month</Link>
                      <Link href="/blog" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">Blog / News</Link>
                      <Link href="/community/partnerships" className="block px-4 py-2 text-sm text-contrast-navy hover:bg-primary-orange hover:text-text-light transition-150 rounded-lg mx-2">Partnerships</Link>
                    </div>
                  </div>
                </div>
                
                {/* ABOUT - Simple Link */}
                <Link href="/about" className="text-contrast-navy hover:text-primary-orange font-groovy text-lg transition-150">
                  About
                </Link>
                
                    {/* CONTACT - Simple Link */}
                    <Link href="/contact" className="text-contrast-navy hover:text-primary-orange font-groovy text-lg transition-150">
                      Contact
                    </Link>
            </nav>
            {/* Mobile navigation - simple stacked links */}
            <nav className="sm:hidden flex flex-col gap-2 py-2 w-full">
              <Link href="/shop" className="text-contrast-navy hover:text-primary-orange font-groovy text-base py-2 border-b border-secondary-yellow/30">Shop</Link>
              <Link href="/events" className="text-contrast-navy hover:text-primary-orange font-groovy text-base py-2 border-b border-secondary-yellow/30">Events</Link>
              <Link href="/about" className="text-contrast-navy hover:text-primary-orange font-groovy text-base py-2 border-b border-secondary-yellow/30">About</Link>
              <Link href="/contact" className="text-contrast-navy hover:text-primary-orange font-groovy text-base py-2">Contact</Link>
            </nav>
          </div>
        </div>
      </div>
      
      <CartDrawer />
    </header>
  );
}

