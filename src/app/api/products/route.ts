/**
 * Products API Route
 */

import { NextRequest } from 'next/server';
import { productQuerySchema } from '@/lib/validations';
import { 
  createSuccessResponse, 
  createPaginatedResponse,
  validateQueryParams,
  withErrorHandling,
  ApiException,
  ERROR_CODES,
  HTTP_STATUS
} from '@/lib/api-utils';
import { squareClient } from '@/lib/integrations/square';

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Validate query parameters
  const { data: query, error } = validateQueryParams(
    request.nextUrl.searchParams,
    productQuerySchema
  );
  if (error) return error;

  const { page, limit, search, category, condition, priceMin, priceMax, sortBy, sortOrder } = query;

  try {
    // Get products from Square (if enabled) or mock data
    const squareProducts = await squareClient.getProducts();
    
    // Filter products based on query parameters
    let filteredProducts = squareProducts;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }

    if (category) {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }

    if (condition) {
      filteredProducts = filteredProducts.filter(product => product.condition === condition);
    }

    if (priceMin !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price >= priceMin);
    }

    if (priceMax !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price <= priceMax);
    }

    // Sort products
    filteredProducts.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'artist':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'createdAt':
        default:
          aValue = new Date().getTime(); // Mock creation date
          bValue = new Date().getTime();
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginate results
    const total = filteredProducts.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Transform products to match API contract
    const products = paginatedProducts.map(product => ({
      id: product.id,
      title: product.name,
      artist: product.category,
      genre: product.category,
      condition: product.condition,
      price: product.price,
      images: product.images || [],
      description: product.description,
      inStock: product.inStock,
      squareId: product.id,
    }));

    return createPaginatedResponse(
      products,
      {
        page,
        limit,
        total,
        pages,
      },
      'Products retrieved successfully'
    );
  } catch (error) {
    throw new ApiException(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to retrieve products',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
});
