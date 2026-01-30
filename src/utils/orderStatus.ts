/**
 * Maps database order status values to OrderStatusPage status values
 * 
 * Status mapping:
 * - PROPOSED → 'confirmed' (order created but not accepted yet)
 * - RESERVED → 'confirmed' (in progress)
 * - PREPARED → 'ready' (ready for pickup)
 * - COMPLETED → 'picked_up' (picked up)
 * - CANCELED → 'canceled' (order canceled)
 */

export type OrderStatusPageStatus = 'confirmed' | 'ready' | 'picked_up' | 'canceled'

/**
 * Maps a database order status (from Square/Neon) to an OrderStatusPage status
 * @param dbStatus - The status from the database (e.g., 'PROPOSED', 'RESERVED', 'PREPARED', 'COMPLETED', 'CANCELED')
 * @returns The mapped status for OrderStatusPage
 */
export function mapOrderStatus(dbStatus: string | null | undefined): OrderStatusPageStatus {
  if (!dbStatus) {
    return 'confirmed' // Default to confirmed if no status
  }

  const status = dbStatus.toUpperCase().trim()

  // Canonical Spiral Groove order states (backed by Neon `orders.status`)
  switch (status) {
    case 'PROPOSED':
      return 'confirmed' // New order just came in
    
    case 'RESERVED':
      return 'confirmed' // In progress (still confirmed, being worked on)
    
    case 'PREPARED':
      return 'ready' // Ready for pickup
    
    case 'COMPLETED':
      return 'picked_up' // Picked up

    case 'CANCELED':
    case 'CANCELLED': // tolerate UK spelling from upstream tooling
      return 'canceled'
    
    // Legacy/fallback mappings for backwards compatibility
    case 'DRAFT':
      return 'confirmed'

    case 'OPEN':
      // Some older rows were stored as OPEN. Treat as PROPOSED/confirmed.
      return 'confirmed'
    
    case 'SHIPPED':
    case 'READY':
    case 'READY_FOR_PICKUP':
      return 'ready'
    
    case 'DELIVERED':
    case 'PICKED_UP':
    case 'FULFILLED':
      return 'picked_up'
    
    default:
      // For unknown statuses, default to confirmed
      return 'confirmed'
  }
}
