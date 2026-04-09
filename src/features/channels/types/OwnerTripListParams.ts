export interface OwnerTripListParams {
  limit: number
  offset: number
  search?: string
  sortBy?: 'planned_start_datetime' | 'trip_id' | 'status'
  sortOrder?: 'ASC' | 'DESC'
}
