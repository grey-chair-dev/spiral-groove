import { CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

// Mock events data - in a real app, this would come from an API
const events = [
  {
    id: 1,
    title: "Vinyl Listening Party: Jazz Classics",
    date: "2025-10-15",
    time: "7:00 PM",
    location: "Spiral Groove Records",
    description: "Join us for an evening of classic jazz records. We'll be spinning some of the greatest jazz albums from our collection.",
    price: 0,
    rsvpCount: 24,
    maxCapacity: 50,
    image: "/api/placeholder/400/300"
  },
  {
    id: 2,
    title: "Record Store Day 2025",
    date: "2025-10-20",
    time: "9:00 AM - 9:00 PM",
    location: "Spiral Groove Records",
    description: "Celebrate Record Store Day with exclusive releases, special discounts, and live music throughout the day.",
    price: 0,
    rsvpCount: 89,
    maxCapacity: 200,
    image: "/api/placeholder/400/300"
  },
  {
    id: 3,
    title: "Artist Meet & Greet: Local Band Showcase",
    date: "2025-10-25",
    time: "6:00 PM",
    location: "Spiral Groove Records",
    description: "Meet local artists and discover new music. Live acoustic performances and Q&A sessions.",
    price: 15,
    rsvpCount: 12,
    maxCapacity: 30,
    image: "/api/placeholder/400/300"
  }
];

export default function EventsPage() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Upcoming Events
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join us for listening parties, artist meet-and-greets, and special events that celebrate music culture.
          </p>
        </div>

        <div className="mt-16 space-y-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <div className="h-48 md:h-full bg-gray-200 flex items-center justify-center">
                    <CalendarIcon className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {event.price === 0 ? 'Free' : `$${event.price}`}
                      </div>
                      <div className="text-sm text-gray-500 mb-4">
                        {event.rsvpCount}/{event.maxCapacity} RSVPs
                      </div>
                      <button className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        RSVP
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No upcoming events</h3>
            <p className="mt-1 text-sm text-gray-500">
              Check back soon for new events and listening parties.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

