import React from 'react';
import { ViewMode } from '../../types';

const ANNIVERSARY_ENDS = new Date('2026-10-26T04:00:00Z').getTime()

const ANNIVERSARY_FLYERS: Array<{ src: string; name: string }> = [
  { src: '/images/anniversary/cigarboxscott.jpg', name: 'cigarboxscott' },
  { src: '/images/anniversary/doug-wiegand.jpg', name: 'Doug Wiegand' },
  { src: '/images/anniversary/mental-massacre.jpg', name: 'Mental Massacre' },
  { src: '/images/anniversary/craigs-limit.jpg', name: "Craig's Limit" },
]

function isAnniversaryWeekendLive() {
  return Date.now() < ANNIVERSARY_ENDS
}

export const AnniversaryWeekend: React.FC<{ viewMode: ViewMode; className?: string }> = ({ viewMode, className = '' }) => {
  if (!isAnniversaryWeekendLive()) return null

  const isRetro = viewMode === 'retro'

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center p-6 md:p-8 ${className}
      ${isRetro
        ? 'bg-brand-cream border-2 border-brand-black shadow-retro'
        : 'bg-gray-50 rounded-2xl border border-gray-100'}
    `}>
      <div>
        <span className={`inline-block px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-[0.2em]
          ${isRetro
            ? 'bg-brand-orange text-brand-black border-2 border-brand-black shadow-pop-sm'
            : 'bg-black text-white rounded-full'}
        `}>
          Anniversary weekend
        </span>
        <h3 className={`font-display text-3xl md:text-4xl leading-[0.95] mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
          Spiral Groove turns 5. Hybrid Moments turns 1.
        </h3>
        <p className="text-gray-700 font-medium leading-relaxed">
          Friday through Sunday, October 23–25. Fourteen artists and three vendors. We’re announcing the lineup over the next month. These are the flyers posted so far.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ANNIVERSARY_FLYERS.map((flyer) => (
          <figure key={flyer.src} className={`overflow-hidden ${isRetro ? 'border-2 border-brand-black' : 'rounded-lg'}`}>
            <img
              src={flyer.src}
              alt={`${flyer.name} at the Spiral Groove anniversary weekend`}
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
            <figcaption className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider truncate
              ${isRetro ? 'bg-brand-black text-brand-cream' : 'bg-white text-gray-700'}
            `}>
              {flyer.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
