import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Spiral Groove Records | Vinyl Records in Milford, OH',
  description: 'Discover your groove at Spiral Groove Records - your premier destination for vinyl records, events, and music community in Milford, OH. New and used vinyl, audio equipment, and event space.',
  keywords: 'vinyl records, milford ohio, cincinnati record stores, buy vinyl online, used vinyl records, new vinyl releases, record store events',
  authors: [{ name: 'Spiral Groove Records' }],
  openGraph: {
    title: 'Spiral Groove Records | Vinyl Records in Milford, OH',
    description: 'Discover your groove at Spiral Groove Records - your premier destination for vinyl records, events, and music community in Milford, OH.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Spiral Groove Records',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spiral Groove Records | Vinyl Records in Milford, OH',
    description: 'Discover your groove at Spiral Groove Records - your premier destination for vinyl records, events, and music community in Milford, OH.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-primary-cream text-primary-black flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}