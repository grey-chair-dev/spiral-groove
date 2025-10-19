import Image from "next/image";

// Mock data for past shows
const pastShows = [
  {
    id: 1,
    title: "Blues Night",
    date: "February 28, 2025",
    artist: "The Delta Kings",
    description: "Local blues artists brought the house down with soulful performances",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    genre: "Blues"
  },
  {
    id: 2,
    title: "Folk Session",
    date: "February 21, 2025",
    artist: "Mountain Echo",
    description: "Intimate folk performances with storytelling and acoustic melodies",
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    genre: "Folk"
  },
  {
    id: 3,
    title: "Vinyl Listening Party",
    date: "February 14, 2025",
    artist: "Community Event",
    description: "Community listening session featuring rare and new vinyl releases",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    genre: "Various"
  },
  {
    id: 4,
    title: "Jazz Collective",
    date: "February 7, 2025",
    artist: "The Spiral Jazz Quartet",
    description: "Smooth jazz and bebop in our intimate basement setting",
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    genre: "Jazz"
  },
  {
    id: 5,
    title: "Indie Showcase",
    date: "January 31, 2025",
    artist: "Local Indie Artists",
    description: "Showcase of emerging indie artists from the Cincinnati area",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    genre: "Indie"
  },
  {
    id: 6,
    title: "Record Fair",
    date: "January 25, 2025",
    artist: "Various Vendors",
    description: "Monthly vinyl trading event with collectors and dealers",
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    genre: "Event"
  },
  {
    id: 7,
    title: "Acoustic Night",
    date: "January 18, 2025",
    artist: "Singer-Songwriter Circle",
    description: "Open mic night featuring local singer-songwriters",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    genre: "Acoustic"
  },
  {
    id: 8,
    title: "Rock Revival",
    date: "January 11, 2025",
    artist: "The Vinyl Rebels",
    description: "Classic rock covers and original compositions",
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    genre: "Rock"
  },
  {
    id: 9,
    title: "Soul Session",
    date: "January 4, 2025",
    artist: "The Groove Collective",
    description: "Soul and R&B performances that got everyone dancing",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    genre: "Soul"
  }
];

export default function PastShows() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section bg-gradient-to-b from-neutral-50 to-white">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-display font-bold text-5xl md:text-6xl text-text-dark mb-6">
            Past Performances
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            Relive the magic of past performances in our intimate basement venue. 
            From blues to jazz, folk to rock, we've hosted incredible artists and unforgettable nights.
          </p>
        </div>
      </section>

      {/* Filter Options */}
      <section className="section">
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="btn-secondary">All Shows</button>
          <button className="btn-secondary">Blues</button>
          <button className="btn-secondary">Jazz</button>
          <button className="btn-secondary">Folk</button>
          <button className="btn-secondary">Rock</button>
          <button className="btn-secondary">Events</button>
        </div>

        {/* Shows Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pastShows.map((show) => (
            <div key={show.id} className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-video relative">
                <Image 
                  src={show.image}
                  alt={show.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="badge bg-accent-amber text-text-dark">{show.genre}</span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="badge bg-accent-teal text-text-light">{show.date}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display font-semibold text-xl mb-2">{show.title}</h3>
                <p className="text-sm text-neutral-600 mb-2 font-medium">{show.artist}</p>
                <p className="text-sm text-neutral-600 mb-4">{show.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">{show.date}</span>
                  <button className="text-accent-teal hover:text-accent-amber text-sm font-medium transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="btn-secondary">
            Load More Shows
          </button>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section bg-neutral-50">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display font-semibold text-3xl text-text-dark mb-4">
            Want to Perform at Spiral Groove?
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            We're always looking for talented artists to perform in our intimate venue. 
            Whether you're a solo act or a full band, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/events/book" className="btn">
              Book Your Show
            </a>
            <a href="/contact" className="btn-secondary">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
