import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Community | Spiral Groove Records",
  description: "Join live music performances, record fairs, and community events at Spiral Groove Records. Book our intimate basement venue for your next event in Milford, OH.",
  alternates: {
    canonical: "https://spiralgrooverecords.com/events",
  },
  openGraph: {
    title: "Events & Community | Spiral Groove Records",
    description: "Join live music performances, record fairs, and community events at Spiral Groove Records.",
    url: "https://spiralgrooverecords.com/events",
    images: [{ url: "https://spiralgrooverecords.com/images/og-events.jpg", width: 1200, height: 630 }],
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

