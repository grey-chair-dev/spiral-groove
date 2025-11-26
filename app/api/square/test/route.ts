import { NextResponse } from 'next/server';
import { isSquareConfigured, getLocationId } from '@/lib/square/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {},
      errors: [],
    };

  // Test 1: Check if Square is configured
  try {
    const configured = isSquareConfigured();
    results.tests.configuration = {
      status: configured ? '✅ PASS' : '❌ FAIL',
      message: configured ? 'Square API is configured' : 'Square API is not configured',
    };
  } catch (error: any) {
    results.errors.push({ test: 'configuration', error: error.message });
    results.tests.configuration = {
      status: '❌ ERROR',
      message: error.message,
    };
  }

  // Test 2: Get Location ID
  try {
    const locationId = getLocationId();
    results.tests.locationId = {
      status: '✅ PASS',
      message: `Location ID: ${locationId}`,
      locationId,
    };
  } catch (error: any) {
    results.errors.push({ test: 'locationId', error: error.message });
    results.tests.locationId = {
      status: '❌ ERROR',
      message: error.message,
    };
  }

  // Test 3: Test Catalog Search (limited to 5 items)
  if (isSquareConfigured()) {
    try {
      const { searchCatalogItems } = await import('@/lib/square/catalog');
      const catalogResult = await searchCatalogItems({ limit: 5 });
      results.tests.catalogSearch = {
        status: '✅ PASS',
        message: `Found ${catalogResult.objects?.length || 0} catalog items`,
        itemCount: catalogResult.objects?.length || 0,
        sampleItems: catalogResult.objects?.slice(0, 3).map((item: any) => ({
          id: item.id,
          type: item.type,
          name: item.itemData?.name || 'N/A',
        })) || [],
      };
    } catch (error: any) {
      results.errors.push({ 
        test: 'catalogSearch', 
        error: error.message,
        details: error.cause?.message || error.stack?.split('\n')[0] || 'No additional details'
      });
      results.tests.catalogSearch = {
        status: '❌ ERROR',
        message: error.message,
        details: error.cause?.message || error.stack?.split('\n')[0] || 'No additional details',
      };
    }

    // Test 4: Test Inventory (if we have catalog items)
    try {
      const { searchCatalogItems } = await import('@/lib/square/catalog');
      const { getInventoryCounts } = await import('@/lib/square/inventory');
      const catalogResult = await searchCatalogItems({ limit: 3 });
      if (catalogResult.objects && catalogResult.objects.length > 0) {
        const itemIds = catalogResult.objects
          .map((item: any) => item.id)
          .filter((id: string) => id);
        
        if (itemIds.length > 0) {
          const inventory = await getInventoryCounts(itemIds);
          results.tests.inventory = {
            status: '✅ PASS',
            message: `Retrieved inventory for ${inventory.length} items`,
            itemCount: inventory.length,
          };
        } else {
          results.tests.inventory = {
            status: '⚠️ SKIP',
            message: 'No catalog item IDs found to test inventory',
          };
        }
      } else {
        results.tests.inventory = {
          status: '⚠️ SKIP',
          message: 'No catalog items found to test inventory',
        };
      }
    } catch (error: any) {
      results.errors.push({ test: 'inventory', error: error.message });
      results.tests.inventory = {
        status: '❌ ERROR',
        message: error.message,
      };
    }

    // Test 5: Test Orders Search
    try {
      const { searchOrders } = await import('@/lib/square/orders');
      const ordersResult = await searchOrders({ limit: 5 });
      results.tests.ordersSearch = {
        status: '✅ PASS',
        message: `Found ${ordersResult.orders?.length || 0} orders`,
        orderCount: ordersResult.orders?.length || 0,
      };
    } catch (error: any) {
      results.errors.push({ test: 'ordersSearch', error: error.message });
      results.tests.ordersSearch = {
        status: '❌ ERROR',
        message: error.message,
      };
    }

    // Test 6: Direct client test (list locations)
    try {
      const { getClient } = await import('@/lib/square/client');
      const client = getClient();
      const locationsResponse = await client.locations.list();
      results.tests.locations = {
        status: '✅ PASS',
        message: `Found ${locationsResponse.locations?.length || 0} locations`,
        locationCount: locationsResponse.locations?.length || 0,
        locations: locationsResponse.locations?.map((loc: any) => ({
          id: loc.id,
          name: loc.name,
          address: loc.address?.addressLine1 || 'N/A',
        })) || [],
      };
    } catch (error: any) {
      results.errors.push({ test: 'locations', error: error.message });
      results.tests.locations = {
        status: '❌ ERROR',
        message: error.message,
      };
    }
  } else {
    results.tests.catalogSearch = {
      status: '⚠️ SKIP',
      message: 'Square API not configured - skipping catalog test',
    };
    results.tests.inventory = {
      status: '⚠️ SKIP',
      message: 'Square API not configured - skipping inventory test',
    };
    results.tests.ordersSearch = {
      status: '⚠️ SKIP',
      message: 'Square API not configured - skipping orders test',
    };
    results.tests.locations = {
      status: '⚠️ SKIP',
      message: 'Square API not configured - skipping locations test',
    };
  }

  // Summary
  const passed = Object.values(results.tests).filter((t: any) => t.status === '✅ PASS').length;
  const failed = Object.values(results.tests).filter((t: any) => t.status === '❌ ERROR' || t.status === '❌ FAIL').length;
  const skipped = Object.values(results.tests).filter((t: any) => t.status === '⚠️ SKIP').length;

  results.summary = {
    total: Object.keys(results.tests).length,
    passed,
    failed,
    skipped,
    allPassed: failed === 0,
  };

    return NextResponse.json(results, {
      status: failed === 0 ? 200 : 500,
    });
  } catch (error: any) {
    // Catch any unexpected errors and return them as JSON
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Unexpected error occurred',
      message: error?.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    }, {
      status: 500,
    });
  }
}

