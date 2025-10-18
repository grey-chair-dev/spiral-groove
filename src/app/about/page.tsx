import { Metadata } from 'next';
import About from '@/components/sections/About';

export const metadata: Metadata = {
  title: 'About Us | Spiral Groove Records',
  description: 'Learn about Spiral Groove Records - your neighborhood vinyl record store in Milford, OH. Discover our story, mission, and commitment to the music community.',
  keywords: 'about spiral groove records, milford ohio record store, vinyl record store history, music community',
  openGraph: {
    title: 'About Us | Spiral Groove Records',
    description: 'Learn about Spiral Groove Records - your neighborhood vinyl record store in Milford, OH.',
    type: 'website',
  },
};

export default function AboutPage() {
  return <About showFullContent={true} />;
}
