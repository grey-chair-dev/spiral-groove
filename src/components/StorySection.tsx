
import React from 'react';
import { Section } from './ui/Section'; 
import { ViewMode, Page } from '../../types';
import { ArrowRight } from 'lucide-react';

interface StorySectionProps { 
  viewMode: ViewMode;
  onNavigate: (page: Page, filter?: string) => void;
}

export const StorySection: React.FC<StorySectionProps> = ({ viewMode, onNavigate }) => {
  return (
    <Section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Editorial Photo Grid */}
        <div className="order-2 lg:order-1 relative group select-none">
           <div className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5]">
              
              {/* Main Image: The Digger */}
              <div className={`absolute inset-0 w-[85%] h-[85%] overflow-hidden z-10 transition-transform duration-700 ease-out group-hover:scale-[1.02]
                 ${viewMode === 'retro' 
                   ? 'rounded-none border-2 border-brand-black shadow-retro grayscale-[20%]' 
                   : 'rounded-2xl'
                 }
              `}>
                <img 
                  src="/images/IMG_2500.jpeg" 
                  alt="Inside Spiral Groove Records — rows of vinyl bins" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Overlapping Detail: The Turntable */}
              <div className={`absolute bottom-0 right-0 w-[55%] h-[45%] overflow-hidden z-20 transition-transform duration-700 ease-out group-hover:-translate-y-4 group-hover:-translate-x-4
                 ${viewMode === 'retro'
                   ? 'rounded-none border-2 border-brand-black shadow-retro bg-brand-cream' 
                   : 'rounded-2xl shadow-xl border-4 border-white'
                 }
              `}>
                 <img 
                   src="/images/IMG_2490.jpeg" 
                   alt="Spiral Groove Records storefront with neon record sign" 
                   className="w-full h-full object-cover"
                   loading="lazy"
                 />
              </div>

              {/* Decorative "Stamp" */}
              <div className={`absolute top-4 right-4 z-30 w-24 h-24 rounded-full flex items-center justify-center animate-spin-slow
                ${viewMode === 'retro' 
                  ? 'bg-brand-mustard text-brand-black border-2 border-brand-black' 
                  : 'bg-black text-white'
                }
              `}>
                 <svg viewBox="0 0 100 100" className="w-20 h-20 fill-current">
                   <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                   <text fontSize="15" fontWeight="bold" letterSpacing="1px">
                     <textPath xlinkHref="#circlePath">
                       EST. 2020 • MILFORD, OH • 
                     </textPath>
                   </text>
                 </svg>
              </div>

              {/* Graphic Element (Retro Only) */}
              {viewMode === 'retro' && (
                <div className="absolute -bottom-6 -left-6 w-full h-full border-2 border-brand-black/20 -z-10 pointer-events-none"></div>
              )}
           </div>
        </div>

        {/* Editorial Text Content */}
        <div className="order-1 lg:order-2 space-y-8">
          <div>
            <span className={`inline-block px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-[0.2em]
              ${viewMode === 'retro' 
                ? 'bg-brand-teal text-white border-2 border-brand-black shadow-pop-sm transform -rotate-1' 
                : 'bg-gray-100 text-gray-900 rounded-full'
              }
            `}>
              The Story
            </span>
            <h2 className={`font-display text-5xl md:text-6xl leading-[0.9] mb-6
               ${viewMode === 'retro' ? 'text-brand-black' : 'text-gray-900 tracking-tight'}
            `}>
              Analog souls in a<br/> 
              <span className={viewMode === 'retro' ? 'text-brand-orange' : 'text-gray-400'}>digital world.</span>
            </h2>
          </div>

          <div className="space-y-6 text-lg md:text-xl leading-relaxed font-medium text-brand-black/80">
            <p>
              Around 2020, the shop was rebranded as Spiral Groove with a renewed focus on community, vinyl culture, and in-person music experience.
            </p>
            <p>
              We're not just retail—we're a cultural hub. With thousands of records spanning decades and genres, live music events, and a space where newcomers and long-time collectors intersect, we cherish the experience of physical music in a world dominated by streaming.
            </p>
          </div>

          <div className="pt-4 flex items-center gap-8">
             <button 
                onClick={() => onNavigate('about')}
                className={`group flex items-center gap-2 font-bold text-sm uppercase tracking-widest border-b-2 pb-1 transition-all
                ${viewMode === 'retro' 
                  ? 'border-brand-black hover:text-brand-orange hover:border-brand-orange' 
                  : 'border-black hover:opacity-60'
                }
             `}>
               <span>Read Full Story</span>
               <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
             </button>
             
             {/* Social Proof / Stats */}
             <div className="flex gap-6 border-l-2 border-gray-200 pl-6">
                <div>
                   <div className="font-display text-2xl">15k+</div>
                   <div className="text-[10px] uppercase font-bold text-gray-500">Records Sold</div>
                </div>
                <div>
                   <div className="font-display text-2xl">100%</div>
                   <div className="text-[10px] uppercase font-bold text-gray-500">Independent</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
