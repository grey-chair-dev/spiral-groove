import { NextRequest, NextResponse } from 'next/server';
import { getProduct, getInventoryCounts } from '@/lib/integrations/square';
import { getFeatureFlag } from '@/lib/feature-flags';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product from Square (or mock data)
    const squareProduct = await getProduct(productId);
    
    if (!squareProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get inventory counts
    const inventoryCounts = await getInventoryCounts([productId]);
    const inventory = inventoryCounts.find(count => count.catalog_object_id === productId);

    // Convert Square product to our format
    const product = {
      id: squareProduct.id,
      title: squareProduct.item_data.name.split(' - ')[1] || squareProduct.item_data.name,
      artist: squareProduct.item_data.name.split(' - ')[0] || 'Unknown Artist',
      label: 'Unknown Label', // Would come from Square in real implementation
      condition: 'VG+', // Would come from Square in real implementation
      price: squareProduct.item_data.variations[0]?.item_variation_data.price_money.amount || 0,
      currency: squareProduct.item_data.variations[0]?.item_variation_data.price_money.currency || 'USD',
      image: `/images/vinyl/${squareProduct.id}.jpg`, // Placeholder
      images: [
        `/images/vinyl/${squareProduct.id}-1.jpg`,
        `/images/vinyl/${squareProduct.id}-2.jpg`,
        `/images/vinyl/${squareProduct.id}-3.jpg`
      ],
      in_stock: inventory?.state === 'IN_STOCK' || false,
      quantity: inventory ? parseInt(inventory.quantity) : 0,
      tags: [], // Would come from Square in real implementation
      genre: 'Unknown', // Would come from Square in real implementation
      decade: 'Unknown', // Would come from Square in real implementation
      format: 'LP', // Would come from Square in real implementation
      pressing: 'Unknown Pressing', // Would come from Square in real implementation
      year: 1970, // Would come from Square in real implementation
      description: squareProduct.item_data.description || 'No description available',
      sku: squareProduct.id,
      details: {
        pressing: 'Unknown Pressing',
        media_condition: 'VG+',
        sleeve_condition: 'VG',
        format: 'LP'
      }
    };

    // Get related products (simplified - would use recommendation engine in real implementation)
    const relatedProducts = []; // Would fetch from catalog API

    return NextResponse.json({
      product,
      relatedProducts,
      meta: {
        featureFlags: {
          squareLive: getFeatureFlag('FEATURE_SQUARE_LIVE'),
          checkoutEnabled: getFeatureFlag('FEATURE_CHECKOUT_ENABLED'),
          inStorePickup: getFeatureFlag('FEATURE_IN_STORE_PICKUP')
        }
      }
    });

  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
