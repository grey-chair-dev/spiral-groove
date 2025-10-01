import Link from 'next/link';
import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

// Mock blog posts data - in a real app, this would come from a CMS or API
const blogPosts = [
  {
    id: 1,
    title: "The Vinyl Revival: Why Records Are Making a Comeback",
    excerpt: "Explore the reasons behind the resurgence of vinyl records and what makes them special in our digital age.",
    author: "John Doe",
    date: "2025-09-28",
    readTime: "5 min read",
    category: "Industry News",
    image: "/api/placeholder/400/250"
  },
  {
    id: 2,
    title: "Staff Picks: Our Favorite Jazz Albums of All Time",
    excerpt: "Our team shares their personal favorite jazz records that every collector should have in their collection.",
    author: "Sarah Miller",
    date: "2025-09-25",
    readTime: "8 min read",
    category: "Staff Picks",
    image: "/api/placeholder/400/250"
  },
  {
    id: 3,
    title: "Caring for Your Vinyl Collection: A Complete Guide",
    excerpt: "Learn the best practices for storing, cleaning, and maintaining your vinyl records to keep them in perfect condition.",
    author: "Mike Johnson",
    date: "2025-09-22",
    readTime: "6 min read",
    category: "Care Tips",
    image: "/api/placeholder/400/250"
  },
  {
    id: 4,
    title: "Local Artist Spotlight: The Rising Stars in Our Community",
    excerpt: "Discover the talented local musicians whose records we're proud to carry in our store.",
    author: "Sarah Miller",
    date: "2025-09-20",
    readTime: "4 min read",
    category: "Local Artists",
    image: "/api/placeholder/400/250"
  },
  {
    id: 5,
    title: "Record Store Day 2025: What to Expect",
    excerpt: "Everything you need to know about this year's Record Store Day celebrations and exclusive releases.",
    author: "John Doe",
    date: "2025-09-18",
    readTime: "7 min read",
    category: "Events",
    image: "/api/placeholder/400/250"
  },
  {
    id: 6,
    title: "Building Your First Vinyl Setup: A Beginner's Guide",
    excerpt: "New to vinyl? Here's everything you need to know to start your vinyl journey with the right equipment.",
    author: "Mike Johnson",
    date: "2025-09-15",
    readTime: "10 min read",
    category: "Equipment",
    image: "/api/placeholder/400/250"
  }
];

const categories = ['All', 'Industry News', 'Staff Picks', 'Care Tips', 'Local Artists', 'Events', 'Equipment'];

export default function BlogPage() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Music Blog
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Discover music insights, vinyl care tips, artist spotlights, and more from our team of music experts.
            </p>
          </div>
        </div>
      </div>

      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Category Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === 'All'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <article key={post.id} className="flex flex-col">
                <div className="aspect-video w-full bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <CalendarIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-x-4 text-xs mb-2">
                    <time dateTime={post.date} className="text-gray-500">
                      {formatDate(post.date)}
                    </time>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">{post.readTime}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-indigo-600 font-medium">{post.category}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-x-2 text-sm text-gray-500">
                    <UserIcon className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="mt-12 text-center">
            <button className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Load More Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

