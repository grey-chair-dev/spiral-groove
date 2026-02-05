
import React, { useEffect, useMemo, useState } from 'react';
import { ViewMode, Event } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { Mic2, Calendar, Mail, MapPin, Clock } from 'lucide-react';

interface EventsPageProps {
  viewMode: ViewMode;
  onRSVP: (event: Event) => void;
  events: Event[];
}

function parseEventStart(event: Event): Date | null {
  const raw = (event.startTime || '').trim()
  if (raw) {
    const isoish = raw.includes('T') ? raw : raw.replace(' ', 'T')
    const d = new Date(isoish)
    if (!Number.isNaN(d.getTime())) return d
  }
  const dateISO = (event.dateISO || '').trim()
  if (dateISO) {
    const d = new Date(`${dateISO}T00:00:00`)
    if (!Number.isNaN(d.getTime())) return d
  }
  return null
}

export const EventsPage: React.FC<EventsPageProps> = ({ viewMode, onRSVP, events }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    org: '',
    date: '',
    message: '',
    sendCopy: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [archivePage, setArchivePage] = useState(1);

  const normalizeUsPhone = (raw: string): string => {
    const digits = String(raw || '').replace(/\D/g, '')
    if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
    return digits
  }

  const isValidUsPhone = (raw: string): boolean => {
    const digits = normalizeUsPhone(raw)
    return digits.length === 0 || digits.length === 10
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setPhoneError(null);

    if (formData.phone && !isValidUsPhone(formData.phone)) {
      setIsSubmitting(false);
      setPhoneError('Please enter a valid 10-digit US phone number (or leave blank).');
      return;
    }
    try {
      const res = await fetch('/api/event-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        }),
      });
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      setSubmitted(true);
    } catch (err: any) {
      console.error('[EventsPage] Failed to submit inquiry:', err);
      setSubmitError('Could not send your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRetro = viewMode === 'retro';
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const enriched = (events || []).map((e) => ({ e, start: parseEventStart(e) }))
    const upcoming = enriched
      .filter(({ start }) => !start || start >= startOfToday)
      .sort((a, b) => {
        const at = a.start?.getTime() ?? Number.POSITIVE_INFINITY
        const bt = b.start?.getTime() ?? Number.POSITIVE_INFINITY
        return at - bt
      })
      .map(({ e }) => e)

    const past = enriched
      .filter(({ start }) => start && start < startOfToday)
      .sort((a, b) => (b.start?.getTime() ?? 0) - (a.start?.getTime() ?? 0))
      .map(({ e }) => e)

    return { upcomingEvents: upcoming, pastEvents: past }
  }, [events])

  const heroSubtitle = useMemo(() => {
    const next = upcomingEvents[0]
    if (!next) return 'No upcoming events posted yet — check back soon.'

    const date = (next.date || '').trim()
    const time = (next.time || '').trim()
    const title = (next.title || '').trim()
    const when = [date, time].filter(Boolean).join(' · ')

    // Keep it short on mobile; prioritize the facts.
    if (title && when) return `Next up: ${title} · ${when}`
    if (title) return `Next up: ${title}`
    if (when) return `Next up · ${when}`
    return 'Upcoming events are live — check back for the latest.'
  }, [upcomingEvents])

  const preferredDateOptions = useMemo(() => {
    const out: Array<{ value: string; label: string }> = []
    out.push({ value: '', label: 'Select a preferred date (optional)' })
    out.push({ value: 'Flexible', label: 'Flexible / Not sure yet' })

    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

    const start = new Date()
    start.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const label = fmt(d)
      out.push({ value: label, label })
    }

    out.push({ value: 'Other (see message)', label: 'Other (describe in message)' })
    return out
  }, [])

  const UPCOMING_PAGE_SIZE = 3;
  const ARCHIVE_PAGE_SIZE = 3;

  const upcomingTotalPages = Math.max(1, Math.ceil(upcomingEvents.length / UPCOMING_PAGE_SIZE));
  const archiveTotalPages = Math.max(1, Math.ceil(pastEvents.length / ARCHIVE_PAGE_SIZE));

  const safeUpcomingPage = Math.min(Math.max(1, upcomingPage), upcomingTotalPages);
  const safeArchivePage = Math.min(Math.max(1, archivePage), archiveTotalPages);

  const upcomingPageItems = upcomingEvents.slice(
    (safeUpcomingPage - 1) * UPCOMING_PAGE_SIZE,
    safeUpcomingPage * UPCOMING_PAGE_SIZE
  );
  const archivePageItems = pastEvents.slice(
    (safeArchivePage - 1) * ARCHIVE_PAGE_SIZE,
    safeArchivePage * ARCHIVE_PAGE_SIZE
  );

  // Reset pagination when data changes (e.g., fresh fetch)
  useEffect(() => {
    setUpcomingPage(1);
    setArchivePage(1);
  }, [upcomingEvents.length, pastEvents.length]);

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
             <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-medium">{heroSubtitle}</p>
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
                {upcomingPageItems.map((event) => (
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
                            {event.imageUrl ? (
                              <div className={`w-full md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden relative
                                  ${isRetro ? 'border-2 border-brand-black grayscale group-hover:grayscale-0 transition-all' : 'rounded-lg'}
                              `}>
                                  <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                              </div>
                            ) : null}

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
                                    {event.linkUrl && (
                                      <a
                                        href={event.linkUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`text-xs font-bold uppercase tracking-wider transition-colors
                                          ${isRetro ? 'text-brand-black hover:text-brand-orange' : 'text-gray-700 hover:text-black'}
                                        `}
                                      >
                                        Details
                                      </a>
                                    )}
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
            {upcomingEvents.length === 0 && (
              <div className="max-w-2xl mx-auto text-center text-gray-600 mt-8">
                No upcoming events are listed right now — check back soon.
              </div>
            )}
            {upcomingEvents.length > 0 && upcomingTotalPages > 1 && (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                  disabled={safeUpcomingPage <= 1}
                >
                  Prev
                </Button>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Page {safeUpcomingPage} of {upcomingTotalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpcomingPage((p) => Math.min(upcomingTotalPages, p + 1))}
                  disabled={safeUpcomingPage >= upcomingTotalPages}
                >
                  Next
                </Button>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Inquiry Form */}
          <div>
             <h2 className={`font-display text-4xl mb-6 ${isRetro ? 'text-brand-black' : 'text-black'}`}>Book The Space</h2>
             
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
                          type="email" 
                          placeholder="Email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className={`w-full p-4 border-2 font-medium focus:outline-none transition-all
                             ${isRetro ? 'bg-white border-brand-black focus:shadow-pop-sm' : 'bg-gray-50 border-gray-200 rounded-lg'}
                          `}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="Band / Organization" 
                          value={formData.org}
                          onChange={(e) => setFormData({...formData, org: e.target.value})}
                          className={`w-full p-4 border-2 font-medium focus:outline-none transition-all
                             ${isRetro ? 'bg-white border-brand-black focus:shadow-pop-sm' : 'bg-gray-50 border-gray-200 rounded-lg'}
                          `}
                        />
                        <input 
                          type="tel" 
                          placeholder="Phone (optional)" 
                          value={formData.phone}
                          onChange={(e) => {
                            const next = e.target.value
                            setFormData({ ...formData, phone: next })
                            if (phoneError) setPhoneError(null)
                          }}
                          onBlur={() => {
                            if (formData.phone && !isValidUsPhone(formData.phone)) {
                              setPhoneError('Please enter a valid 10-digit US phone number (or leave blank).')
                            }
                          }}
                          inputMode="tel"
                          autoComplete="tel"
                          aria-invalid={phoneError ? 'true' : 'false'}
                          className={`w-full p-4 border-2 font-medium focus:outline-none transition-all
                             ${phoneError ? 'border-red-600' : ''}
                             ${isRetro ? 'bg-white border-brand-black focus:shadow-pop-sm' : 'bg-gray-50 border-gray-200 rounded-lg'}
                          `}
                        />
                    </div>
                    {phoneError && (
                      <div className="text-sm font-medium text-red-600">
                        {phoneError}
                      </div>
                    )}
                    <input 
                      type="text"
                      className="hidden"
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                    <select
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`w-full p-4 border-2 font-medium focus:outline-none transition-all appearance-none cursor-pointer
                        ${isRetro ? 'bg-white border-brand-black focus:shadow-pop-sm' : 'bg-gray-50 border-gray-200 rounded-lg'}
                      `}
                    >
                      {preferredDateOptions.map((opt) => (
                        <option key={opt.value || opt.label} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
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
                    <label className="flex items-start gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!formData.sendCopy}
                        onChange={(e) => setFormData({ ...formData, sendCopy: e.target.checked })}
                        className="mt-1 h-4 w-4 border-2 border-brand-black"
                      />
                      <span className="font-medium">Send me a copy of my responses</span>
                    </label>
                    {submitError && (
                      <div className="text-sm font-medium text-red-600">
                        {submitError}
                      </div>
                    )}
                    <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending…' : 'Submit Inquiry'}
                    </Button>
                </form>
             )}
          </div>

          {/* Past Events / Credibility */}
          <div>
             <h2 className={`font-display text-3xl mb-8 ${isRetro ? 'text-brand-black' : 'text-black'}`}>Archive</h2>
             <div className="space-y-6">
                {archivePageItems.map(event => (
                    <div key={event.id} className="flex gap-4 group opacity-70 hover:opacity-100 transition-opacity">
                        {event.imageUrl ? (
                          <div className={`w-24 h-24 flex-shrink-0 overflow-hidden ${isRetro ? 'border-2 border-brand-black grayscale' : 'rounded-lg'}`}>
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                          </div>
                        ) : null}
                        <div className="flex-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{event.date}</span>
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-bold text-xl mb-1">{event.title}</h3>
                              {event.linkUrl && (
                                <a
                                  href={event.linkUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-brand-orange transition-colors whitespace-nowrap mt-1"
                                >
                                  Details
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 leading-snug">{event.description}</p>
                        </div>
                    </div>
                ))}
                {pastEvents.length === 0 && (
                  <div className="text-sm text-gray-600 opacity-70">
                    No archived events yet.
                  </div>
                )}
             </div>
             {pastEvents.length > 0 && archiveTotalPages > 1 && (
               <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setArchivePage((p) => Math.max(1, p - 1))}
                   disabled={safeArchivePage <= 1}
                 >
                   Prev
                 </Button>
                 <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                   Page {safeArchivePage} of {archiveTotalPages}
                 </div>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setArchivePage((p) => Math.min(archiveTotalPages, p + 1))}
                   disabled={safeArchivePage >= archiveTotalPages}
                 >
                   Next
                 </Button>
               </div>
             )}
          </div>

        </div>
      </Section>
    </div>
  );
};
