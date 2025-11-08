import { NextRequest, NextResponse } from 'next/server';
import { squareClient, isSquareConfigured } from '@/lib/square';

export async function GET(request: NextRequest) {
  try {
    if (!isSquareConfigured()) {
      return NextResponse.json(
        { 
          products: [],
          message: 'Square API not configured. Please add your Square credentials to .env.local'
        },
        { status: 200 }
      );
    }

    const { catalogApi } = squareClient;
    const response = await catalogApi.listCatalog();

    if (response.result?.objects) {
      const items = response.result.objects.filter((item: any) => item.type === 'ITEM');
      const allObjects = response.result.objects; // For category lookup
      
      // Get categories for lookup
      const categories = allObjects.filter((obj: any) => obj.type === 'CATEGORY');
      const categoryMap = new Map(
        categories.map((cat: any) => [cat.id, cat.categoryData?.name])
      );
      
      const products = items.map((item: any) => {
        const itemData = item.itemData;
        const variation = itemData?.variations?.[0];
        const variationData = variation?.itemVariationData;
        const priceMoney = variationData?.priceMoney;
        
        return {
          id: item.id,
          name: itemData?.name || 'Unknown Product',
          description: itemData?.description,
          price: priceMoney ? priceMoney.amount : 0, // Already in cents
          currency: priceMoney?.currency || 'USD',
          imageUrl: itemData?.imageIds?.[0] 
            ? undefined // Will be handled by placeholder system until Square images are configured
            : undefined,
          category: itemData?.categoryId 
            ? categoryMap.get(itemData.categoryId) || itemData.categoryId
            : undefined,
          inStock: variationData?.trackInventory !== false,
          quantity: variationData?.inventoryAlertThreshold,
        };
      });

      return NextResponse.json({ products });
    }

    return NextResponse.json({ products: [] });
  } catch (error) {
    console.error('Error fetching Square products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
