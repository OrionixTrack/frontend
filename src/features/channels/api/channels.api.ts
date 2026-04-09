import { deleteJson, getJson, postJson, putJson } from '@core/api'

import type { OwnerTripItem } from '../types/OwnerTripItem'
import type { OwnerTripListParams } from '../types/OwnerTripListParams'
import type { TrackingChannelItem } from '../types/TrackingChannelItem'
import type { TrackingChannelListParams } from '../types/TrackingChannelListParams'
import type { TrackingChannelPayload } from '../types/TrackingChannelPayload'

export const getTrackingChannels = (
  params: TrackingChannelListParams,
  signal?: AbortSignal,
): Promise<TrackingChannelItem[]> =>
  getJson<TrackingChannelItem[]>('/owner/tracking-channels', {
    query: params,
    signal,
  })

export const createTrackingChannel = (
  payload: TrackingChannelPayload,
  signal?: AbortSignal,
): Promise<TrackingChannelItem> => postJson<TrackingChannelItem>('/owner/tracking-channels', payload, { signal })

export const updateTrackingChannel = (
  channelId: number,
  payload: TrackingChannelPayload,
  signal?: AbortSignal,
): Promise<TrackingChannelItem> =>
  putJson<TrackingChannelItem>(`/owner/tracking-channels/${channelId}`, payload, { signal })

export const deleteTrackingChannel = (
  channelId: number,
  signal?: AbortSignal,
): Promise<null> => deleteJson<null>(`/owner/tracking-channels/${channelId}`, { signal })

export const getOwnerTrips = (
  params: OwnerTripListParams,
  signal?: AbortSignal,
): Promise<OwnerTripItem[]> =>
  getJson<OwnerTripItem[]>('/owner/trips', {
    query: params,
    signal,
  })
