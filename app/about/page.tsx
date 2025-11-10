import Image from "next/image";
import BusinessHours from "@/components/BusinessHours";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Spiral Groove Records",
  description: "Learn about Spiral Groove Records, Milford's premier vinyl shop. Our story, mission, team, and commitment to the music community in Clermont County, OH.",
  alternates: {
    canonical: "https://spiralgrooverecords.com/about",
  },
};

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section bg-gradient-to-b from-neutral-50 to-white">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="groovy-text text-5xl md:text-6xl text-primary-orange mb-6">
            We're not a chain — just two record nerds keeping Milford loud.
          </h1>
          <p className="text-xl text-contrast-navy/80 mb-8">
            More than just a record store – we're a community hub for music lovers, 
            vinyl collectors, and anyone who believes in the magic of analog sound.
          </p>
        </div>
      </section>

      {/* Store History Section */}
      <section className="section">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display font-semibold text-3xl text-text-dark mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-neutral-600">
              <p>
                Founded in 2018, Spiral Groove Records began as a passion project by music enthusiasts 
                who believed that vinyl records deserved more than just a comeback – they deserved a home.
              </p>
              <p>
                What started as a small collection of rare finds in a basement has grown into Milford's 
                premier destination for vinyl lovers. Our store has become a gathering place for collectors, 
                musicians, and music fans of all ages.
              </p>
              <p>
                We're not just selling records; we're preserving musical history, supporting local artists, 
                and creating a community where the love of music brings people together.
              </p>
            </div>
          </div>
          <div className="relative">
            <Image 
              src="/images/placeholders/vinyl.jpg" 
              alt="Spiral Groove Records Store Interior at Spiral Groove Records"
              width={600}
              height={400}
              className="rounded-large shadow-card"
            />
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="section bg-neutral-50">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="font-display font-semibold text-3xl text-text-dark mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            To celebrate the art of vinyl records while fostering a vibrant music community. 
            We believe that music is meant to be experienced, shared, and treasured – and there's 
            no better way to do that than with the warm, authentic sound of vinyl.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="font-semibold text-lg text-text-dark mb-2">Quality Music</h3>
              <p className="text-neutral-600">Curated selection of new releases, rare finds, and timeless classics</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-amber rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-lg text-text-dark mb-2">Community First</h3>
              <p className="text-neutral-600">Building connections through shared love of music and vinyl culture</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-highlight-red rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="font-semibold text-lg text-text-dark mb-2">Support Artists</h3>
              <p className="text-neutral-600">Championing local musicians and providing a platform for live performances</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="section">
        <div className="text-center mb-12">
          <h2 className="font-display font-semibold text-3xl text-text-dark mb-4">
            Meet the Team
          </h2>
          <p className="text-lg text-neutral-600">
            The passionate music lovers who make Spiral Groove Records special
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-32 h-32 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">👨‍💼</span>
            </div>
            <h3 className="font-semibold text-lg text-text-dark mb-2">Mike Rodriguez</h3>
            <p className="text-accent-teal font-medium mb-2">Owner & Founder</p>
            <p className="text-sm text-neutral-600">
              Music industry veteran with 20+ years of experience. Jazz enthusiast and vinyl collector since childhood.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-32 h-32 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">👩‍🎤</span>
            </div>
            <h3 className="font-semibold text-lg text-text-dark mb-2">Sarah Chen</h3>
            <p className="text-accent-teal font-medium mb-2">Store Manager</p>
            <p className="text-sm text-neutral-600">
              Former radio DJ and indie music expert. Knows every album in our collection and can find anything you're looking for.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-32 h-32 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">👨‍🎧</span>
            </div>
            <h3 className="font-semibold text-lg text-text-dark mb-2">David Thompson</h3>
            <p className="text-accent-teal font-medium mb-2">Audio Equipment Specialist</p>
            <p className="text-sm text-neutral-600">
              Turntable technician and audiophile. Helps customers find the perfect setup for their listening experience.
            </p>
          </div>
        </div>
      </section>

      {/* Partnerships Section */}
      <section className="section bg-neutral-50">
        <div className="text-center mb-12">
          <h2 className="font-display font-semibold text-3xl text-text-dark mb-4">
            Community Partnerships
          </h2>
          <p className="text-lg text-neutral-600">
            We're proud to work with local organizations and artists to support the music community
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6">
            <h3 className="font-semibold text-lg text-text-dark mb-3">Local Music Scene</h3>
            <ul className="space-y-2 text-neutral-600">
              <li>• Cincinnati Music Hall - Event partnerships</li>
              <li>• Local radio stations - Album premieres</li>
              <li>• Music schools - Student showcases</li>
              <li>• Recording studios - Artist development</li>
            </ul>
          </div>
          
          <div className="card p-6">
            <h3 className="font-semibold text-lg text-text-dark mb-3">Community Events</h3>
            <ul className="space-y-2 text-neutral-600">
              <li>• Milford Arts Council - Cultural events</li>
              <li>• Local festivals - Vendor partnerships</li>
              <li>• Charity fundraisers - Music donations</li>
              <li>• School programs - Music education</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Store Hours & Location */}
      <section className="section">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-semibold text-3xl text-text-dark mb-6">
              Visit Us
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-text-dark mb-2">Store Hours</h3>
                <BusinessHours variant="full" showStatus={true} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-text-dark mb-2">Location</h3>
                <div className="text-neutral-600">
                  <p>215B Main St</p>
                  <p>Milford, OH 45150</p>
                  <a href="tel:+15136008018" className="mt-2 text-text-dark hover:text-accent-amber transition-colors">(513) 600-8018</a>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-text-dark mb-2">Special Services</h3>
                <ul className="text-neutral-600 space-y-1">
                  <li>• Record cleaning and restoration</li>
                  <li>• Turntable setup and maintenance</li>
                  <li>• Custom vinyl pressing consultation</li>
                  <li>• Private listening sessions</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Image 
              src="/images/placeholders/vinyl.jpg" 
              alt="Store Exterior at Spiral Groove Records"
              width={600}
              height={400}
              className="rounded-large shadow-card"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
