import { getJson, postJson, putJson } from '@core/api'

import type { OwnerTripItem } from '@features/trips/types/OwnerTripItem'
import type { OwnerTripListParams } from '@features/trips/types/OwnerTripListParams'
import type { OwnerTripStats } from '@features/trips/types/OwnerTripStats'

export interface DispatcherTripPayload {
  name: string
  description?: string | null
  plannedStart: string
  contactInfo?: string | null
  startAddress: string
  finishAddress: string
  startLatitude: number
  startLongitude: number
  finishLatitude: number
  finishLongitude: number
  vehicleId?: number | null
  driverId?: number | null
}

export interface DispatcherTripListParams extends OwnerTripListParams {
  createdByMe?: boolean
}

export interface AssignDriverPayload {
  driverId: number | null
}

export interface AssignVehiclePayload {
  vehicleId: number | null
}

export const getDispatcherTrips = (
  params: DispatcherTripListParams,
  signal?: AbortSignal,
): Promise<OwnerTripItem[]> =>
  getJson<OwnerTripItem[]>('/dispatcher/trips', {
    query: params,
    signal,
  })

export const getDispatcherTrip = (tripId: number, signal?: AbortSignal): Promise<OwnerTripItem> =>
  getJson<OwnerTripItem>(`/dispatcher/trips/${tripId}`, { signal })

export const getDispatcherTripStats = (tripId: number, signal?: AbortSignal): Promise<OwnerTripStats> =>
  getJson<OwnerTripStats>(`/dispatcher/trips/${tripId}/stats`, { signal })

export const createDispatcherTrip = (
  payload: DispatcherTripPayload,
  signal?: AbortSignal,
): Promise<OwnerTripItem> =>
  postJson<OwnerTripItem>('/dispatcher/trips', payload, { signal })

export const updateDispatcherTrip = (
  tripId: number,
  payload: DispatcherTripPayload,
  signal?: AbortSignal,
): Promise<OwnerTripItem> =>
  putJson<OwnerTripItem>(`/dispatcher/trips/${tripId}`, payload, { signal })

export const assignDispatcherTripDriver = (
  tripId: number,
  payload: AssignDriverPayload,
  signal?: AbortSignal,
): Promise<OwnerTripItem> =>
  putJson<OwnerTripItem>(`/dispatcher/trips/${tripId}/assign-driver`, payload, { signal })

export const assignDispatcherTripVehicle = (
  tripId: number,
  payload: AssignVehiclePayload,
  signal?: AbortSignal,
): Promise<OwnerTripItem> =>
  putJson<OwnerTripItem>(`/dispatcher/trips/${tripId}/assign-vehicle`, payload, { signal })

export const startDispatcherTrip = (
  tripId: number,
  signal?: AbortSignal,
): Promise<OwnerTripItem> =>
  postJson<OwnerTripItem>(`/dispatcher/trips/${tripId}/start`, {}, { signal })

export const endDispatcherTrip = (
  tripId: number,
  signal?: AbortSignal,
): Promise<OwnerTripItem> =>
  postJson<OwnerTripItem>(`/dispatcher/trips/${tripId}/end`, {}, { signal })

export const cancelDispatcherTrip = (
  tripId: number,
  signal?: AbortSignal,
): Promise<OwnerTripItem> =>
  postJson<OwnerTripItem>(`/dispatcher/trips/${tripId}/cancel`, {}, { signal })
