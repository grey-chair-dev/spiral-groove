import { Facebook, Instagram } from "lucide-react";
import BusinessHours from "./BusinessHours";

export default function Footer() {
  return (
        <footer className="border-t border-neutral-200 mt-16">
          <div className="section text-sm text-neutral-600">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Store Info</h3>
                    <div className="space-y-1">
                      <p>215B Main St</p>
                      <p>Milford, OH 45150</p>
                      <a href="tel:+15136008018" className="mt-2 text-text-dark hover:text-accent-amber transition-colors">(513) 600-8018</a>
                      <BusinessHours variant="compact" showStatus={true} className="mt-2" />
                    </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Shop</h3>
                <ul className="space-y-1">
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/shop">All Vinyl</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/shop/new-arrivals">New Arrivals</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/shop?filter=used">Used Records</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/shop?category=equipment">Turntables & Equipment</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/shop?category=crafts">Vinyl Crafts</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Events</h3>
                <ul className="space-y-1">
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/events">Upcoming Shows</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/events/book">Book the Space</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/events/past">Past Performances</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <ul className="space-y-1">
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/about">Our Story</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/about#team">Meet the Team</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/about#history">Store History</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/about#mission">Mission & Values</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Community</h3>
                <ul className="space-y-1">
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/community/staff-picks">Staff Picks</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/community/record-of-month">Record of the Month</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/blog">Blog / News</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/community/partnerships">Partnerships</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <ul className="space-y-1">
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/contact">Visit Us</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/contact/buy-records">We Buy Records</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/contact/events">Event Inquiries</a></li>
                  <li><a className="text-text-dark hover:text-accent-teal transition-colors" href="/contact/general">General Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div>
                  <h3 className="font-semibold mb-2">Follow Us</h3>
                  <div className="flex gap-4">
                    <a 
                      className="text-text-dark hover:text-accent-teal transition-colors p-2 hover:bg-neutral-100 rounded-full" 
                      href="https://www.instagram.com/spiral_groove_records_/?hl=en" 
                      target="_blank" 
                      rel="noopener"
                      aria-label="Follow us on Instagram"
                    >
                      <Instagram size={20} />
                    </a>
                    <a 
                      className="text-text-dark hover:text-accent-teal transition-colors p-2 hover:bg-neutral-100 rounded-full" 
                      href="https://www.facebook.com/spiralgrooverecords/" 
                      target="_blank" 
                      rel="noopener"
                      aria-label="Follow us on Facebook"
                    >
                      <Facebook size={20} />
                    </a>
                    <a 
                      className="text-text-dark hover:text-accent-teal transition-colors p-2 hover:bg-neutral-100 rounded-full flex items-center justify-center" 
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
                  <h3 className="font-semibold mb-2">Stay in the Groove</h3>
                  <p className="mb-4 text-neutral-600 text-sm">Get notified about new arrivals, exclusive events, and special offers. Join 2,500+ music lovers in our community.</p>
                  <form className="flex flex-col sm:flex-row gap-3">
                    <input 
                      className="flex-1 rounded-medium px-4 py-4 text-text-dark placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-teal border border-neutral-300 text-base" 
                      placeholder="Enter your email address" 
                      type="email"
                    />
                    <button className="btn px-8 py-4 whitespace-nowrap text-base font-semibold">
                      Subscribe
                    </button>
                  </form>
                </div>
                <div className="text-center md:text-right">
                  <p>&copy; 2025 Spiral Groove Records. Milford, OH</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
  );
}
