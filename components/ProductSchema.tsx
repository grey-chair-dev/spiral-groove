interface ProductSchemaProps {
  title: string;
  artist?: string;
  imageUrl?: string;
  price: number;
  productId: string;
  slug?: string;
  inStock?: boolean;
}

export default function ProductSchema({
  title,
  artist,
  imageUrl,
  price,
  productId,
  slug,
  inStock = true,
}: ProductSchemaProps) {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": title,
    "brand": artist ? {
      "@type": "Brand",
      "name": artist
    } : undefined,
    "image": imageUrl || "https://spiralgrooverecords.com/images/placeholders/vinyl.jpg",
    "description": `${title}${artist ? ` by ${artist}` : ''} available at Spiral Groove Records.`,
    "sku": productId,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": price.toString(),
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `https://spiralgrooverecords.com/shop${slug ? `/${slug}` : `?id=${productId}`}`,
      "seller": {
        "@type": "LocalBusiness",
        "name": "Spiral Groove Records"
      }
    }
  };

  // Remove undefined fields
  const cleanedSchema = JSON.parse(JSON.stringify(productSchema));

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedSchema) }}
    />
  );
}

