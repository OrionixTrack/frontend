import type { OwnerTripItem } from '../types/OwnerTripItem'
import type { OwnerTripTelemetry } from '../types/OwnerTripTelemetry'
import type { OwnerTripStatus } from '../types/OwnerTripStatus'

const applyTelemetryPatch = (
  currentTelemetry: OwnerTripItem['currentTelemetry'],
  telemetry: Partial<OwnerTripTelemetry>,
): OwnerTripItem['currentTelemetry'] => ({
  latitude: telemetry.latitude ?? currentTelemetry?.latitude ?? 0,
  longitude: telemetry.longitude ?? currentTelemetry?.longitude ?? 0,
  speed: telemetry.speed ?? currentTelemetry?.speed ?? null,
  datetime: telemetry.datetime ?? currentTelemetry?.datetime ?? new Date().toISOString(),
  temperature: telemetry.temperature ?? currentTelemetry?.temperature ?? null,
  humidity: telemetry.humidity ?? currentTelemetry?.humidity ?? null,
})

export const patchTripStatus = (
  trip: OwnerTripItem,
  status: OwnerTripStatus,
): OwnerTripItem => ({
  ...trip,
  status,
})

export const patchTripTelemetry = (
  trip: OwnerTripItem,
  telemetry: Partial<OwnerTripTelemetry>,
): OwnerTripItem => ({
  ...trip,
  currentTelemetry: applyTelemetryPatch(trip.currentTelemetry, telemetry),
})

export const patchTripInCollection = (
  items: OwnerTripItem[],
  tripId: number,
  patcher: (trip: OwnerTripItem) => OwnerTripItem,
): OwnerTripItem[] =>
  items.map((item) => (item.id === tripId ? patcher(item) : item))
