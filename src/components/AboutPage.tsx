
import React from 'react';
import { ViewMode } from '../../types';
import { Section } from './ui/Section';

interface AboutPageProps {
  viewMode: ViewMode;
}

export const AboutPage: React.FC<AboutPageProps> = ({ viewMode }) => {
  const isRetro = viewMode === 'retro';

  const galleryImages: Array<{ src: string; alt: string }> = [
    {
      src: '/images/IMG_2500.jpeg',
      alt: 'Inside Spiral Groove Records — rows of vinyl bins',
    },
    {
      src: '/images/IMG_2493.jpeg',
      alt: 'Spiral Groove Records — mural wall inside the shop',
    },
    {
      src: '/images/IMG_2496.jpeg',
      alt: 'Spiral Groove Records — album-lined walls and lounge area',
    },
    {
      src: '/images/IMG_2492.jpeg',
      alt: 'Spiral Groove Records storefront — entrance on Main Street',
    },
  ];

  const ownerImages: Array<{ src: string; alt: string }> = [
    {
      src: '/images/IMG_9247.jpeg',
      alt: 'Store owner photo',
    },
    {
      src: '/images/IMG_9246.jpeg',
      alt: 'Store owner with the community',
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <Section>
        <div className="max-w-4xl mx-auto">
           <div className="text-center mb-16">
              <span className={`inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-[0.2em] 
                 ${isRetro ? 'bg-brand-teal text-white border-2 border-brand-black shadow-pop-sm' : 'bg-black text-white rounded-full'}
              `}>
                  Established 2020
              </span>
              <h1 className={`font-display text-5xl md:text-7xl mb-8 leading-[0.9] ${isRetro ? 'text-brand-black' : 'text-black'}`}>
                 Keep It Spinning.
              </h1>
              <p className="text-xl md:text-2xl font-medium text-gray-500 max-w-2xl mx-auto leading-relaxed">
                 Spiral Groove is more than a shop. It's a community hub for music lovers in Milford, Ohio.
              </p>
           </div>

           <div className="grid grid-cols-1">
              
              {/* Main Content */}
              <div className="space-y-6 text-lg leading-relaxed text-gray-700 font-medium">
                 <p className="first-letter:text-5xl first-letter:font-display first-letter:float-left first-letter:mr-3 first-letter:mt-[-6px]">
                    Around <strong>2020, the shop was rebranded as Spiral Groove Records</strong>. That change didn't just swap the sign outside – it repositioned the store with a renewed focus on community, vinyl culture, and in-person music experience.
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

           </div>

           {/* Owner Photos */}
           <div className="mt-16">
              <div className="text-center mb-10">
                <span className={`inline-block px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-[0.2em] 
                  ${isRetro ? 'bg-brand-orange text-brand-black border-2 border-brand-black shadow-pop-sm' : 'bg-gray-100 text-gray-900 rounded-full'}
                `}>
                  Owner
                </span>
                <h3 className={`font-display text-3xl md:text-4xl leading-tight ${isRetro ? 'text-brand-black' : 'text-black'}`}>
                  The face behind the shop.
                </h3>
              </div>

              {/* Wall: polaroids pinned with tape */}
              <div className="rounded-2xl bg-stone-200/80 p-6 md:p-10 border-2 border-stone-300/80 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 justify-items-center">
                  {ownerImages.map((img, idx) => {
                    const isCommunityPhoto = img.src === '/images/IMG_9246.jpeg';
                    const tilts = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1'];
                    const tilt = tilts[idx % tilts.length];
                    return (
                      <figure
                        key={img.src}
                        className={`group relative w-full pt-3 px-3 pb-10 bg-white border-2 border-brand-black
                          ${isCommunityPhoto ? 'max-w-sm md:max-w-[340px]' : 'max-w-sm'}
                          ${tilt} hover:rotate-0 transition-transform duration-300
                          shadow-[0_4px_20px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)]
                          hover:shadow-[0_12px_40px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.12)]
                        `}
                      >
                        {/* Tape strips */}
                        <div className="absolute -top-0.5 left-6 w-14 h-5 bg-white/75 -rotate-45 shadow-sm border border-white/50 z-10" aria-hidden />
                        <div className="absolute -top-0.5 right-6 w-14 h-5 bg-white/75 rotate-45 shadow-sm border border-white/50 z-10" aria-hidden />
                        <div className={`overflow-hidden ${isCommunityPhoto ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
                          <img
                            src={img.src}
                            alt={img.alt}
                            className={`w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.02]
                              ${isRetro ? 'grayscale-[10%]' : ''}
                              ${isCommunityPhoto ? 'object-contain' : 'object-cover group-hover:scale-[1.03]'}
                            `}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </figure>
                    );
                  })}
                </div>
              </div>
                 
              <div className={`mt-6 text-center text-sm font-medium ${isRetro ? 'text-brand-black/70' : 'text-gray-500'}`}>
                Want to sell a collection? <button className="underline hover:opacity-70" onClick={() => (window.location.href = '/contact')}>Contact us</button>.
              </div>
                 </div>

           {/* Photo Gallery */}
           <div className="mt-20">
              <div className="text-center mb-10">
                <span className={`inline-block px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-[0.2em] 
                  ${isRetro ? 'bg-brand-mustard text-brand-black border-2 border-brand-black shadow-pop-sm' : 'bg-gray-100 text-gray-900 rounded-full'}
                `}>
                  Inside Spiral Groove
                </span>
                <h3 className={`font-display text-3xl md:text-4xl leading-tight ${isRetro ? 'text-brand-black' : 'text-black'}`}>
                  A few snapshots from the shop.
                </h3>
              </div>

              {/* Wall: polaroids pinned with tape */}
              <div className="rounded-2xl bg-stone-200/80 p-6 md:p-10 border-2 border-stone-300/80 shadow-inner">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 justify-items-center">
                  {galleryImages.map((img, idx) => {
                    const isFeatured = idx === 0;
                    const isMural = img.src === '/images/IMG_2493.jpeg';
                    const tilts = ['rotate-[-2deg]', 'rotate-[1.5deg]', 'rotate-[2deg]', '-rotate-1'];
                    const tilt = tilts[idx % tilts.length];
                    return (
                      <figure
                        key={img.src}
                        className={`group relative w-full max-w-sm pt-3 px-3 pb-10 bg-white border-2 border-brand-black
                          ${isFeatured ? 'sm:col-span-2 lg:col-span-2 sm:max-w-md lg:max-w-lg' : ''}
                          ${tilt} hover:rotate-0 transition-transform duration-300
                          shadow-[0_4px_20px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)]
                          hover:shadow-[0_12px_40px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.12)]
                        `}
                      >
                        {/* Tape strips */}
                        <div className="absolute -top-0.5 left-6 w-14 h-5 bg-white/75 -rotate-45 shadow-sm border border-white/50 z-10" aria-hidden />
                        <div className="absolute -top-0.5 right-6 w-14 h-5 bg-white/75 rotate-45 shadow-sm border border-white/50 z-10" aria-hidden />
                        <div className={`relative overflow-hidden ${isFeatured ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                          <img
                            src={img.src}
                            alt={img.alt}
                            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]
                              ${isRetro ? 'grayscale-[15%] contrast-[1.05]' : 'saturate-[1.08] contrast-[1.05]'}
                              ${isMural ? 'object-[center_25%]' : ''}
                            `}
                            loading="lazy"
                            decoding="async"
                          />
                          {isMural && (
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0" />
                          )}
                        </div>
                      </figure>
                    );
                  })}
                </div>
              </div>
           </div>
        </div>
      </Section>
    </div>
  );
};
