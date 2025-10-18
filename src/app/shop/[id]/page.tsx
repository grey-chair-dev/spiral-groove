import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductPage from '@/components/pages/ProductPage';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  // In a real app, you would fetch the product data here
  const productId = params.id;
  
  return {
    title: `Product Details | Spiral Groove Records`,
    description: 'View detailed information about this vinyl record at Spiral Groove Records.',
    openGraph: {
      title: `Product Details | Spiral Groove Records`,
      description: 'View detailed information about this vinyl record.',
      type: 'website',
    },
  };
}

export default function Product({ params }: ProductPageProps) {
  const productId = params.id;

  if (!productId) {
    notFound();
  }

  return <ProductPage productId={productId} />;
}
