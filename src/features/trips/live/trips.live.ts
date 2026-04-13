import type { OwnerTripItem } from '../types/OwnerTripItem'
import type { OwnerTripTelemetry } from '../types/OwnerTripTelemetry'
import type { OwnerTripStatus } from '../types/OwnerTripStatus'

export interface LiveTrackPoint {
  latitude: number
  longitude: number
  datetime?: string
}

const applyTelemetryPatch = (
  currentTelemetry: OwnerTripItem['currentTelemetry'],
  telemetry: Partial<OwnerTripTelemetry>,
): OwnerTripItem['currentTelemetry'] => ({
  latitude: telemetry.latitude ?? currentTelemetry?.latitude ?? 0,
  longitude: telemetry.longitude ?? currentTelemetry?.longitude ?? 0,
  speed: telemetry.speed ?? currentTelemetry?.speed ?? null,
  bearing: telemetry.bearing ?? currentTelemetry?.bearing ?? null,
  datetime: telemetry.datetime ?? currentTelemetry?.datetime ?? new Date().toISOString(),
  temperature: telemetry.temperature ?? currentTelemetry?.temperature ?? null,
  humidity: telemetry.humidity ?? currentTelemetry?.humidity ?? null,
})

const isFiniteCoordinate = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isSameTrackPoint = (left: LiveTrackPoint, right: LiveTrackPoint): boolean =>
  Math.abs(left.latitude - right.latitude) < 0.000001 &&
  Math.abs(left.longitude - right.longitude) < 0.000001

export const toLiveTrackPoint = (
  telemetry?: Partial<OwnerTripTelemetry> | null,
): LiveTrackPoint | null => {
  if (!isFiniteCoordinate(telemetry?.latitude) || !isFiniteCoordinate(telemetry?.longitude)) {
    return null
  }

  return {
    latitude: telemetry.latitude,
    longitude: telemetry.longitude,
    datetime: telemetry.datetime,
  }
}

export const appendLiveTrackPoint = (
  points: LiveTrackPoint[],
  telemetry: Partial<OwnerTripTelemetry>,
  previousTelemetry?: Partial<OwnerTripTelemetry> | null,
): LiveTrackPoint[] => {
  const nextPoint = toLiveTrackPoint(telemetry)

  if (!nextPoint) {
    return points
  }

  const basePoints = [...points]

  if (basePoints.length === 0) {
    const initialPoint = toLiveTrackPoint(previousTelemetry)

    if (initialPoint) {
      basePoints.push(initialPoint)
    }
  }

  const lastPoint = basePoints[basePoints.length - 1]

  if (!lastPoint) {
    return [nextPoint]
  }

  if (isSameTrackPoint(lastPoint, nextPoint)) {
    if (lastPoint.datetime === nextPoint.datetime) {
      return basePoints
    }

    basePoints[basePoints.length - 1] = nextPoint
    return basePoints
  }

  return [...basePoints, nextPoint]
}

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
