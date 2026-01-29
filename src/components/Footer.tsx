
import React, { useState } from 'react';
import { Disc, Instagram, Twitter, Facebook, ArrowUpRight, ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ViewMode, Page } from '../../types';
import { trackNewsletterSignup } from '../utils/analytics';
import { siteConfig } from '../config';

// TikTok icon SVG (lucide-react doesn't have TikTok icon)
const TikTokIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

interface FooterProps {
    viewMode: ViewMode;
    onNavigate: (page: Page, filter?: string) => void;
}

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Subscribed!' });
        setEmail('');
        // Track newsletter signup
        trackNewsletterSignup('footer');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to subscribe' });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <form className="relative group" onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email" 
          disabled={isSubmitting}
          required
          className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange focus:bg-white/10 transition-colors disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={isSubmitting}
          className="absolute right-1 top-1 bottom-1 px-3 bg-brand-orange text-brand-black font-bold uppercase text-[10px] tracking-wider hover:bg-brand-mustard transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '...' : 'Join'}
        </button>
      </form>
      
      {/* Message Display */}
      {message && (
        <div className={`mt-2 flex items-center gap-2 text-xs font-medium
          ${message.type === 'success' ? 'text-brand-teal' : 'text-brand-red'}
        `}>
          {message.type === 'success' ? (
            <CheckCircle2 size={12} />
          ) : (
            <AlertCircle size={12} />
          )}
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-1 hover:opacity-70"
          >
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  );
};

export const Footer: React.FC<FooterProps> = ({ viewMode, onNavigate }) => {
  const hrefFor = (page: Page, filter?: string) => {
    if (page === 'home') return '/';
    if (page === 'catalog') {
      const f = (filter || '').trim();
      return f && f !== 'All' ? `/catalog/${encodeURIComponent(f)}` : '/catalog';
    }
    if (page === 'search') return '/search';
    if (page === 'order-status') return '/order-status';
    return `/${page}`;
  };

  return (
    <footer className="bg-brand-black pt-20 pb-12 border-t-4 border-brand-red relative overflow-hidden text-brand-cream">
      
      {/* Retro Grid Overlay (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 mb-12 md:mb-20">
          
          {/* Brand Column (Span 4) */}
          <div className="lg:col-span-4 pr-0 lg:pr-8">
            <a href={hrefFor('home')} onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="flex items-center gap-3 mb-6 group w-fit">
               <div className="flex flex-col">
                  <img 
                    src="/logo-white.png" 
                    alt="Spiral Groove Records" 
                    className="h-10 md:h-12 w-auto transform group-hover:scale-[1.02] transition-transform object-contain"
                  />
                  <span className="text-[9px] font-bold text-brand-red tracking-[0.3em] uppercase ml-0.5 mt-1">Records</span>
               </div>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-medium">
              Your neighborhood destination for curated vinyl, hi-fi gear, and music culture. Keeping the analog spirit alive in Milford since 2020.
            </p>
          </div>

          {/* Shop Column (Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="font-display text-xl mb-6 text-brand-orange drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Shop</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'New Releases', page: 'catalog', filter: 'New Arrivals' },
                { label: 'All Vinyl', page: 'catalog', filter: 'Vinyl' },
                { label: 'Equipment', page: 'catalog', filter: 'Equipment' },
                { label: 'Merch', page: 'catalog', filter: 'Merch' },
                { label: 'Staff Picks', page: 'staff-picks' },
              ].map((item) => (
                <li key={item.label}>
                  <a 
                    href={hrefFor(item.page as Page, item.filter)}
                    onClick={(e) => { 
                        e.preventDefault(); 
                        if (item.page === 'catalog') onNavigate('catalog', item.filter);
                        else onNavigate(item.page as Page);
                    }}
                    className="group flex items-center text-sm font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Column (Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="font-display text-xl mb-6 text-brand-orange drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Explore</h4>
            <ul className="flex flex-col gap-3">
              {[
                  { label: 'Events', page: 'events' }, 
                  { label: 'Locations', page: 'locations' },
                  { label: 'We Buy Records', page: 'we-buy' },
                  { label: 'Our Story', page: 'about' },
                  { label: 'Order Status', page: 'order-status' }
              ].map((item) => (
                <li key={item.label}>
                  <a 
                    href={hrefFor(item.page as Page)}
                    onClick={(e) => { e.preventDefault(); onNavigate(item.page as Page); }}
                    className="group flex items-center text-sm font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Combined "Stay in the Groove" & "Vibe With Us" Column (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-10 lg:pl-12 lg:border-l border-white/10">
            
            {/* Email Capture */}
            <div className="relative">
               <h4 className="font-display text-xl mb-3 text-white">Stay in the Groove</h4>
               <p className="text-gray-400 text-xs font-medium mb-4">Join the community. No spam, just jams.</p>
               <NewsletterForm />
            </div>

            {/* Separated Vibe With Us Section */}
            <div>
              <h4 className="font-display text-xl mb-4 text-brand-orange drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Vibe With Us</h4>
              
              <div className="flex items-center gap-4 mb-6">
                {siteConfig.social.instagram && (
                  <a 
                    href={siteConfig.social.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-brand-pink hover:border-brand-pink hover:bg-brand-pink/10 transition-all hover:scale-110"
                    aria-label="Follow us on Instagram"
                  >
                  <Instagram size={18} />
                </a>
                )}
                {siteConfig.social.tiktok && (
                  <a 
                    href={siteConfig.social.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-brand-orange hover:border-brand-orange hover:bg-brand-orange/10 transition-all hover:scale-110"
                    aria-label="Follow us on TikTok"
                  >
                    <TikTokIcon size={18} />
                </a>
                )}
                {siteConfig.social.facebook && (
                  <a 
                    href={siteConfig.social.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-brand-blue hover:border-brand-blue hover:bg-brand-blue/10 transition-all hover:scale-110"
                    aria-label="Follow us on Facebook"
                  >
                  <Facebook size={18} />
                </a>
                )}
              </div>
              
              <div className="flex items-start gap-3 group cursor-pointer" onClick={() => onNavigate('locations')}>
                  <div className="p-2 bg-white/5 rounded border border-white/10 group-hover:border-brand-orange/50 transition-colors">
                    <ArrowUpRight size={16} className="text-brand-orange" />
                  </div>
                  <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Find The Shop</p>
                      <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">215B Main Street, Milford, OH 45150</span>
                  </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">© {new Date().getFullYear()} Spiral Groove Records.</p>
          <div className="flex gap-6">
             <a 
               href="/privacy" 
               onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }}
               className="text-xs font-bold text-gray-600 uppercase tracking-widest hover:text-brand-orange transition-colors"
             >
               Privacy
             </a>
             <a 
               href="/terms" 
               onClick={(e) => { e.preventDefault(); onNavigate('terms'); }}
               className="text-xs font-bold text-gray-600 uppercase tracking-widest hover:text-brand-orange transition-colors"
             >
               Terms
             </a>
             <a 
               href="/accessibility" 
               onClick={(e) => { e.preventDefault(); onNavigate('accessibility'); }}
               className="text-xs font-bold text-gray-600 uppercase tracking-widest hover:text-brand-orange transition-colors"
             >
               Accessibility
             </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
