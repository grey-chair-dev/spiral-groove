import { Metadata } from 'next';
import BlogPage from '@/components/pages/BlogPage';

export const metadata: Metadata = {
  title: 'Groove Notes Blog | Spiral Groove Records',
  description: 'Read our latest blog posts about vinyl records, music culture, local artists, and vinyl care tips at Spiral Groove Records.',
  keywords: 'vinyl blog, music blog, vinyl care tips, local music, record store blog, milford ohio',
  openGraph: {
    title: 'Groove Notes Blog | Spiral Groove Records',
    description: 'Read our latest blog posts about vinyl records, music culture, and vinyl care tips.',
    type: 'website',
  },
};

export default function Blog() {
  return <BlogPage />;
}
