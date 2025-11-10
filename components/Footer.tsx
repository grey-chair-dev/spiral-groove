"use client";
import { Facebook, Instagram } from "lucide-react";
import BusinessHours from "./BusinessHours";
import { trackNewsletterSignup } from "@/lib/analytics";

export default function Footer() {
  return (
        <footer className="relative mt-16 bg-gradient-to-br from-accent-blue to-accent-blue/80 overflow-hidden">
          {/* Cloud shapes at top */}
          <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
              <path d="M0,50 Q150,20 300,50 T600,50 T900,50 T1200,50 L1200,100 L0,100 Z" fill="#F5EBDD" opacity="0.3" />
              <path d="M0,60 Q200,30 400,60 T800,60 T1200,60 L1200,100 L0,100 Z" fill="#F5EBDD" opacity="0.2" />
            </svg>
          </div>
          
                  <div className="section text-sm text-text-light relative z-10 pt-12 sm:pt-20 px-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-text-light">Visit Us</h3>
                    <div className="space-y-1 text-text-light/90">
                      <p>215B Main St</p>
                      <p>Milford, OH 45150</p>
                      <a href="tel:+15136008018" className="mt-2 text-text-light hover:text-secondary-yellow transition-colors">(513) 600-8018</a>
                      <p className="mt-2 text-sm italic">Open 12–9 PM daily</p>
                    </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-text-light">Shop</h3>
                <ul className="space-y-1">
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/shop">All Vinyl</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/shop/new-arrivals">New Arrivals</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/shop?filter=used">Used Records</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/shop?category=equipment">Turntables & Equipment</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/shop?category=crafts">Vinyl Crafts</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-text-light">Events</h3>
                <ul className="space-y-1">
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/events">Upcoming Shows</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/events/book">Book the Space</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/events/past">Past Performances</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-text-light">About</h3>
                <ul className="space-y-1">
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/about">Our Story</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/about#team">Meet the Team</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/about#history">Store History</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/about#mission">Mission & Values</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-text-light">Community</h3>
                <ul className="space-y-1">
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/community/staff-picks">Staff Picks</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/community/record-of-month">Record of the Month</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/blog">Blog / News</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/community/partnerships">Partnerships</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-text-light">Contact</h3>
                <ul className="space-y-1">
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/contact">Visit Us</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/contact/buy-records">We Buy Records</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/contact/events">Event Inquiries</a></li>
                  <li><a className="text-text-light/80 hover:text-secondary-yellow transition-colors" href="/contact/general">General Contact</a></li>
                </ul>
              </div>
            </div>
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-text-light/30">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center">
                <div>
                  <h3 className="groovy-text text-2xl mb-4 text-secondary-yellow">Good Vibes Only</h3>
                  <div className="flex gap-3 mb-4">
                    {/* Peace Sign Icons */}
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="animate-bob">
                      <circle cx="15" cy="15" r="12" stroke="#CBAE88" strokeWidth="2" fill="none" />
                      <path d="M15 5 L15 15 M10 10 L15 15 L20 10" stroke="#CBAE88" strokeWidth="2" fill="none" />
                    </svg>
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="animate-bob" style={{ animationDelay: '0.5s' }}>
                      <circle cx="15" cy="15" r="12" stroke="#CBAE88" strokeWidth="2" fill="none" />
                      <path d="M15 5 L15 15 M10 10 L15 15 L20 10" stroke="#CBAE88" strokeWidth="2" fill="none" />
                    </svg>
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="animate-bob" style={{ animationDelay: '1s' }}>
                      <circle cx="15" cy="15" r="12" stroke="#CBAE88" strokeWidth="2" fill="none" />
                      <path d="M15 5 L15 15 M10 10 L15 15 L20 10" stroke="#CBAE88" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2 text-text-light">Follow Us</h3>
                  <div className="flex gap-4">
                    <a 
                      className="text-text-light hover:text-secondary-yellow transition-colors p-2 hover:bg-primary-orange/30 rounded-full" 
                      href="https://www.instagram.com/spiral_groove_records_/?hl=en" 
                      target="_blank" 
                      rel="noopener"
                      aria-label="Follow us on Instagram"
                    >
                      <Instagram size={20} />
                    </a>
                    <a 
                      className="text-text-light hover:text-secondary-yellow transition-colors p-2 hover:bg-primary-orange/30 rounded-full" 
                      href="https://www.facebook.com/spiralgrooverecords/" 
                      target="_blank" 
                      rel="noopener"
                      aria-label="Follow us on Facebook"
                    >
                      <Facebook size={20} />
                    </a>
                    <a 
                      className="text-text-light hover:text-secondary-yellow transition-colors p-2 hover:bg-primary-orange/30 rounded-full flex items-center justify-center" 
                      href="https://www.tiktok.com/@spiral_groove?fbclid=PAZXh0bgNhZW0CMTEAAaduy3-KtSqx3UwFU2ESnixHavN7XuFShoj07v3pE-C2gp4ibpFwGk9Yu9YCRA_aem_QXq8RGKWwRskSyritKVfdA" 
                      target="_blank" 
                      rel="noopener"
                      aria-label="Follow us on TikTok"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="groovy-text text-2xl mb-2 text-secondary-yellow">Stay in the Groove</h3>
                  <p className="mb-4 text-text-light/90 text-sm">No spam, just vibes — new arrivals and event invites only.</p>
                          <form 
                            className="flex flex-col sm:flex-row gap-3"
                            onSubmit={(e) => {
                              e.preventDefault();
                              trackNewsletterSignup();
                              // Form submission logic would go here
                            }}
                          >
                    <input 
                              className="flex-1 rounded-medium px-4 py-3 sm:py-4 text-text-dark placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-teal border border-neutral-300 text-sm sm:text-base" 
                      placeholder="Enter your email address" 
                      type="email"
                              required
                    />
                            <button 
                              type="submit"
                              className="btn px-6 sm:px-8 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base font-semibold"
                            >
                      Subscribe
                    </button>
                  </form>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-text-light/80">&copy; 2025 Spiral Groove Records. Milford, OH</p>
                  <p className="text-text-light/60 text-xs mt-2">Keep it sunny. ✌️</p>
                </div>
              </div>
            </div>
                    {/* Google Maps Embed */}
                    <div className="mt-8 pt-6 border-t-2 border-text-light/30">
                      <h3 className="groovy-text text-2xl mb-4 text-secondary-yellow">Find Us</h3>
                      <div className="w-full h-[300px] rounded-large overflow-hidden">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3057.540352!2d-84.293!3d39.175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDEwJzMwLjAiTiA4NMKwMTcnMzQuOCJX!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                          width="100%"
                          height="300"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Spiral Groove Records Location - 215B Main St, Milford, OH 45150"
                        />
                      </div>
                    </div>
          </div>
        </footer>
  );
}
