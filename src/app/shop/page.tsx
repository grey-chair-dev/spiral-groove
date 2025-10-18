import { Metadata } from 'next';
import ShopPage from '@/components/pages/ShopPage';

export const metadata: Metadata = {
  title: 'Shop Vinyl Records | Spiral Groove Records',
  description: 'Browse our collection of new and used vinyl records. Find rare finds, new releases, and classic albums at Spiral Groove Records in Milford, OH.',
  keywords: 'vinyl records, buy vinyl online, new vinyl, used vinyl, milford ohio, record store',
  openGraph: {
    title: 'Shop Vinyl Records | Spiral Groove Records',
    description: 'Browse our collection of new and used vinyl records. Find rare finds, new releases, and classic albums.',
    type: 'website',
  },
};

export default function Shop() {
  return <ShopPage />;
}
