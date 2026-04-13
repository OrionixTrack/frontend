import { deleteJson, getJson, postJson, putJson } from '@core/api'
import type { ApiScope } from '@shared/types/ApiScope'

import type { TrackerListParams } from '../types/TrackerListParams'
import type { TrackerItem } from '../types/TrackerItem'
import type { TrackerPayload } from '../types/TrackerPayload'
import type { VehicleItem } from '../types/VehicleItem'
import type { VehicleListParams } from '../types/VehicleListParams'
import type { VehiclePayload } from '../types/VehiclePayload'
import type { TrackerTokenResponse } from '@features/trackers/types/TrackerTokenResponse'

export const getVehicles = (
  params: VehicleListParams,
  signal?: AbortSignal,
  scope: ApiScope = 'owner',
): Promise<VehicleItem[]> =>
  getJson<VehicleItem[]>(scope === 'dispatcher' ? '/dispatcher/vehicles' : '/owner/vehicles', {
    query: params,
    signal,
  })

export const createVehicle = (
  payload: VehiclePayload,
  signal?: AbortSignal,
): Promise<VehicleItem> => postJson<VehicleItem>('/owner/vehicles', payload, { signal })

export const updateVehicle = (
  vehicleId: number,
  payload: VehiclePayload,
  signal?: AbortSignal,
): Promise<VehicleItem> => putJson<VehicleItem>(`/owner/vehicles/${vehicleId}`, payload, { signal })

export const deleteVehicle = (
  vehicleId: number,
  signal?: AbortSignal,
): Promise<null> => deleteJson<null>(`/owner/vehicles/${vehicleId}`, { signal })

export const getTrackers = (
  params: TrackerListParams = {
    limit: 100,
    offset: 0,
    sortBy: 'name',
    sortOrder: 'ASC',
  },
  signal?: AbortSignal,
): Promise<TrackerItem[]> =>
  getJson<TrackerItem[]>('/owner/trackers', {
    query: params,
    signal,
  })

export const createTracker = (
  payload: TrackerPayload,
  signal?: AbortSignal,
): Promise<TrackerTokenResponse> => postJson<TrackerTokenResponse>('/owner/trackers', payload, { signal })

export const updateTracker = (
  trackerId: number,
  payload: TrackerPayload,
  signal?: AbortSignal,
): Promise<TrackerItem> => putJson<TrackerItem>(`/owner/trackers/${trackerId}`, payload, { signal })

export const deleteTracker = (
  trackerId: number,
  signal?: AbortSignal,
): Promise<null> => deleteJson<null>(`/owner/trackers/${trackerId}`, { signal })

export const regenerateTrackerToken = (
  trackerId: number,
  signal?: AbortSignal,
): Promise<TrackerTokenResponse> =>
  postJson<TrackerTokenResponse>(`/owner/trackers/${trackerId}/regenerate-token`, {}, { signal })
