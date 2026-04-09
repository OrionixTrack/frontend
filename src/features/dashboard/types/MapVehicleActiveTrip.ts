import type { RealtimeTripStatus } from '@shared/realtime/tracking.socket'

export interface MapVehicleActiveTrip {
  id: number
  name: string
  status: RealtimeTripStatus
  startAddress?: string | null
  finishAddress: string
  finishLatitude: number
  finishLongitude: number
}
