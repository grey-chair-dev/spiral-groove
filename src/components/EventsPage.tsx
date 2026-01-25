
import React, { useState } from 'react';
import { ViewMode, Event } from '../../types';
import { EVENTS } from '../../constants';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { Mic2, Calendar, Mail, MapPin, Clock } from 'lucide-react';

interface EventsPageProps {
  viewMode: ViewMode;
  onRSVP: (event: Event) => void;
}

const PAST_EVENTS: Event[] = [
  {
    id: 'p1',
    title: 'Neon Psych Fest',
    date: 'SEP 2023',
    time: '8:00 PM',
    description: 'A 3-day exploration of local shoegaze and psych rock.',
    type: 'Live Show',
    imageUrl: 'https://picsum.photos/600/400?random=88'
  },
  {
    id: 'p2',
    title: 'Dilla Day Celebration',
    date: 'FEB 2023',
    time: '12:00 PM',
    description: 'All day hip-hop instrumentals and donut pop-up.',
    type: 'Listening Party',
    imageUrl: 'https://picsum.photos/600/400?random=89'
  }
];

export const EventsPage: React.FC<EventsPageProps> = ({ viewMode, onRSVP }) => {
  const [formData, setFormData] = useState({ name: '', org: '', date: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const isRetro = viewMode === 'retro';

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Hero */}
      <div className={`relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden border-b-2
         ${isRetro ? 'border-brand-black bg-brand-black' : 'bg-black text-white'}
      `}>
         <div className="absolute inset-0 opacity-50">
             <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Concert crowd" />
             <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
         </div>
         <div className="relative z-10 text-center px-4 max-w-4xl">
             <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest bg-brand-orange text-brand-black rounded-sm transform -rotate-2">The Spiral Stage</span>
             <h1 className="font-display text-5xl md:text-7xl text-white mb-6">Live at the Shop</h1>
             <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-medium">An intimate 50-cap venue for listening parties, signings, and local showcases.</p>
         </div>
      </div>

      <Section className={isRetro ? "bg-transparent" : "bg-white"}>
        
        {/* Upcoming Events List */}
        <div className="mb-24">
            <div className="text-center mb-12">
                <span className={`inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest rounded-sm 
                    ${isRetro ? 'bg-brand-teal text-white border-2 border-brand-black shadow-pop-sm' : 'bg-teal-100 text-teal-800'}
                `}>
                    Mark Your Calendar
                </span>
                <h2 className={`font-display text-4xl md:text-5xl mb-4 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>Upcoming Happenings</h2>
            </div>

            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                {EVENTS.map((event) => (
                    <div key={event.id} className={`group relative flex flex-col md:flex-row transition-all
                        ${isRetro 
                            ? 'bg-white border-2 border-brand-black shadow-retro hover:shadow-retro-hover' 
                            : 'bg-white border border-gray-200 rounded-xl hover:shadow-lg'}
                    `}>
                        {/* Left Perforation */}
                        {isRetro && (
                            <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col items-center justify-center gap-1 z-10 pointer-events-none">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-brand-black/20"></div>
                                ))}
                            </div>
                        )}

                        {/* Ticket Stub - Date Block */}
                        {isRetro ? (
                            <div className="relative flex md:flex-col items-center justify-center md:w-32 flex-shrink-0 gap-2 md:gap-0 p-4 border-r-2 border-dashed border-brand-black bg-brand-mustard/30">
                                {/* Stub Perforations */}
                                <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col items-center justify-center gap-1">
                                    {Array.from({ length: 15 }).map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-black/30"></div>
                                    ))}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-brand-black/70">{event.date.split(' ')[0]}</span>
                                <span className="text-3xl font-display text-brand-black transform md:rotate-[-8deg]">{event.date.split(' ')[1]}</span>
                            </div>
                        ) : (
                            <div className="flex md:flex-col items-center justify-center md:w-32 flex-shrink-0 gap-2 md:gap-0 p-4 border-2 border-dashed bg-gray-50 border-gray-300 rounded-lg">
                                <span className="text-xs font-bold uppercase tracking-widest opacity-60">{event.date.split(' ')[0]}</span>
                                <span className="text-3xl font-display">{event.date.split(' ')[1]}</span>
                            </div>
                        )}

                        {/* Main Ticket Content */}
                        <div className="flex-1 flex flex-col md:flex-row gap-6 p-6">
                            {/* Image */}
                            <div className={`w-full md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden relative
                                ${isRetro ? 'border-2 border-brand-black grayscale group-hover:grayscale-0 transition-all' : 'rounded-lg'}
                            `}>
                                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="mb-2">
                                    <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider mb-2 rounded-sm
                                        ${isRetro ? 'bg-brand-black text-white' : 'bg-black text-white'}
                                    `}>
                                        {event.type}
                                    </span>
                                    <h3 className={`font-display text-2xl md:text-3xl leading-none mb-2 ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>{event.title}</h3>
                                    <p className={`font-medium ${isRetro ? 'text-gray-700' : 'text-gray-600'}`}>{event.description}</p>
                                </div>
                                <div className={`mt-4 pt-4 flex items-center justify-between ${isRetro ? 'border-t-2 border-brand-black/20' : 'border-t border-gray-100'}`}>
                                    <div className={`flex items-center gap-4 text-xs font-bold uppercase tracking-wider ${isRetro ? 'text-brand-black/70' : 'text-gray-500'}`}>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {event.time}</span>
                                        <span className="flex items-center gap-1"><MapPin size={14} /> Spiral Groove</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Perforation */}
                        {isRetro && (
                            <div className="absolute right-0 top-0 bottom-0 w-4 flex flex-col items-center justify-center gap-1 z-10 pointer-events-none">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-brand-black/20"></div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Inquiry Form */}
          <div>
             <h2 className={`font-display text-4xl mb-6 ${isRetro ? 'text-brand-black' : 'text-black'}`}>Book The Space</h2>
             <p className="mb-8 text-lg text-gray-600">
                Want to host a release party, community workshop, or intimate gig? 
                Our space is equipped with a vintage Klipschorn sound system and modular staging.
             </p>
             
             {submitted ? (
                 <div className="p-8 bg-brand-teal/10 border-2 border-brand-teal text-center rounded-xl">
                    <div className="w-16 h-16 bg-brand-teal text-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mic2 size={32} />
                    </div>
                    <h3 className="font-display text-2xl mb-2">Message Sent!</h3>
                    <p>We'll check the calendar and get back to you shortly.</p>
                 </div>
             ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="Your Name" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className={`w-full p-4 border-2 font-medium focus:outline-none transition-all
                             ${isRetro ? 'bg-white border-brand-black focus:shadow-pop-sm' : 'bg-gray-50 border-gray-200 rounded-lg'}
                          `}
                        />
                        <input 
                          type="text" 
                          placeholder="Band / Organization" 
                          required
                          value={formData.org}
                          onChange={(e) => setFormData({...formData, org: e.target.value})}
                          className={`w-full p-4 border-2 font-medium focus:outline-none transition-all
                             ${isRetro ? 'bg-white border-brand-black focus:shadow-pop-sm' : 'bg-gray-50 border-gray-200 rounded-lg'}
                          `}
                        />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Preferred Date(s)" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className={`w-full p-4 border-2 font-medium focus:outline-none transition-all
                         ${isRetro ? 'bg-white border-brand-black focus:shadow-pop-sm' : 'bg-gray-50 border-gray-200 rounded-lg'}
                      `}
                    />
                    <textarea 
                      placeholder="Tell us about your event idea..." 
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className={`w-full p-4 border-2 font-medium focus:outline-none transition-all resize-none
                         ${isRetro ? 'bg-white border-brand-black focus:shadow-pop-sm' : 'bg-gray-50 border-gray-200 rounded-lg'}
                      `}
                    ></textarea>
                    <Button type="submit" size="lg" className="mt-2">Submit Inquiry</Button>
                </form>
             )}
          </div>

          {/* Past Events / Credibility */}
          <div>
             <h2 className={`font-display text-3xl mb-8 ${isRetro ? 'text-brand-black' : 'text-black'}`}>Archive</h2>
             <div className="space-y-6">
                {PAST_EVENTS.map(event => (
                    <div key={event.id} className="flex gap-4 group opacity-70 hover:opacity-100 transition-opacity">
                        <div className={`w-24 h-24 flex-shrink-0 overflow-hidden ${isRetro ? 'border-2 border-brand-black grayscale' : 'rounded-lg'}`}>
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{event.date}</span>
                            <h3 className="font-bold text-xl mb-1">{event.title}</h3>
                            <p className="text-sm text-gray-600 leading-snug">{event.description}</p>
                        </div>
                    </div>
                ))}
             </div>
          </div>

        </div>
      </Section>
    </div>
  );
};
