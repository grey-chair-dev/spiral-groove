import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/integrations/square';
import { getFeatureFlag } from '@/lib/feature-flags';
import { PAGINATION } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const query = searchParams.get('q') || undefined;
    const genre = searchParams.get('genre') || undefined;
    const condition = searchParams.get('condition') || undefined;
    const decade = searchParams.get('decade') || undefined;
    const format = searchParams.get('format') || undefined;
    const minPrice = searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined;
    const maxPrice = searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || PAGINATION.defaultPageSize.toString()),
      PAGINATION.maxPageSize
    );
    const sort = searchParams.get('sort') || 'relevance';

    // Build filters object
    const filters: Record<string, string> = {};
    if (genre) filters.genre = genre;
    if (condition) filters.condition = condition;
    if (decade) filters.decade = decade;
    if (format) filters.format = format;

    // Get products from Square (or mock data)
    const squareProducts = await searchProducts(query, filters);
    
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
      genre: genre || 'Unknown',
      decade: decade || 'Unknown',
      format: format || 'LP'
    }));

    // Apply price filtering
    let filteredProducts = products;
    if (minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'title_asc':
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'artist_asc':
        filteredProducts.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'artist_desc':
        filteredProducts.sort((a, b) => b.artist.localeCompare(a.artist));
        break;
      case 'newest':
        // Would sort by creation date in real implementation
        break;
      default:
        // relevance - keep original order
        break;
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Calculate pagination info
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Generate cursor for next page (simplified)
    const nextCursor = hasNextPage ? btoa(JSON.stringify({ page: page + 1 })) : null;
    const prevCursor = hasPrevPage ? btoa(JSON.stringify({ page: page - 1 })) : null;

    return NextResponse.json({
      items: paginatedProducts,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextCursor,
        prevCursor
      },
      filters: {
        query,
        genre,
        condition,
        decade,
        format,
        minPrice,
        maxPrice,
        sort
      },
      meta: {
        featureFlags: {
          squareLive: getFeatureFlag('FEATURE_SQUARE_LIVE'),
          checkoutEnabled: getFeatureFlag('FEATURE_CHECKOUT_ENABLED')
        }
      }
    });

  } catch (error) {
    console.error('Catalog API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch catalog',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
