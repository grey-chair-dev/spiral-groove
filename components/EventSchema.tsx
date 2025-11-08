interface EventSchemaProps {
  eventTitle: string;
  eventDate: string;
  eventImage?: string;
  eventDescription?: string;
  performerName?: string;
  slug?: string;
  price?: string;
}

export default function EventSchema({
  eventTitle,
  eventDate,
  eventImage,
  eventDescription,
  performerName,
  slug,
  price = "0",
}: EventSchemaProps) {
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    "name": eventTitle,
    "startDate": eventDate,
    "location": {
      "@type": "Place",
      "name": "Spiral Groove Records",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "215B Main St",
        "addressLocality": "Milford",
        "addressRegion": "OH",
        "postalCode": "45150",
        "addressCountry": "US"
      }
    },
    "image": eventImage || "https://spiralgrooverecords.com/images/placeholders/vinyl.jpg",
    "description": eventDescription || `${eventTitle} at Spiral Groove Records in Milford, OH.`,
    "performer": performerName ? {
      "@type": "MusicGroup",
      "name": performerName
    } : undefined,
    "offers": {
      "@type": "Offer",
      "url": `https://spiralgrooverecords.com/events${slug ? `/${slug}` : ''}`,
      "price": price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  // Remove undefined fields
  const cleanedSchema = JSON.parse(JSON.stringify(eventSchema));

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedSchema) }}
    />
  );
}

