'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { mockBlogPosts } from '@/lib/mock-data';
import { getFeatureFlag } from '@/lib/feature-flags';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: 'vinyl-101' | 'staff-picks' | 'local-music' | 'events' | 'news';
  image: string;
  tags: string[];
  published: boolean;
}

const categoryLabels = {
  'vinyl-101': 'Vinyl 101',
  'staff-picks': 'Staff Picks',
  'local-music': 'Local Music',
  'events': 'Events',
  'news': 'News'
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // In a real app, this would fetch from an API
    const publishedPosts = mockBlogPosts.filter(post => post.published);
    setPosts(publishedPosts);
    setLoading(false);
  }, []);

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const isBlogEnabled = getFeatureFlag('FEATURE_BLOG_ENABLED');

  if (!isBlogEnabled) {
    return (
      <div className="min-h-screen bg-primary-cream py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-display font-bold text-primary-black mb-4">
            Groove Notes Blog
          </h1>
          <p className="text-lg text-neutral-gray mb-8">
            Our blog is currently being set up. Check back soon for vinyl tips, 
            staff picks, and local music features!
          </p>
          <div className="bg-accent-teal/10 border border-accent-teal/20 rounded-large p-6">
            <p className="text-neutral-gray">
              In the meantime, follow us on social media for updates and music recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-cream py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-primary-black mb-4">
            Groove Notes
          </h1>
          <p className="text-lg text-neutral-gray max-w-2xl mx-auto">
            Stories, tips, and insights from the world of vinyl records and music culture
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-accent-teal text-primary-cream'
                : 'bg-neutral-gray/10 text-neutral-gray hover:bg-accent-teal/10 hover:text-accent-teal'
            }`}
          >
            All Posts
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-accent-teal text-primary-cream'
                  : 'bg-neutral-gray/10 text-neutral-gray hover:bg-accent-teal/10 hover:text-accent-teal'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Blog Posts */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
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
        ) : filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                variant="blog"
                className="group cursor-pointer"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative aspect-video overflow-hidden rounded-t-large">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 bg-accent-teal text-primary-cream text-xs px-2 py-1 rounded-full font-semibold">
                      {categoryLabels[post.category]}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-lg text-primary-black mb-2 line-clamp-2 group-hover:text-accent-teal transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-neutral-gray text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-neutral-gray">
                      <span>By {post.author}</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-neutral-gray/10 text-neutral-gray px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-display font-semibold text-primary-black mb-2">
              No posts found
            </h3>
            <p className="text-neutral-gray mb-6">
              {selectedCategory === 'all' 
                ? 'No blog posts are available yet.' 
                : `No posts found in the ${categoryLabels[selectedCategory as keyof typeof categoryLabels]} category.`
              }
            </p>
            {selectedCategory !== 'all' && (
              <Button
                onClick={() => setSelectedCategory('all')}
                variant="outline"
              >
                View All Posts
              </Button>
            )}
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 text-center">
          <div className="bg-accent-teal/5 border border-accent-teal/20 rounded-large p-8">
            <h3 className="text-2xl font-display font-bold text-primary-black mb-4">
              Stay in the Loop
            </h3>
            <p className="text-neutral-gray mb-6 max-w-2xl mx-auto">
              Get notified when we publish new blog posts, plus exclusive content 
              and special offers.
            </p>
            <Link href="/newsletter">
              <Button size="lg">
                Subscribe to Newsletter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
