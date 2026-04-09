import type { OwnerTripSortBy } from './OwnerTripSortBy'
import type { OwnerTripSortOrder } from './OwnerTripSortOrder'
import type { OwnerTripStatus } from './OwnerTripStatus'

export interface OwnerTripListParams {
  limit?: number
  offset?: number
  search?: string
  sortBy?: OwnerTripSortBy
  sortOrder?: OwnerTripSortOrder
  status?: OwnerTripStatus
  dateFrom?: string
  dateTo?: string
}
