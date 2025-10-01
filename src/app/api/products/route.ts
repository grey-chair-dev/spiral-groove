import { NextRequest, NextResponse } from 'next/server';
import { SquareService } from '@/lib/square';
import { CacheService } from '@/lib/redis';
import { ProductsResponse, ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Try to get cached products first
    let products = await CacheService.getCachedProducts();

    if (!products) {
      // Fetch from Square API
      products = await SquareService.getProducts();
      
      // Cache the products
      await CacheService.cacheProducts(products);
    }

    // Apply filters
    let filteredProducts = products;

    if (category) {
      filteredProducts = filteredProducts.filter(
        product => product.category === category
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product => 
          product.name.toLowerCase().includes(searchLower) ||
          product.artist?.toLowerCase().includes(searchLower) ||
          product.album?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const response: ApiResponse<ProductsResponse> = {
      success: true,
      data: {
        products: paginatedProducts,
        total: filteredProducts.length,
        page,
        limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch products',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, productId } = body;

    if (action === 'refresh') {
      // Force refresh products from Square
      const products = await SquareService.getProducts();
      await CacheService.cacheProducts(products);
      
      return NextResponse.json({ success: true });
    }

    if (action === 'invalidate' && productId) {
      // Invalidate specific product cache
      await CacheService.invalidateProductCache(productId);
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing product action:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

