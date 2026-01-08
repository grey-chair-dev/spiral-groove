
import React from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';

interface AboutPageProps {
  viewMode: ViewMode;
}

export const AboutPage: React.FC<AboutPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';

  return (
    <div className="animate-in fade-in duration-500">
      <Section>
        <div className="max-w-4xl mx-auto">
           <div className="text-center mb-16">
              <span className={`inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-[0.2em] 
                 ${isRetro ? 'bg-brand-teal text-white border-2 border-brand-black shadow-pop-sm' : 'bg-black text-white rounded-full'}
              `}>
                  Est. 2020
              </span>
              <h1 className={`font-display text-5xl md:text-7xl mb-8 leading-[0.9] ${isRetro ? 'text-white' : 'text-black'}`}>
                 Keep It Spinning.
              </h1>
              <p className="text-xl md:text-2xl font-medium text-gray-500 max-w-2xl mx-auto leading-relaxed">
                 Spiral Groove is more than a shop. It's a community hub for music lovers in Milford, Ohio.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
              
              {/* Main Content */}
              <div className={`md:col-span-7 space-y-6 text-lg leading-relaxed font-medium ${isRetro ? 'text-white/80' : 'text-gray-700'}`}>
                 <p className="first-letter:text-5xl first-letter:font-display first-letter:float-left first-letter:mr-3 first-letter:mt-[-6px]">
                    The shop didn't start as <em>Spiral Groove</em>. It was originally a local record store called <strong>Earworm Records</strong>. Around <strong>2020, Adam and Trisha Mitzel took over the business and rebranded it as Spiral Groove Records</strong>. That change didn't just swap the sign outside – it repositioned the store with a renewed focus on community, vinyl culture, and in-person music experience.
                 </p>
                 <p>
                    <strong>Adam Mitzel</strong> is the owner most associated with the shop today. He moved Spiral Groove to its current Main Street location in 2021. Adam grew up in the region and has strong roots in music culture—he was into punk rock and local music scenes long before opening the store. His personal favorites show up in the store's personality, but the inventory is broad on purpose.
                 </p>
                 <p>
                    We're not just retail—we're a cultural hub. With <strong>thousands of records spanning decades and genres</strong>, plus tapes, CDs, and audio gear, we stock physical media at the heart of everything. The shop is active with in-store live music and events, including local bands, DJs, and Record Store Day celebrations.
                 </p>
                 <p>
                    The goal isn't just sales. It's to <strong>cherish the experience of physical music</strong> in a world dominated by streaming. We're a gateway for discovery, a community anchor in downtown Milford, and a cultural node where live shows, music talk, and old-school browsing create something you can't replicate online.
                 </p>
              </div>

              {/* Sidebar / Image */}
              <div className="md:col-span-5 space-y-8">
                 <div className={`relative aspect-[3/4] ${isRetro ? 'border-2 border-brand-black p-2 bg-white shadow-retro' : 'rounded-2xl overflow-hidden'}`}>
                    <img 
                        src="https://images.unsplash.com/photo-1533230504859-7b3b0cb5496d?q=80&w=1000&auto=format&fit=crop" 
                        alt="Store interior" 
                        className="w-full h-full object-cover grayscale-[20%]" 
                    />
                    {isRetro && <div className="absolute -bottom-4 -right-4 bg-brand-orange text-brand-black px-4 py-2 border-2 border-brand-black font-bold uppercase text-xs transform rotate-3">The Original Shop</div>}
                 </div>
                 
                 <div className="text-center">
                    <h4 className="font-display text-xl mb-2">Adam Mitzel</h4>
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Owner</p>
                 </div>
              </div>

           </div>
        </div>
      </Section>
    </div>
  );
};
