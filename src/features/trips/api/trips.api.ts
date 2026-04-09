import { getJson } from '@core/api'

import type { OwnerTripItem } from '../types/OwnerTripItem'
import type { OwnerTripListParams } from '../types/OwnerTripListParams'
import type { OwnerTripStats } from '../types/OwnerTripStats'

export const getOwnerTrips = (
  params: OwnerTripListParams,
  signal?: AbortSignal,
): Promise<OwnerTripItem[]> =>
  getJson<OwnerTripItem[]>('/owner/trips', {
    query: params,
    signal,
  })

export const getOwnerTrip = (tripId: number, signal?: AbortSignal): Promise<OwnerTripItem> =>
  getJson<OwnerTripItem>(`/owner/trips/${tripId}`, { signal })

export const getOwnerTripStats = (tripId: number, signal?: AbortSignal): Promise<OwnerTripStats> =>
  getJson<OwnerTripStats>(`/owner/trips/${tripId}/stats`, { signal })
