import type { TrackingChannelSortBy } from './TrackingChannelSortBy'
import type { TrackingChannelSortOrder } from './TrackingChannelSortOrder'

export interface TrackingChannelListParams {
  limit: number
  offset: number
  search?: string
  sortBy: TrackingChannelSortBy
  sortOrder: TrackingChannelSortOrder
}
