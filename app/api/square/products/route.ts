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
      const products = response.result.objects
        .filter(item => item.type === 'ITEM')
        .map(item => ({
          id: item.id,
          name: item.itemData?.name || 'Unknown Product',
          description: item.itemData?.description,
          price: item.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.amount || 0,
          currency: item.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.currency || 'USD',
          imageUrl: item.itemData?.imageIds?.[0] ? 
            `https://squareup.com/img/catalog/${item.itemData.imageIds[0]}.jpg` : undefined,
          category: item.itemData?.categoryId,
          inStock: item.itemData?.variations?.[0]?.itemVariationData?.trackInventory !== false,
          quantity: item.itemData?.variations?.[0]?.itemVariationData?.inventoryAlertThreshold,
        }));

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
