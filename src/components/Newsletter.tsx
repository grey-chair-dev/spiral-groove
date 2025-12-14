
import React from 'react';
import { Section } from './ui/Section';
import { Mail } from 'lucide-react';
import { Button } from './ui/Button';

export const Newsletter: React.FC = () => {
  return (
    <Section className="py-24 bg-brand-black border-y-2 border-brand-black relative overflow-hidden isolate">
      
      {/* Texture for Flyer/Zine feel */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay pointer-events-none"></div>

      {/* Abstract Architectural Shapes */}
      <div className="absolute top-0 right-0 w-[50%] h-full bg-brand-orange opacity-10 -skew-x-12 transform translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[30%] h-full bg-brand-teal opacity-5 skew-x-12 transform -translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-3xl mx-auto text-center relative z-10 px-4">
        
        <div className="flex justify-center mb-8">
           <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center border-4 border-brand-orange shadow-[4px_4px_0px_#FFFFFF] transform -rotate-3">
              <Mail className="text-brand-black" size={28} strokeWidth={2.5} />
           </div>
        </div>

        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-6 tracking-tight drop-shadow-md">
          Don't Miss a <span className="text-brand-orange">Beat.</span>
        </h2>
        <p className="text-gray-300 text-lg mb-10 font-medium max-w-lg mx-auto leading-relaxed">
          Join 15,000+ collectors. Get early access to limited pressings, staff picks, and exclusive events.
        </p>
        
        <form className="relative max-w-lg mx-auto group" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col sm:block relative">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="w-full h-14 bg-brand-cream border-2 border-white pl-6 pr-6 sm:pr-36 rounded-lg sm:rounded-full text-brand-black placeholder-brand-black/40 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 focus:ring-offset-black transition-all font-bold text-base mb-3 sm:mb-0 shadow-lg"
            />
            <div className="static sm:absolute sm:right-1.5 sm:top-1.5 sm:bottom-1.5">
               <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth={true}
                  className="h-14 sm:h-full rounded-lg sm:rounded-full shadow-none border-2 border-brand-black text-xs px-6 hover:scale-105 active:scale-95 sm:w-auto uppercase tracking-widest"
               >
                 Subscribe
               </Button>
            </div>
          </div>
        </form>
        
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 opacity-60">
           <span className="text-[10px] text-white uppercase tracking-widest font-bold flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-brand-teal rounded-full"></div> No Spam
           </span>
           <span className="text-[10px] text-white uppercase tracking-widest font-bold flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-brand-pink rounded-full"></div> Unsubscribe Anytime
           </span>
        </div>
      </div>
    </Section>
  );
};
