import { getJson } from '@core/api'
import type { DispatcherUser, DriverUser, OwnerUser } from '@shared/types'
import type { OwnerStatsResponse, TripResponse } from '@features/dashboard/types'

export const getOwnerProfile = (signal?: AbortSignal): Promise<OwnerUser> =>
  getJson<OwnerUser>('/owner/profile', { signal })

export const getOwnerStats = (signal?: AbortSignal): Promise<OwnerStatsResponse> =>
  getJson<OwnerStatsResponse>('/owner/stats', { signal })

export const getDispatcherProfile = (signal?: AbortSignal): Promise<DispatcherUser> =>
  getJson<DispatcherUser>('/dispatcher/profile', { signal })

export const getDispatcherTrips = (signal?: AbortSignal): Promise<TripResponse[]> =>
  getJson<TripResponse[]>('/dispatcher/trips', { signal })

export const getDriverProfile = (signal?: AbortSignal): Promise<DriverUser> =>
  getJson<DriverUser>('/driver/profile', { signal })

export const getDriverTrips = (signal?: AbortSignal): Promise<TripResponse[]> =>
  getJson<TripResponse[]>('/driver/trips', { signal })
