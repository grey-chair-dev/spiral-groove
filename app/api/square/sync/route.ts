import { NextRequest, NextResponse } from 'next/server';
import { squareClient, isSquareConfigured } from '@/lib/square';

export async function POST(request: NextRequest) {
  try {
    if (!isSquareConfigured()) {
      return NextResponse.json(
        { error: 'Square API not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { type } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Sync type is required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'products':
        await syncProducts();
        break;
      
      case 'orders':
        await syncOrders();
        break;
      
      case 'inventory':
        await syncInventory();
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid sync type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      message: `${type} sync completed`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}

async function syncProducts() {
  try {
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

      // Here you would typically save to your database
      console.log(`Synced ${products.length} products from Square`);
      
      return products;
    }

    return [];
  } catch (error) {
    console.error('Error syncing products:', error);
    throw error;
  }
}

async function syncOrders() {
  try {
    const { ordersApi } = squareClient;
    const response = await ordersApi.searchOrders({
      locationIds: [process.env.SQUARE_LOCATION_ID!],
      query: {
        filter: {
          stateFilter: {
            states: ['OPEN', 'COMPLETED', 'CANCELED']
          }
        }
      }
    });

    if (response.result?.orders) {
      const orders = response.result.orders.map(order => ({
        id: order.id,
        lineItems: order.lineItems,
        total: order.totalMoney,
        status: order.state,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));

      // Here you would typically save to your database
      console.log(`Synced ${orders.length} orders from Square`);
      
      return orders;
    }

    return [];
  } catch (error) {
    console.error('Error syncing orders:', error);
    throw error;
  }
}

async function syncInventory() {
  try {
    const { inventoryApi } = squareClient;
    const response = await inventoryApi.batchRetrieveInventoryCounts({
      catalogObjectIds: [], // Empty array to get all items
      locationIds: [process.env.SQUARE_LOCATION_ID!]
    });

    if (response.result?.counts) {
      const inventory = response.result.counts.map(count => ({
        catalogObjectId: count.catalogObjectId,
        quantity: count.quantity,
        state: count.state,
        locationId: count.locationId,
        calculatedAt: count.calculatedAt,
      }));

      // Here you would typically update your inventory database
      console.log(`Synced ${inventory.length} inventory items from Square`);
      
      return inventory;
    }

    return [];
  } catch (error) {
    console.error('Error syncing inventory:', error);
    throw error;
  }
}
