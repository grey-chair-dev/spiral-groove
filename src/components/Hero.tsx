
import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { ViewMode, Page } from '../../types';
import { ChevronLeft, ChevronRight, Disc, Headphones, Radio, MapPin, Calendar, Heart, Star } from 'lucide-react';

interface HeroProps {
  viewMode: ViewMode;
  onNavigate: (page: Page, filter?: string) => void;
}

const SLIDES = [
  {
    id: 1,
    badge: "Album of the Week",
    title: "Tame Impala: Currents",
    subtitle: "10th Anniversary Collector's Edition",
    description: "Experience the psychedelic masterpiece like never before. Pressed on exclusive 180g purple splatter vinyl with a 24-page booklet.",
    image: "https://picsum.photos/1600/900?random=101",
    ctaPrimary: "Shop Exclusive",
    ctaSecondary: "View All Tame Impala",
    filterPrimary: "Rock",
    filterSecondary: "Rock",
    icon: <Disc size={18} />
  },
  {
    id: 2,
    badge: "Genre Focus",
    title: "Japanese City Pop",
    subtitle: "Sun-Soaked Sounds from Tokyo",
    description: "From Tatsuro Yamashita to Mariya Takeuchi. Discover the golden era of J-Pop, funk, and boogie. Imported directly from Osaka.",
    image: "https://picsum.photos/1600/900?random=102",
    ctaPrimary: "Explore Collection",
    ctaSecondary: "Read the Blog",
    filterPrimary: "Electronic",
    filterSecondary: "All",
    icon: <Radio size={18} />
  },
  {
    id: 3,
    badge: "Hi-Fi Gear",
    title: "Analog Warmth",
    subtitle: "Audio-Technica LP-120X",
    description: "The perfect entry into high-fidelity listening. Direct-drive, built-in preamp, and that classic industrial design.",
    image: "https://picsum.photos/1600/900?random=103",
    ctaPrimary: "Shop Turntables",
    ctaSecondary: "Setup Guide",
    filterPrimary: "All",
    filterSecondary: "All",
    icon: <Headphones size={18} />
  }
];

const HIGHLIGHTS = [
  { icon: Heart, text: "Curated by real music lovers", sub: "Hand-picked daily" },
  { icon: Calendar, text: "Weekly new arrivals", sub: "Fresh drops every Friday" },
  { icon: MapPin, text: "Local Pickup", sub: "215B Main St, Milford" }
];

