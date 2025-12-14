/**
 * Maps database order status values to OrderStatusPage status values
 * 
 * Status mapping:
 * - OPEN → 'confirmed' (order confirmed)
 * - RESERVED → 'confirmed' (in progress)
 * - PREPARED → 'ready' (ready for pickup)
 * - COMPLETED → 'picked_up' (picked up)
 */

export type OrderStatusPageStatus = 'confirmed' | 'ready' | 'picked_up'

/**
 * Maps a database order status (from Square/Neon) to an OrderStatusPage status
 * @param dbStatus - The status from the database (e.g., 'OPEN', 'RESERVED', 'PREPARED', 'COMPLETED')
 * @returns The mapped status for OrderStatusPage
 */
export function mapOrderStatus(dbStatus: string | null | undefined): OrderStatusPageStatus {
  if (!dbStatus) {
    return 'confirmed' // Default to confirmed if no status
  }

  const status = dbStatus.toUpperCase().trim()

  // Square order states - primary mapping
  switch (status) {
    case 'OPEN':
      return 'confirmed' // Order confirmed
    
    case 'RESERVED':
      return 'confirmed' // In progress (still confirmed, being worked on)
    
    case 'PREPARED':
      return 'ready' // Ready for pickup
    
    case 'COMPLETED':
      return 'picked_up' // Picked up
    
    // Legacy/fallback mappings for backwards compatibility
    case 'DRAFT':
      return 'confirmed'
    
    case 'SHIPPED':
    case 'READY':
    case 'READY_FOR_PICKUP':
      return 'ready'
    
    case 'DELIVERED':
    case 'PICKED_UP':
    case 'FULFILLED':
      return 'picked_up'
    
    case 'CANCELLED':
    case 'CANCELED':
      // Cancelled orders still show as confirmed but with cancelled state
      return 'confirmed'
    
    default:
      // For unknown statuses, default to confirmed
      return 'confirmed'
  }
}
