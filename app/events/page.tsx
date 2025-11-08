"use client";
import Image from "next/image";
import Link from "next/link";
import EventSchema from "@/components/EventSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { trackGetTickets } from "@/lib/analytics";

export default function Events() {
  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "https://spiralgrooverecords.com" },
          { name: "Events", item: "https://spiralgrooverecords.com/events" },
        ]}
      />
      {/* Event Schema for Live Jazz Night */}
      <EventSchema
        eventTitle="Live Jazz Night"
        eventDate="2025-03-15T19:00:00-05:00"
        eventImage="https://spiralgrooverecords.com/images/placeholders/vinyl.jpg"
        eventDescription="Intimate jazz performance featuring local artists in our basement venue"
        performerName="Local Jazz Artists"
        slug="jazz-night"
      />
      {/* Event Schema for Record Fair */}
      <EventSchema
        eventTitle="Record Fair"
        eventDate="2025-04-05T10:00:00-05:00"
        eventImage="https://spiralgrooverecords.com/images/placeholders/vinyl.jpg"
        eventDescription="Monthly vinyl trading events with collectors, dealers, and music lovers"
        slug="record-fair"
      />
      {/* Hero Section */}
      <section className="section bg-gradient-to-b from-neutral-50 to-white">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-display font-bold text-5xl md:text-6xl text-text-dark mb-6">
            Events & Community
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            Join our vibrant music community in our intimate basement event space. 
            From live performances to record fairs, we bring music lovers together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events/book" className="btn">
              Book the Space
            </Link>
            <Link href="/events/past" className="btn-secondary">
              View Past Shows
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Shows */}
      <section className="section">
        <div className="mb-8">
          <h2 className="font-display font-semibold text-3xl text-text-dark mb-2">
            Upcoming Shows
          </h2>
          <p className="text-neutral-600">
            Don't miss these exciting performances in our intimate basement venue. <Link href="/shop" className="text-accent-teal hover:underline">Shop vinyl from featured artists</Link> or <Link href="/events/book" className="text-accent-teal hover:underline">book the space for your event</Link>.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="/images/placeholders/vinyl.jpg" 
                alt="Live Jazz Night event at Spiral Groove Records"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-highlight-red text-text-light">This Saturday</span>
              </div>
              <div className="absolute bottom-4 right-4">
                <span className="badge bg-accent-teal text-text-light">7:00 PM</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-xl mb-2">Live Jazz Night</h3>
              <p className="text-sm text-neutral-600 mb-3">March 15, 2025 • 7:00 PM</p>
              <p className="text-sm text-neutral-600 mb-4">Intimate jazz performance featuring local artists in our basement venue</p>
              <div className="flex gap-2">
                <button 
                  className="btn flex-1" 
                  aria-label="Get tickets for Live Jazz Night"
                  onClick={() => trackGetTickets("Live Jazz Night")}
                >
                  Get Tickets
                </button>
                <button className="btn-secondary" aria-label="Learn more about Live Jazz Night">Learn More</button>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="/images/placeholders/vinyl.jpg" 
                alt="Record Fair event at Spiral Groove Records"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-accent-amber text-text-dark">Monthly</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-xl mb-2">Record Fair</h3>
              <p className="text-sm text-neutral-600 mb-3">First Saturday of every month</p>
              <p className="text-sm text-neutral-600 mb-4">Monthly vinyl trading events with collectors, dealers, and music lovers</p>
              <div className="flex gap-2">
                <button className="btn flex-1" aria-label="Learn more about Record Fair">Learn More</button>
                <button className="btn-secondary" aria-label="Vendor information for Record Fair">Vendor Info</button>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="/images/placeholders/vinyl.jpg" 
                alt="Acoustic Sessions event at Spiral Groove Records"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-accent-teal text-text-light">Weekly</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-xl mb-2">Acoustic Sessions</h3>
              <p className="text-sm text-neutral-600 mb-3">Every Wednesday • 6:00 PM</p>
              <p className="text-sm text-neutral-600 mb-4">Open mic and acoustic performances in our cozy basement space</p>
              <div className="flex gap-2">
                <button className="btn flex-1" aria-label="Sign up for Acoustic Sessions">Sign Up</button>
                <button className="btn-secondary" aria-label="Listen to Acoustic Sessions">Listen</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Details */}
      <section className="section bg-neutral-50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display font-semibold text-3xl text-text-dark mb-6">
              Our Event Space
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-text-dark mb-2">Capacity & Setup</h3>
                <p className="text-neutral-600">Intimate basement venue perfect for 30-50 guests. Cozy atmosphere with vintage vinyl décor and professional sound system.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-text-dark mb-2">Amenities</h3>
                <ul className="text-neutral-600 space-y-1">
                  <li>• Professional sound system</li>
                  <li>• Stage lighting</li>
                  <li>• Bar service available</li>
                  <li>• Parking available</li>
                  <li>• Wheelchair accessible</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-text-dark mb-2">Perfect For</h3>
                <p className="text-neutral-600">Live music, private parties, album release shows, community events, and intimate performances.</p>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/events/book" className="btn">
                Book Your Event
              </Link>
            </div>
          </div>
          <div className="relative">
            <Image 
              src="/images/placeholders/vinyl.jpg" 
              alt="Event Space Interior at Spiral Groove Records"
              width={600}
              height={400}
              className="rounded-large shadow-card"
            />
          </div>
        </div>
      </section>

      {/* Past Performances Preview */}
      <section className="section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-semibold text-3xl text-text-dark mb-2">
              Recent Performances
            </h2>
            <p className="text-neutral-600">A glimpse of the amazing artists who've graced our stage</p>
          </div>
          <Link href="/events/past" className="link">View All Past Shows</Link>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="/images/placeholders/vinyl.jpg" 
                alt="Blues Night event at Spiral Groove Records"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-accent-amber text-text-dark">Past Show</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-lg mb-1">Blues Night</h3>
              <p className="text-sm text-neutral-600 mb-3">February 28, 2025</p>
              <p className="text-sm text-neutral-600">Local blues artists brought the house down with soulful performances</p>
            </div>
          </div>

          <div className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="/images/placeholders/vinyl.jpg" 
                alt="Folk Session event at Spiral Groove Records"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-accent-amber text-text-dark">Past Show</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-lg mb-1">Folk Session</h3>
              <p className="text-sm text-neutral-600 mb-3">February 21, 2025</p>
              <p className="text-sm text-neutral-600">Intimate folk performances with storytelling and acoustic melodies</p>
            </div>
          </div>

          <div className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-video relative">
              <Image 
                src="/images/placeholders/vinyl.jpg" 
                alt="Vinyl Listening Party event at Spiral Groove Records"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="badge bg-accent-amber text-text-dark">Past Show</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-lg mb-1">Vinyl Listening Party</h3>
              <p className="text-sm text-neutral-600 mb-3">February 14, 2025</p>
              <p className="text-sm text-neutral-600">Community listening session featuring rare and new vinyl releases</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
