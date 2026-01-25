
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

           <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
              
              {/* Main Content */}
              <div className="md:col-span-7 space-y-6 text-lg leading-relaxed text-gray-700 font-medium">
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
                        src="/images/IMG_2490.jpeg" 
                        alt="Spiral Groove Records storefront with neon record sign" 
                        className={`w-full h-full object-cover ${isRetro ? 'grayscale-[20%]' : ''}`}
                        loading="lazy"
                        decoding="async"
                    />
                    {isRetro && <div className="absolute -bottom-4 -right-4 bg-brand-orange text-brand-black px-4 py-2 border-2 border-brand-black font-bold uppercase text-xs transform rotate-3">Our Fearless Leader</div>}
                 </div>
                 
                 <div className="text-center">
                    <h4 className="font-display text-xl mb-2">Adam Mitzel</h4>
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Owner</p>
                 </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => {
                  const isFeatured = idx === 0;
                  const isMural = img.src === '/images/IMG_2493.jpeg';
                  return (
                    <figure
                      key={img.src}
                      className={`group relative overflow-hidden transition-transform
                        ${isFeatured ? 'sm:col-span-2 lg:col-span-2' : ''}
                        ${isRetro ? 'border-2 border-brand-black bg-white shadow-retro' : 'rounded-2xl border border-gray-100 shadow-sm'}
                      `}
                    >
                      <div className={isFeatured ? 'aspect-[16/9]' : 'aspect-[4/3]'}>
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
                      </div>

                      {/* Subtle overlay to help busy images read cleaner */}
                      <div
                        className={`pointer-events-none absolute inset-0
                          ${isMural ? 'bg-gradient-to-t from-black/25 via-black/0 to-black/0' : ''}
                        `}
                      />
                    </figure>
                  );
                })}
              </div>
           </div>
        </div>
      </Section>
    </div>
  );
};
