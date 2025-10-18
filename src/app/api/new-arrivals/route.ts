import { NextRequest, NextResponse } from 'next/server';
import { getNewArrivals } from '@/lib/integrations/square';
import { getFeatureFlag } from '@/lib/feature-flags';
import { PAGINATION } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const days = parseInt(searchParams.get('days') || '14');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20'),
      PAGINATION.maxPageSize
    );

    // Get new arrivals from Square (or mock data)
    const squareProducts = await getNewArrivals(days);
    
    // Convert Square products to our format
    const products = squareProducts.map(item => ({
      id: item.id,
      title: item.item_data.name.split(' - ')[1] || item.item_data.name,
      artist: item.item_data.name.split(' - ')[0] || 'Unknown Artist',
      label: 'Unknown Label', // Would come from Square in real implementation
      condition: 'VG+', // Would come from Square in real implementation
      price: item.item_data.variations[0]?.item_variation_data.price_money.amount || 0,
      currency: item.item_data.variations[0]?.item_variation_data.price_money.currency || 'USD',
      image: `/images/vinyl/${item.id}.jpg`, // Placeholder
      in_stock: true, // Would come from inventory API
      tags: [], // Would come from Square in real implementation
      genre: 'Unknown', // Would come from Square in real implementation
      decade: 'Unknown', // Would come from Square in real implementation
      format: 'LP', // Would come from Square in real implementation
      added_date: new Date().toISOString() // Would come from Square in real implementation
    }));

    // Apply limit
    const limitedProducts = products.slice(0, limit);

    return NextResponse.json({
      items: limitedProducts,
      meta: {
        days,
        totalItems: products.length,
        returnedItems: limitedProducts.length,
        featureFlags: {
          squareLive: getFeatureFlag('FEATURE_SQUARE_LIVE'),
          checkoutEnabled: getFeatureFlag('FEATURE_CHECKOUT_ENABLED')
        }
      }
    });

  } catch (error) {
    console.error('New arrivals API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch new arrivals',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
