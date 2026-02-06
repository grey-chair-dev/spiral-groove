
import React from 'react';
import { Event, ViewMode, Page } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { MapPin, ArrowRight } from 'lucide-react';

const EVENT_IMG_FALLBACK =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#F3F4F6"/>
  <rect x="18" y="18" width="264" height="264" fill="none" stroke="#111827" stroke-width="4"/>
  <text x="150" y="158" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="14" fill="#111827">Event</text>
</svg>`)

interface EventsSectionProps {
  events: Event[];
  viewMode: ViewMode;
  onNavigate: (page: Page, filter?: string) => void;
  onRSVP: (event: Event) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({ events, viewMode, onNavigate, onRSVP }) => {
  return (
    <Section className={viewMode === 'retro' ? "bg-transparent relative border-t-2 border-brand-black" : "bg-white"}>
       {/* Background Grid Pattern for Retro */}
       {viewMode === 'retro' && (
         <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0E0E0E 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
       )}

       <div className="relative z-10 flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h2 className={`font-display text-4xl md:text-5xl font-bold mb-3 inline-block ${viewMode === 'retro' ? 'text-brand-black' : 'text-gray-900'}`}>
            In The Shop
          </h2>
          <p className="text-gray-600 font-medium text-lg max-w-md">Upcoming shows, signings, and listening parties directly from the floor.</p>
        </div>
        <div className="hidden md:block">
           <Button variant="link" onClick={() => onNavigate('events')}>
              See All Events <ArrowRight size={16} className="ml-2" />
           </Button>
        </div>
      </div>

      {events.length > 0 ? (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event) => (
            <div key={event.id} className={`flex flex-col sm:flex-row group h-full
               ${viewMode === 'retro' 
                 ? 'bg-brand-cream border-2 border-brand-black shadow-retro hover:shadow-retro-hover transition-all' 
                 : 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'}
            `}>
              
              {/* Date "Ticket Stub" - Stacked on Mobile, Left on Desktop */}
              <div className={`w-full sm:w-28 flex-shrink-0 flex flex-row sm:flex-col items-center justify-between sm:justify-center px-6 py-3 sm:p-4 border-b-2 sm:border-b-0 sm:border-r-2 border-dashed 
                 ${viewMode === 'retro' 
                   ? 'bg-brand-black text-brand-cream border-gray-700' 
                   : 'bg-gray-50 border-gray-200'}
              `}>
                 <span className="text-xs font-bold uppercase tracking-widest opacity-70 mb-0 sm:mb-1">{event.date.split(' ')[0]}</span>
                 <span className="text-2xl sm:text-4xl font-display font-bold">{event.date.split(' ')[1]}</span>
              </div>

              <div className="flex-1 p-6 flex flex-col">
                 {/* Thumbnail */}
                 <div className="flex items-start justify-between gap-4 mb-4">
                   <div className="min-w-0">
                     <div className="mb-3">
                       <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider mb-2 rounded-sm
                         ${viewMode === 'retro' ? 'bg-brand-teal text-white' : 'bg-brand-orange/10 text-brand-orange'}`}>
                         {event.type}
                       </span>
                       <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-brand-orange transition-colors font-header">{event.title}</h3>
                     </div>
                     
                     <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{event.description}</p>
                   </div>

                   {event.imageUrl ? (
                     <div
                       className={`w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden
                         ${viewMode === 'retro' ? 'border-2 border-brand-black grayscale group-hover:grayscale-0 transition-all' : 'rounded-xl border border-gray-100'}
                       `}
                     >
                       <img
                         src={event.imageUrl}
                         alt={event.title}
                         className="w-full h-full object-cover"
                         loading="lazy"
                         referrerPolicy="no-referrer"
                         onError={(e) => {
                           const img = e.currentTarget
                           if (img.dataset.fallbackApplied === '1') return
                           img.dataset.fallbackApplied = '1'
                           img.src = EVENT_IMG_FALLBACK
                         }}
                       />
                     </div>
                   ) : null}
                 </div>
                 <div className="mb-6" />
                 
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                      <MapPin size={14} />
                      <span>In-Store • {event.time}</span>
                   </div>
                   {event.linkUrl && (
                     <a
                       href={event.linkUrl}
                       target="_blank"
                       rel="noreferrer"
                       className={`text-xs font-bold uppercase tracking-wider transition-colors
                         ${viewMode === 'retro' ? 'text-brand-black hover:text-brand-orange' : 'text-gray-700 hover:text-black'}
                       `}
                     >
                       Details <ArrowRight size={14} className="inline-block ml-1 -mt-[1px]" />
                     </a>
                   )}
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative z-10 text-center py-12">
          <p className={`text-lg font-medium ${viewMode === 'retro' ? 'text-gray-700' : 'text-gray-500'}`}>
            No upcoming events
          </p>
          <p className={`text-sm mt-2 ${viewMode === 'retro' ? 'text-gray-600' : 'text-gray-400'}`}>
            Check back soon for new shows, signings, and listening parties.
          </p>
        </div>
      )}
      
      <div className="md:hidden mt-8 text-center">
         <Button variant="outline" fullWidth onClick={() => onNavigate('events')}>See All Events</Button>
      </div>
    </Section>
  );
};
