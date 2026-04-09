export interface OwnerTripTelemetry {
  latitude: number
  longitude: number
  speed?: number | null
  datetime: string
  temperature?: number | null
  humidity?: number | null
}
