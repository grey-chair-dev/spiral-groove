export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Spiral Groove Records",
    "image": "https://spiralgrooverecords.com/images/storefront.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "215B Main St",
      "addressLocality": "Milford",
      "addressRegion": "OH",
      "postalCode": "45150",
      "addressCountry": "US"
    },
    "telephone": "+1-513-600-8018",
    "openingHours": "Mo-Su 12:00-21:00",
    "url": "https://spiralgrooverecords.com",
    "priceRange": "$$",
    "sameAs": [
      "https://www.instagram.com/spiral_groove_records_/",
      "https://www.facebook.com/spiralgrooverecords/",
      "https://www.tiktok.com/@spiral_groove"
    ]
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

