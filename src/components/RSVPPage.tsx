
import React, { useState } from 'react';
import { ViewMode, Event } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { Calendar, Clock, MapPin, CheckCircle2, Ticket, ArrowLeft, ChevronDown } from 'lucide-react';

interface RSVPPageProps {
  viewMode: ViewMode;
  event: Event | null;
  onBack: () => void;
}

export const RSVPPage: React.FC<RSVPPageProps> = ({ viewMode, event, onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', guests: '1', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const isRetro = viewMode === 'retro';

  if (!event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-500 pt-8 min-h-screen">
      <Section>
        <div className="max-w-5xl mx-auto">
           
           {/* Back Button */}
           <div className="mb-8">
                <button 
                  onClick={onBack}
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors
                     ${isRetro ? 'text-brand-black hover:text-brand-orange' : 'text-gray-500 hover:text-black'}
                  `}
                >
                  <ArrowLeft size={14} strokeWidth={3} /> Back to Events
                </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
              
              {/* Event Details Card */}
              <div className={`p-0 overflow-hidden md:sticky md:top-24
                  ${isRetro 
                    ? 'bg-white border-2 border-brand-black shadow-retro' 
                    : 'bg-white rounded-2xl border border-gray-200 shadow-lg'}
              `}>
                  <div className="aspect-video w-full relative">
                      <img src={event.imageUrl} alt={event.title} className={`w-full h-full object-cover ${isRetro ? 'grayscale-[20%]' : ''}`} />
                      <div className="absolute top-4 left-4">
                          <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm shadow-md
                              ${isRetro ? 'bg-brand-orange text-brand-black border-2 border-brand-black' : 'bg-white text-black'}
                          `}>
                              {event.type}
                          </span>
                      </div>
                  </div>
                  
                  <div className="p-8">
                      <h1 className={`font-display text-4xl mb-4 leading-none ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>
                          {event.title}
                      </h1>
                      
                      <div className="space-y-4 py-6 border-t border-b border-gray-100 mb-6">
                          <div className="flex items-center gap-4">
                              <Calendar className={isRetro ? 'text-brand-orange' : 'text-gray-400'} size={20} />
                              <div>
                                  <p className="font-bold uppercase text-xs tracking-wider text-gray-500">Date</p>
                                  <p className="font-bold text-lg">{event.date}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4">
                              <Clock className={isRetro ? 'text-brand-teal' : 'text-gray-400'} size={20} />
                              <div>
                                  <p className="font-bold uppercase text-xs tracking-wider text-gray-500">Time</p>
                                  <p className="font-bold text-lg">{event.time}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4">
                              <MapPin className={isRetro ? 'text-brand-red' : 'text-gray-400'} size={20} />
                              <div>
                                  <p className="font-bold uppercase text-xs tracking-wider text-gray-500">Location</p>
                                  <p className="font-bold text-lg">Spiral Groove Records</p>
                              </div>
                          </div>
                      </div>

                      <p className="text-gray-600 font-medium leading-relaxed">
                          {event.description}
                      </p>
                  </div>
              </div>

              {/* RSVP Form */}
              <div className="pt-4">
                  <div className="mb-8">
                      <h2 className="font-display text-3xl mb-2">Save Your Spot</h2>
                      <p className="text-gray-500 font-medium">Space is limited. Let us know you're coming.</p>
                  </div>

                  {submitted ? (
                      <div className={`p-10 text-center animate-in fade-in zoom-in duration-500
                          ${isRetro 
                              ? 'bg-brand-mustard border-2 border-brand-black shadow-retro' 
                              : 'bg-green-50 border border-green-200 rounded-2xl'}
                      `}>
                          <div className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full
                              ${isRetro ? 'bg-brand-black text-brand-mustard' : 'bg-green-100 text-green-600'}
                          `}>
                              <Ticket size={32} />
                          </div>
                          <h3 className="font-display text-3xl mb-4">You're On The List!</h3>
                          <p className="text-gray-700 mb-8 max-w-xs mx-auto">
                              We've sent a confirmation email to <strong>{formData.email}</strong>. See you at the shop!
                          </p>
                          <Button onClick={onBack} variant={isRetro ? 'primary' : 'outline'}>
                              Back to Events
                          </Button>
                      </div>
                  ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 gap-6">
                              <div className="space-y-2">
                                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">Full Name</label>
                                  <input 
                                      type="text" 
                                      required
                                      value={formData.name}
                                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                                      className={`w-full p-4 border-2 font-medium focus:outline-none transition-all
                                          ${isRetro 
                                          ? 'bg-white border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                                          : 'bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                      `}
                                      placeholder="Your Name"
                                  />
                              </div>

                              <div className="space-y-2">
                                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">Email Address</label>
                                  <input 
                                      type="email" 
                                      required
                                      value={formData.email}
                                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                                      className={`w-full p-4 border-2 font-medium focus:outline-none transition-all
                                          ${isRetro 
                                          ? 'bg-white border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                                          : 'bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                      `}
                                      placeholder="you@example.com"
                                  />
                              </div>

                              <div className="space-y-2">
                                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">Number of Guests</label>
                                  <div className="relative">
                                      <select 
                                          value={formData.guests}
                                          onChange={(e) => setFormData({...formData, guests: e.target.value})}
                                          className={`w-full p-4 border-2 font-medium focus:outline-none transition-all appearance-none cursor-pointer
                                              ${isRetro 
                                              ? 'bg-white border-brand-black focus:shadow-pop-sm' 
                                              : 'bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                          `}
                                      >
                                          <option value="1">Just Me</option>
                                          <option value="2">+1 Guest</option>
                                          <option value="3">+2 Guests</option>
                                          <option value="4">+3 Guests</option>
                                      </select>
                                      <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                  </div>
                              </div>

                              <div className="space-y-2">
                                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">Notes (Optional)</label>
                                  <textarea 
                                      rows={3}
                                      value={formData.notes}
                                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                      className={`w-full p-4 border-2 font-medium focus:outline-none transition-all resize-none
                                          ${isRetro 
                                          ? 'bg-white border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                                          : 'bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                      `}
                                      placeholder="Any dietary restrictions or questions?"
                                  ></textarea>
                              </div>

                              <Button 
                                  type="submit" 
                                  size="lg" 
                                  fullWidth 
                                  disabled={isSubmitting}
                                  className={isRetro ? 'shadow-pop hover:shadow-pop-hover' : ''}
                              >
                                  {isSubmitting ? 'Confirming...' : 'Complete RSVP'}
                              </Button>
                          </div>
                          
                          <p className="text-xs text-center text-gray-500">
                              By RSVPing, you agree to receive event updates via email.
                          </p>
                      </form>
                  )}
              </div>

           </div>
        </div>
      </Section>
    </div>
  );
};
