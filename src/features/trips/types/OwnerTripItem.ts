import type { OwnerTripPerson } from './OwnerTripPerson'
import type { OwnerTripStatus } from './OwnerTripStatus'
import type { OwnerTripTelemetry } from './OwnerTripTelemetry'
import type { OwnerTripVehicle } from './OwnerTripVehicle'

export interface OwnerTripItem {
  id: number
  name: string
  description?: string | null
  status: OwnerTripStatus
  plannedStart: string
  actualStart?: string | null
  end?: string | null
  contactInfo?: string | null
  startAddress: string
  finishAddress: string
  startLatitude: number
  startLongitude: number
  finishLatitude: number
  finishLongitude: number
  driver?: OwnerTripPerson | null
  vehicle?: OwnerTripVehicle | null
  createdByDispatcher?: OwnerTripPerson | null
  trackPolyline?: unknown | null
  currentTelemetry?: OwnerTripTelemetry | null
}
