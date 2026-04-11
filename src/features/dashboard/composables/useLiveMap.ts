import { onBeforeUnmount, reactive, readonly, watch } from 'vue'

import { getSafeErrorMessage } from '@core/api'
import { getOwnerMapVehicles } from '@features/dashboard/api/dashboard.api'
import { useApiState } from '@shared/composables/useApiState'
import {
  connectTrackingSocket,
  disconnectTrackingSocket,
  onTelemetryUpdate,
  onTripStatus,
  subscribeCompany,
  unsubscribeCompany,
} from '@shared/realtime/tracking.socket'
import type { TranslationDictionary } from '@shared/i18n/translations'
import type { DispatcherUser, OwnerUser, SessionState } from '@shared/types'

import type { MapVehicleItem } from '../types/MapVehicleItem'
import type { LiveMapState } from '@features/dashboard/types'

type VehiclesById = Record<number, MapVehicleItem>
type TripToVehicleMap = Record<number, number>

const sortVehicles = (items: MapVehicleItem[]): MapVehicleItem[] =>
  [...items].sort((left, right) => {
    const leftScore = Number(Boolean(left.position)) + Number(Boolean(left.activeTrip))
    const rightScore = Number(Boolean(right.position)) + Number(Boolean(right.activeTrip))

    if (leftScore !== rightScore) {
      return rightScore - leftScore
    }

    return left.vehicleName.localeCompare(right.vehicleName)
  })

export const useLiveMap = (
  session: Readonly<SessionState>,
  messages: () => TranslationDictionary,
  activeProfile: () => OwnerUser | DispatcherUser | null,
): {
  liveMap: Readonly<LiveMapState>
  resetLiveMap: () => void
  reloadLiveMap: () => Promise<void>
} => {
  const { isLoading, error, resetError, execute } = useApiState('')
  const state = reactive<LiveMapState>({
    isLoading: false,
    error: '',
    items: [],
    hasLoaded: false,
  })

  let vehiclesById: VehiclesById = {}
  let tripToVehicleMap: TripToVehicleMap = {}
  let removeTripStatusListener: (() => void) | null = null
  let removeTelemetryListener: (() => void) | null = null

  const syncMetaState = (): void => {
    state.isLoading = isLoading.value
    state.error = error.value
  }

  const syncItems = (): void => {
    state.items = sortVehicles(Object.values(vehiclesById))
  }

  const buildTripMap = (items: MapVehicleItem[]): TripToVehicleMap =>
    items.reduce<TripToVehicleMap>((accumulator, item) => {
      if (item.activeTrip?.id) {
        accumulator[item.activeTrip.id] = item.vehicleId
      }

      return accumulator
    }, {})

  const applySnapshot = (items: MapVehicleItem[]): void => {
    vehiclesById = items.reduce<VehiclesById>((accumulator, item) => {
      accumulator[item.vehicleId] = item
      return accumulator
    }, {})

    tripToVehicleMap = buildTripMap(items)
    state.hasLoaded = true
    syncItems()
  }

  const patchVehicle = (vehicleId: number, patcher: (item: MapVehicleItem) => MapVehicleItem): void => {
    const existing = vehiclesById[vehicleId]

    if (!existing) {
      return
    }

    vehiclesById = {
      ...vehiclesById,
      [vehicleId]: patcher(existing),
    }

    syncItems()
  }

  const detachListeners = (): void => {
    removeTripStatusListener?.()
    removeTripStatusListener = null
    removeTelemetryListener?.()
    removeTelemetryListener = null
  }

  const reloadLiveMap = async (): Promise<void> => {
    if (!session.accessToken || (session.role !== 'owner' && session.role !== 'dispatcher')) {
      return
    }

    try {
      const response = await execute(
        () => getOwnerMapVehicles(),
        (errorValue) => getSafeErrorMessage(errorValue, messages().dashboard.liveMapLoadError),
      )

      applySnapshot(Array.isArray(response.vehicles) ? response.vehicles : [])
    } catch {
      return
    } finally {
      syncMetaState()
    }
  }

  const resetLiveMap = (): void => {
    resetError()
    vehiclesById = {}
    tripToVehicleMap = {}
    state.items = []
    state.hasLoaded = false
    syncMetaState()
  }

  watch([isLoading, error], syncMetaState, { immediate: true })

  watch(
    () => [session.accessToken, session.role] as const,
    async ([token, role], _previous, onCleanup) => {
      const controller = new AbortController()
      onCleanup(() => controller.abort())

      if (!token || (role !== 'owner' && role !== 'dispatcher')) {
        resetLiveMap()
        return
      }

      try {
        const response = await execute(
          () => getOwnerMapVehicles(controller.signal),
          (errorValue) => getSafeErrorMessage(errorValue, messages().dashboard.liveMapLoadError),
        )

        applySnapshot(Array.isArray(response.vehicles) ? response.vehicles : [])
      } catch {
        return
      } finally {
        syncMetaState()
      }
    },
    { immediate: true },
  )

  watch(
    () => [session.accessToken, session.role, activeProfile()?.company.id ?? null] as const,
    ([token, role, companyId], _previous, onCleanup) => {
      detachListeners()

      if (!token || (role !== 'owner' && role !== 'dispatcher') || !companyId) {
        disconnectTrackingSocket()
        return
      }

      connectTrackingSocket(token)
      subscribeCompany(token, companyId)

      removeTelemetryListener = onTelemetryUpdate((payload) => {
        const vehicleId = tripToVehicleMap[payload.tripId]

        if (!vehicleId) {
          void reloadLiveMap()
          return
        }

        patchVehicle(vehicleId, (item) => ({
          ...item,
          position: {
            latitude: payload.latitude,
            longitude: payload.longitude,
            speed: payload.speed ?? item.position?.speed ?? null,
            bearing: item.position?.bearing ?? null,
            datetime: payload.datetime,
          },
        }))
      })

      removeTripStatusListener = onTripStatus((payload) => {
        const vehicleId = tripToVehicleMap[payload.tripId]

        if (!vehicleId) {
          void reloadLiveMap()
          return
        }

        patchVehicle(vehicleId, (item) => ({
          ...item,
          activeTrip: item.activeTrip
            ? {
                ...item.activeTrip,
                status: payload.status,
              }
            : item.activeTrip,
        }))

        if (payload.status === 'completed' || payload.status === 'cancelled') {
          void reloadLiveMap()
        }
      })

      onCleanup(() => {
        unsubscribeCompany(companyId)
        detachListeners()
      })
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    detachListeners()
    disconnectTrackingSocket()
  })

  return {
    liveMap: readonly(state) as Readonly<LiveMapState>,
    resetLiveMap,
    reloadLiveMap,
  }
}
