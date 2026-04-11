import type { PublicTrackingPosition, PublicTrackingTrip } from './PublicTrackingResponse'

export interface PublicTrackingState {
  isLoading: boolean
  notFound: boolean
  channelName: string
  trip: PublicTrackingTrip | null
  currentPosition: PublicTrackingPosition | null
}
