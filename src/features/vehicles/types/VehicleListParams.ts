import type { VehicleSortBy } from './VehicleSortBy'
import type { VehicleSortOrder } from './VehicleSortOrder'

export interface VehicleListParams {
  limit: number
  offset: number
  search?: string
  sortBy: VehicleSortBy
  sortOrder: VehicleSortOrder
}
