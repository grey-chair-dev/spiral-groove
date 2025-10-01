import { CheckIcon } from '@heroicons/react/24/outline';

const features = [
  'Curated selection of new and used vinyl records',
  'Expert staff with deep music knowledge',
  'Regular listening parties and events',
  'Community-focused approach to music',
  'Support for local artists and musicians',
  'High-quality audio equipment for testing',
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              About Spiral Groove Records
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Your local record store for music lovers, collectors, and anyone who appreciates the vinyl experience.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
              <div className="max-w-xl lg:max-w-lg">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Our Story
                </h2>
                <p className="mt-4 text-lg leading-8 text-gray-600">
                  Founded in 2020, Spiral Groove Records was born from a passion for music and the vinyl experience. 
                  We believe that music is meant to be heard, felt, and shared in its purest form.
                </p>
                <p className="mt-6 text-base leading-7 text-gray-600">
                  Our team of music enthusiasts carefully curates every record in our collection, from rare vintage 
                  finds to the latest releases. We're not just a store – we're a community hub for music lovers 
                  who appreciate the art of vinyl.
                </p>
              </div>
              <div className="flex flex-col gap-8 sm:gap-12">
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
                  <p className="text-gray-600">
                    To preserve and celebrate the vinyl experience while building a community of music lovers 
                    who share our passion for authentic sound and musical discovery.
                  </p>
                </div>
                <div className="bg-gray-50 p-8 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Values</h3>
                  <p className="text-gray-600">
                    Quality, authenticity, community, and a deep respect for the art of music. We believe 
                    every record tells a story, and we're here to help you discover yours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center mb-16">
              Why Choose Spiral Groove?
            </h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-base text-gray-700">{feature}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our passionate team of music experts is here to help you discover your next favorite record.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600">JD</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">John Doe</h3>
              <p className="mt-2 text-base text-gray-600">Store Manager & Vinyl Expert</p>
              <p className="mt-2 text-sm text-gray-500">
                John has been collecting vinyl for over 20 years and specializes in jazz and classical music.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600">SM</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Sarah Miller</h3>
              <p className="mt-2 text-base text-gray-600">Music Buyer & Events Coordinator</p>
              <p className="mt-2 text-sm text-gray-500">
                Sarah curates our new arrivals and organizes our listening parties and special events.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600">MJ</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Mike Johnson</h3>
              <p className="mt-2 text-base text-gray-600">Technical Specialist</p>
              <p className="mt-2 text-sm text-gray-500">
                Mike handles our audio equipment and helps customers test records before purchase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