export const Hero: React.FC<HeroProps> = ({ viewMode, onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const slide = SLIDES[currentSlide];
  const isRetro = viewMode === 'retro';

  return (
    <div 
      className="group flex flex-col border-b-2 border-brand-black bg-brand-black"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      
      {/* Immersive Hero Content */}
      <div className="relative w-full h-[85vh] md:h-[700px] min-h-[550px] overflow-hidden">
        
        {/* Background Image & Overlay */}
        <div key={slide.id} className="absolute inset-0 w-full h-full animate-in fade-in zoom-in-105 duration-1000">
           <img 
             src={slide.image} 
             alt={slide.title} 
             className="w-full h-full object-cover"
           />
           
          {/* Gradient Scrim for Readability */}
           <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r 
             ${isRetro 
                ? 'from-brand-black/95 via-brand-black/60 to-brand-black/20 mix-blend-hard-light' 
                : 'from-black/90 via-black/60 to-transparent'
             }
           `}></div>

           {/* Grain Texture Overlay - Applied to both for continuity but styled differently */}
           <div className={`absolute inset-0 opacity-20 pointer-events-none
                ${isRetro ? "mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" : "mix-blend-soft-light bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')]"}
           `}></div>
        </div>

        {/* Content Container */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end md:justify-center pb-20 md:pb-0">
           <div className="max-w-7xl mx-auto w-full px-6 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                 
                 {/* Badge */}
                 <div className="mb-4 sm:mb-6 animate-in slide-in-from-left-8 fade-in duration-700 delay-100">
                   {isRetro ? (
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-brand-black bg-brand-mustard text-brand-black text-xs font-bold uppercase tracking-widest shadow-pop-sm transform -rotate-1 hover-wobble cursor-default">
                       {slide.icon}
                       <span>{slide.badge}</span>
                     </div>
                   ) : (
                     <span className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-full shadow-lg">
                       {slide.icon} {slide.badge}
                     </span>
                   )}
                 </div>

                 {/* Title */}
                 <h1 className={`block leading-[0.95] mb-4 text-white animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 break-words
                   ${isRetro 
                     ? 'font-display text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-[2px_2px_0px_#231F20] md:drop-shadow-[4px_4px_0px_#231F20]'
                     : 'font-sans font-black text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-tighter drop-shadow-lg'
                   }
                 `}>
                   {slide.title}
                 </h1>

                 {/* Subtitle / Description */}
                 <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
                   <p className={`block text-base xs:text-lg sm:text-xl md:text-2xl mb-3 sm:mb-6 font-bold
                      ${isRetro ? 'text-brand-mustard font-header' : 'text-brand-orange'}
                   `}>
                     {slide.subtitle}
                   </p>
                   {/* Line clamped on mobile to ensure buttons are always visible */}
                   <p className={`max-w-xl text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 line-clamp-3 md:line-clamp-none
                      ${isRetro ? 'text-white/90 font-medium' : 'text-white/90 font-medium'}
                   `}>
                     {slide.description}
                   </p>
                 </div>

                 {/* Buttons - Stacked on mobile with PR to avoid nav conflict */}
                 <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-400 max-w-md sm:max-w-none">
                   <Button 
                     variant="primary" 
                     size="lg"
                     fullWidth={false}
                     onClick={() => onNavigate('catalog', slide.filterPrimary)}
                     className={`w-full sm:w-auto transition-all duration-200
                       ${isRetro 
                         ? 'bg-brand-orange text-brand-black border-2 border-brand-black shadow-[4px_4px_0px_#FFFFFF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#FFFFFF]' 
                         : 'bg-white text-black border border-transparent hover:bg-brand-cream rounded-full shadow-lg hover:scale-105'
                       }
                     `}
                   >
                     {slide.ctaPrimary}
                   </Button>
                   <Button 
                     variant={isRetro ? "outline" : "ghost"}
                     size="lg"
                     fullWidth={false}
                     onClick={() => onNavigate('catalog', slide.filterSecondary)}
                     className={`w-full sm:w-auto transition-all duration-200
                       ${isRetro 
                         ? 'bg-transparent text-white border-2 border-white shadow-[4px_4px_0px_rgba(255,255,255,0.25)] hover:bg-white hover:text-brand-black hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]' 
                         : 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white hover:text-black rounded-full hover:scale-105'
                       }
                     `}
                   >
                     {slide.ctaSecondary}
                   </Button>
                 </div>
              </div>
           </div>
        </div>

        {/* Desktop Arrow Controls */}
        <div className="absolute bottom-8 right-8 z-30 hidden md:flex gap-2">
            <button 
                onClick={prevSlide}
                className={`p-4 transition-all duration-200 
                  ${isRetro 
                    ? 'bg-brand-black border-2 border-white text-white shadow-pop hover:shadow-pop-hover rounded-full hover:bg-brand-orange' 
                    : 'bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white hover:text-black rounded-full'
                  }
                `}
              >
                <ChevronLeft size={24} />
            </button>
            <button 
                onClick={nextSlide}
                className={`p-4 transition-all duration-200 
                  ${isRetro 
                    ? 'bg-brand-cream border-2 border-brand-black text-brand-black shadow-pop hover:shadow-pop-hover rounded-full hover:bg-brand-teal' 
                    : 'bg-white text-black border border-white hover:bg-gray-200 rounded-full'
                  }
                `}
              >
                <ChevronRight size={24} />
            </button>
        </div>
        
        {/* Mobile Nav Controls - Vertical stack bottom right to stay out of content way */}
        <div className="absolute bottom-24 right-4 flex flex-col gap-3 md:hidden z-30">
           <button onClick={prevSlide} className={`p-3 rounded-full border-2 transition-all active:scale-95
              ${isRetro ? 'bg-brand-black border-white text-white shadow-pop' : 'bg-black/40 border-white/20 text-white backdrop-blur-md'}`}>
              <ChevronLeft size={20} />
           </button>
           <button onClick={nextSlide} className={`p-3 rounded-full border-2 transition-all active:scale-95
              ${isRetro ? 'bg-brand-orange border-brand-black text-brand-black shadow-pop' : 'bg-white text-black border-white shadow-lg'}`}>
              <ChevronRight size={20} />
           </button>
        </div>

      </div>

      {/* Supporting Highlights Bar - Explicitly Stacked on Mobile */}
      <div className={`relative z-20 w-full border-t-2 border-brand-black
        ${isRetro ? 'bg-white' : 'bg-brand-orange text-white border-t-0'}
      `}>
        <div className="max-w-7xl mx-auto">
          {/* Use flex-col for mobile to ensure stacking, grid for desktop */}
          <div className="flex flex-col md:grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-brand-black/5">
            {HIGHLIGHTS.map((highlight, idx) => (
              <div key={idx} className="w-full flex items-center gap-4 justify-start p-6 md:py-8 md:px-8">
                <div className={`p-3 flex-shrink-0
                   ${isRetro 
                     ? 'bg-brand-mustard text-brand-black border-2 border-brand-black shadow-pop-sm rounded-full' 
                     : 'bg-black text-white border-2 border-black rounded-full'
                   }
                `}>
                  <highlight.icon size={20} strokeWidth={isRetro ? 2 : 3} />
                </div>
                <div>
                  <h3 className={`font-bold leading-none mb-1
                    ${isRetro ? 'font-header text-brand-black uppercase tracking-wide text-sm' : 'font-sans text-inherit uppercase tracking-wider text-sm'}
                  `}>
                    {highlight.text}
                  </h3>
                  <p className={`text-xs
                    ${isRetro ? 'text-gray-500 font-bold' : 'text-white/80 font-medium'}
                  `}>
                    {highlight.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
