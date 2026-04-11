import { onBeforeUnmount, reactive, readonly } from 'vue'

import { isApiError } from '@core/api'
import {
  connectPublicTrackingSocket,
  disconnectPublicTrackingSocket,
  onPublicChannelReassigned,
  onPublicPositionUpdate,
  onPublicTripStatus,
} from '@shared/realtime/public-tracking.socket'

import { getPublicTracking } from '../api/public-tracking.api'
import type { PublicTrackingState } from '../types/PublicTrackingState'

export const usePublicTrackingView = (
  token: string,
): { state: Readonly<PublicTrackingState> } => {
  const state = reactive<PublicTrackingState>({
    isLoading: true,
    notFound: false,
    channelName: '',
    trip: null,
    currentPosition: null,
  })

  let removePositionListener: (() => void) | null = null
  let removeTripStatusListener: (() => void) | null = null
  let removeChannelReassignedListener: (() => void) | null = null

  const detachListeners = (): void => {
    removePositionListener?.()
    removePositionListener = null
    removeTripStatusListener?.()
    removeTripStatusListener = null
    removeChannelReassignedListener?.()
    removeChannelReassignedListener = null
  }

  const loadData = async (): Promise<void> => {
    state.isLoading = true

    try {
      const response = await getPublicTracking(token)
      state.channelName = response.channelName
      state.trip = response.trip
      state.currentPosition = response.currentPosition
      state.notFound = false
    } catch (error) {
      if (isApiError(error) && error.status === 404) {
        state.notFound = true
      }
    } finally {
      state.isLoading = false
    }
  }

  const attachListeners = (): void => {
    removePositionListener = onPublicPositionUpdate((payload) => {
      state.currentPosition = {
        latitude: payload.latitude,
        longitude: payload.longitude,
        speed: payload.speed ?? null,
        bearing: payload.bearing ?? null,
        datetime: payload.datetime,
      }
    })

    removeTripStatusListener = onPublicTripStatus((payload) => {
      if (state.trip) {
        state.trip = {
          ...state.trip,
          status: payload.status,
        }
      }
    })

    removeChannelReassignedListener = onPublicChannelReassigned(() => {
      void loadData()
    })
  }

  const init = async (): Promise<void> => {
    await loadData()
    connectPublicTrackingSocket(token)
    attachListeners()
  }

  void init()

  onBeforeUnmount(() => {
    detachListeners()
    disconnectPublicTrackingSocket()
  })

  return {
    state: readonly(state) as Readonly<PublicTrackingState>,
  }
}
