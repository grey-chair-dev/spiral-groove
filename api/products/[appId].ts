import { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel Serverless Function
 * Fetches products from Square Catalog API and returns them in the format expected by the frontend
 * 
 * Route: /api/products/[appId]
 * Example: /api/products/spiralgroove
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { appId } = req.query

  if (!appId || typeof appId !== 'string') {
    return res.status(400).json({ error: 'appId is required' })
  }

  // Get Square credentials from environment variables
  const accessToken = process.env.SQUARE_ACCESS_TOKEN
  const environment = process.env.SQUARE_ENVIRONMENT || 'sandbox'
  const locationId = process.env.SQUARE_LOCATION_ID

  if (!accessToken) {
    console.error('[Square API] Missing SQUARE_ACCESS_TOKEN')
    return res.status(500).json({ error: 'Square configuration missing' })
  }

  if (!locationId) {
    console.error('[Square API] Missing SQUARE_LOCATION_ID')
    return res.status(500).json({ error: 'Square location not configured' })
  }

  // Square API base URL
  const squareBaseUrl = environment === 'production' 
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com'

  try {
    // Fetch catalog items from Square using REST API
    const catalogResponse = await fetch(`${squareBaseUrl}/v2/catalog/list`, {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        types: ['ITEM', 'ITEM_VARIATION', 'CATEGORY', 'IMAGE'],
      }),
    })

    if (!catalogResponse.ok) {
      const errorData = await catalogResponse.json()
      console.error('[Square API] Catalog error:', errorData)
      return res.status(catalogResponse.status).json({ 
        error: 'Square API error',
        details: errorData 
      })
    }

    const catalogData = await catalogResponse.json()
    const catalogObjects = catalogData.objects || []

    // Fetch inventory counts for the location
    const itemIds = catalogObjects
      .filter((obj: any) => obj.type === 'ITEM')
      .map((obj: any) => obj.id)

    let inventoryCounts: any[] = []
    
    if (itemIds.length > 0) {
      try {
        const inventoryResponse = await fetch(`${squareBaseUrl}/v2/inventory/batch-retrieve-counts`, {
          method: 'POST',
          headers: {
            'Square-Version': '2024-01-18',
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            catalog_object_ids: itemIds,
            location_ids: [locationId],
          }),
        })

        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json()
          inventoryCounts = inventoryData.counts || []
        }
      } catch (inventoryError) {
        console.warn('[Square API] Could not fetch inventory:', inventoryError)
        // Continue without inventory data
      }
    }

    // Transform Square catalog items to the Product format expected by frontend
    const products = transformSquareCatalogToProducts(
      catalogObjects,
      inventoryCounts,
      locationId
    )

    // Return products in the expected format
    return res.status(200).json({
      products,
      // Also support array format for compatibility
    })

  } catch (error: any) {
    console.error('[Square API] Error fetching products:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message 
    })
  }
}

/**
 * Transform Square catalog objects to Product format
 */
function transformSquareCatalogToProducts(
  catalogObjects: any[],
  inventoryCounts: any[],
  locationId: string
): any[] {
  const products: any[] = []
  const items = catalogObjects.filter(obj => obj.type === 'ITEM')
  
  for (const item of items) {
    const itemData = item.itemData
    
    if (!itemData) continue

    // Get variations (SKUs) for this item
    const variations = catalogObjects.filter(
      obj => obj.type === 'ITEM_VARIATION' && 
      itemData.variations?.some((v: any) => v.id === obj.id)
    )

    // Use first variation or create default
    const primaryVariation = variations[0]?.itemVariationData || null
    
    // Get inventory count for this item
    const inventory = inventoryCounts.find(
      inv => inv.catalogObjectId === item.id || 
      inv.catalogObjectId === primaryVariation?.itemId
    )

    // Get price from variation or item
    let price = 0
    if (primaryVariation?.priceMoney) {
      price = (primaryVariation.priceMoney.amount || 0) / 100 // Convert cents to dollars
    }

    // Get image URL
    let imageUrl = ''
    if (itemData.imageIds && itemData.imageIds.length > 0) {
      const imageId = itemData.imageIds[0]
      const imageObj = catalogObjects.find(obj => obj.id === imageId)
      if (imageObj?.imageData?.url) {
        imageUrl = imageObj.imageData.url
      }
    }

    // Get category
    let category = 'Uncategorized'
    if (itemData.categories && itemData.categories.length > 0) {
      const categoryId = itemData.categories[0]
      const categoryObj = catalogObjects.find(obj => obj.id === categoryId)
      if (categoryObj?.categoryData?.name) {
        category = categoryObj.categoryData.name
      }
    }

    // Calculate stock count from inventory
    const stockCount = inventory?.quantity 
      ? parseInt(inventory.quantity, 10) 
      : (primaryVariation?.trackInventory ? 0 : 999) // If not tracked, show as available

    const product = {
      id: item.id || `item-${Date.now()}`,
      name: itemData.name || 'Unnamed Product',
      description: itemData.description || '',
      price: price,
      category: category,
      stockCount: Math.max(0, stockCount),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
      rating: 4.5, // Default rating (Square doesn't provide this)
      reviewCount: 0, // Default review count
    }

    products.push(product)
  }

  return products
}

