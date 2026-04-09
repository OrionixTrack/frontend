export interface TrackerListParams {
  limit: number
  offset: number
  search?: string
  sortBy?: 'name' | 'tracker_id'
  sortOrder?: 'ASC' | 'DESC'
}
