import { Metadata } from 'next';
import ContactPage from '@/components/pages/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Us | Spiral Groove Records',
  description: 'Get in touch with Spiral Groove Records in Milford, OH. Visit our store, call us, or send us a message. We\'re here to help with all your vinyl needs.',
  keywords: 'contact spiral groove records, milford ohio record store, vinyl record store contact, music store hours',
  openGraph: {
    title: 'Contact Us | Spiral Groove Records',
    description: 'Get in touch with Spiral Groove Records in Milford, OH. Visit our store, call us, or send us a message.',
    type: 'website',
  },
};

export default function Contact() {
  return <ContactPage />;
}
