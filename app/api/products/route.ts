import { NextRequest, NextResponse } from "next/server";
import { getCatalogItems } from "@/lib/data/catalog";
import { catalogFilterSchema, productSortSchema, paginationSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters = {
      genre: searchParams.get('genre') || undefined,
      condition: searchParams.get('condition') as any || undefined,
      format: searchParams.get('format') as any || undefined,
      decade: searchParams.get('decade') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      inStock: searchParams.get('inStock') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
    };
    
    const sort = {
      field: (searchParams.get('sortField') as any) || 'title',
      direction: (searchParams.get('sortDirection') as any) || 'asc',
    };
    
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    
    // Validate parameters
    const validatedFilters = catalogFilterSchema.parse(filters);
    const validatedSort = productSortSchema.parse(sort);
    const validatedPagination = paginationSchema.parse({ page, limit });
    
    // Get catalog data using abstraction layer
    const catalog = await getCatalogItems(
      validatedFilters,
      validatedSort,
      validatedPagination.page,
      validatedPagination.limit
    );
    
    return NextResponse.json(catalog);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}