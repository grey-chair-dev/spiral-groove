'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  ChevronUp,
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Music,
  Calendar,
  Users,
  Headphones,
  BookOpen,
  MapPin
} from 'lucide-react';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const primaryNavItems = [
    { name: 'Shop', href: '/shop', icon: ShoppingCart },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'About', href: '/about', icon: Users },
    { name: 'Services', href: '/services', icon: Headphones },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Contact', href: '/contact', icon: MapPin },
  ];

  const secondaryNavItems = [
    { name: 'New Arrivals', href: '/new-arrivals', icon: Music },
    { name: 'Event Space', href: '/event-space', icon: Calendar },
    { name: 'We Buy Vinyl', href: '/we-buy-vinyl', icon: Headphones },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Places to Find Us', href: '/locations', icon: MapPin },
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook, color: 'hover:text-blue-400' },
    { name: 'Instagram', href: '#', icon: Instagram, color: 'hover:text-pink-400' },
    { name: 'Twitter', href: '#', icon: Twitter, color: 'hover:text-blue-300' },
    { name: 'YouTube', href: '#', icon: Youtube, color: 'hover:text-red-400' },
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setExpandedSections([]);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    setExpandedSections([]);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="md:hidden text-dark-300 hover:text-neon-cyan"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={closeMenu} />
          <div className="fixed top-0 right-0 h-full w-80 max-w-sm bg-dark-900 border-l border-dark-700 shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-dark-700">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-neon-pink to-neon-cyan shadow-neon-sm"></div>
                  <span className="text-lg font-bold text-dark-50 font-display">
                    Spiral Groove
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMenu}
                  className="text-dark-300 hover:text-neon-cyan"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                  {/* Quick Access */}
                  <div>
                    <h3 className="text-dark-50 font-semibold mb-3 text-sm uppercase tracking-wider">
                      Quick Access
                    </h3>
                    <div className="space-y-2">
                      <Link
                        href="/shop"
                        className="flex items-center space-x-3 p-3 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors duration-200"
                        onClick={closeMenu}
                      >
                        <ShoppingCart className="h-5 w-5 text-neon-cyan" />
                        <span className="text-dark-50 font-medium">Shop</span>
                      </Link>
                      <Link
                        href="/contact"
                        className="flex items-center space-x-3 p-3 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors duration-200"
                        onClick={closeMenu}
                      >
                        <MapPin className="h-5 w-5 text-neon-pink" />
                        <span className="text-dark-50 font-medium">Contact</span>
                      </Link>
                    </div>
                  </div>

                  {/* Primary Navigation */}
                  <div>
                    <button
                      onClick={() => toggleSection('primary')}
                      className="flex items-center justify-between w-full text-dark-50 font-semibold mb-3 text-sm uppercase tracking-wider"
                    >
                      Main Menu
                      {expandedSections.includes('primary') ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections.includes('primary') && (
                      <div className="space-y-1">
                        {primaryNavItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center space-x-3 p-2 rounded-lg text-dark-300 hover:text-neon-cyan hover:bg-dark-800 transition-colors duration-200"
                              onClick={closeMenu}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Secondary Navigation */}
                  <div>
                    <button
                      onClick={() => toggleSection('secondary')}
                      className="flex items-center justify-between w-full text-dark-50 font-semibold mb-3 text-sm uppercase tracking-wider"
                    >
                      Explore
                      {expandedSections.includes('secondary') ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections.includes('secondary') && (
                      <div className="space-y-1">
                        {secondaryNavItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center space-x-3 p-2 rounded-lg text-dark-300 hover:text-neon-cyan hover:bg-dark-800 transition-colors duration-200"
                              onClick={closeMenu}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Social Media */}
                  <div>
                    <h3 className="text-dark-50 font-semibold mb-3 text-sm uppercase tracking-wider">
                      Follow Us
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {socialLinks.map((social) => {
                        const Icon = social.icon;
                        return (
                          <Link
                            key={social.name}
                            href={social.href}
                            className={`flex items-center space-x-2 p-3 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors duration-200 text-dark-300 ${social.color}`}
                            onClick={closeMenu}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{social.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-dark-700 space-y-3">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="flex-1 text-dark-300 hover:text-neon-cyan">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-dark-300 hover:text-neon-cyan">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                  </Button>
                </div>
                <Button variant="neon" size="sm" className="w-full">
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
