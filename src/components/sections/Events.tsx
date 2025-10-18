'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  capacity: number;
  image: string;
  price?: number;
  location: string;
  type: 'concert' | 'listening-party' | 'workshop' | 'meetup';
  status: 'upcoming' | 'past' | 'cancelled';
}

interface EventsProps {
  events?: Event[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  maxItems?: number;
}

const eventTypeLabels = {
  concert: 'Concert',
  'listening-party': 'Listening Party',
  workshop: 'Workshop',
  meetup: 'Meetup'
};

export default function Events({
  events = [],
  title = 'Upcoming Events',
  subtitle = 'Join us for live music, listening parties, and community gatherings',
  showViewAll = true,
  maxItems = 3
}: EventsProps) {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const mockEvents: Event[] = [
      {
        id: 'vinyl-listening-party-2024-01',
        title: 'Vinyl Listening Party: Classic Rock Night',
        date: '2024-01-15',
        time: '7:00 PM',
        description: 'Join us for an evening of classic rock vinyl listening. We\'ll spin some of the greatest albums from the 60s and 70s.',
        capacity: 30,
        image: '/images/events/classic-rock-night.jpg',
        price: 10,
        location: 'Spiral Groove Records Event Space',
        type: 'listening-party',
        status: 'upcoming'
      },
      {
        id: 'local-band-showcase-2024-01',
        title: 'Local Band Showcase: The Milford Sessions',
        date: '2024-01-22',
        time: '8:00 PM',
        description: 'Supporting local talent! Three amazing local bands performing live in our event space.',
        capacity: 50,
        image: '/images/events/local-band-showcase.jpg',
        price: 15,
        location: 'Spiral Groove Records Event Space',
        type: 'concert',
        status: 'upcoming'
      },
      {
        id: 'turntable-workshop-2024-02',
        title: 'Turntable Setup & Maintenance Workshop',
        date: '2024-02-05',
        time: '2:00 PM',
        description: 'Learn how to properly set up and maintain your turntable. Bring your own equipment!',
        capacity: 20,
        image: '/images/events/turntable-workshop.jpg',
        price: 25,
        location: 'Spiral Groove Records Event Space',
        type: 'workshop',
        status: 'upcoming'
      }
    ];

    if (events.length > 0) {
      setUpcomingEvents(events.slice(0, maxItems));
    } else {
      setUpcomingEvents(mockEvents.slice(0, maxItems));
    }
    setLoading(false);
  }, [events, maxItems]);

  if (loading) {
    return (
      <section className="py-16 bg-accent-teal/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-primary-black mb-4">
              {title}
            </h2>
            <p className="text-lg text-neutral-gray">
              {subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-neutral-gray/20 rounded-t-large" />
                <CardContent className="p-6">
                  <div className="h-4 bg-neutral-gray/20 rounded mb-2" />
                  <div className="h-3 bg-neutral-gray/20 rounded mb-2" />
                  <div className="h-3 bg-neutral-gray/20 rounded mb-4" />
                  <div className="h-4 bg-neutral-gray/20 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-accent-teal/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-primary-black mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-gray max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event, index) => (
            <Card
              key={event.id}
              variant="event"
              className="group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link href={`/event-space#${event.id}`}>
                <div className="relative aspect-video overflow-hidden rounded-t-large">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  
                  {/* Event type badge */}
                  <div className="absolute top-3 left-3 bg-accent-amber text-primary-black text-xs px-2 py-1 rounded-full font-semibold">
                    {eventTypeLabels[event.type]}
                  </div>

                  {/* Date badge */}
                  <div className="absolute top-3 right-3 bg-primary-black/80 text-primary-cream text-xs px-2 py-1 rounded-full">
                    {formatDate(event.date, { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-lg text-primary-cream mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-primary-cream/80 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {formatDate(event.date, { weekday: 'long', month: 'long', day: 'numeric' })} at {event.time}
                    </div>
                    
                    <div className="flex items-center text-primary-cream/80 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {event.location}
                    </div>
                  </div>

                  <p className="text-primary-cream/80 text-sm line-clamp-3 mb-4">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-accent-amber font-semibold">
                      {event.price ? formatCurrency(event.price, 'USD') : 'Free'}
                    </div>
                    <div className="text-primary-cream/60 text-xs">
                      {event.capacity} capacity
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {showViewAll && (
          <div className="text-center mt-12">
            <Link href="/event-space">
              <Button size="lg" variant="outline" className="border-accent-teal text-accent-teal hover:bg-accent-teal hover:text-primary-cream">
                View All Events
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
