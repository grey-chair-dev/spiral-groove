import { Metadata } from 'next';
import EventSpacePage from '@/components/pages/EventSpacePage';

export const metadata: Metadata = {
  title: 'Event Space Rental | Spiral Groove Records',
  description: 'Host your next event at Spiral Groove Records in Milford, OH. Perfect for concerts, listening parties, workshops, and community gatherings. Inquire today!',
  keywords: 'event space rental milford ohio, concert venue, listening party venue, music event space, spiral groove events',
  openGraph: {
    title: 'Event Space Rental | Spiral Groove Records',
    description: 'Host your next event at Spiral Groove Records in Milford, OH. Perfect for concerts, listening parties, workshops, and community gatherings.',
    type: 'website',
  },
};

export default function EventSpace() {
  return <EventSpacePage />;
}
