export type PublicTripStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'

export interface PublicTrackingPosition {
  latitude: number
  longitude: number
  speed: number | null
  bearing: number | null
  datetime: string
}

export interface PublicTrackingTrip {
  name: string
  status: PublicTripStatus
  finishAddress: string
  finishLatitude: number
  finishLongitude: number
}

export interface PublicTrackingResponse {
  channelName: string
  trip: PublicTrackingTrip | null
  currentPosition: PublicTrackingPosition | null
}
