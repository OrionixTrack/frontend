import { computed, reactive, watch, type ComputedRef } from 'vue'

import {
  getDispatcherProfile,
  getDispatcherTrips,
  getOwnerProfile,
  getOwnerStats,
} from '@features/dashboard/api/dashboard.api'
import { formatDispatcherStats, formatOwnerStats } from '@features/dashboard/presenters'
import { useApiState } from '@shared/composables/useApiState'
import type { DashboardState, OwnerStatsResponse, TripResponse } from '@features/dashboard/types'
import type { TranslationDictionary } from '@shared/i18n/translations'
import type { DispatcherUser, OwnerUser, SessionState } from '@shared/types'

export const useDashboard = (
  session: Readonly<SessionState>,
  messages: () => TranslationDictionary,
  updateUser: (user: OwnerUser | DispatcherUser) => void,
): {
  dashboardState: Readonly<DashboardState>
  activeProfile: ComputedRef<OwnerUser | DispatcherUser | null>
  resetDashboardState: () => void
  reloadDashboard: () => Promise<void>
} => {
  const { isLoading, error, resetError, execute } = useApiState('')
  const state = reactive<DashboardState>({
    isLoading: isLoading.value,
    error: error.value,
    profile: null,
    stats: [],
    trips: [],
  })
  let ownerStatsPayload: OwnerStatsResponse | null = null
  let dispatcherTripsPayload: TripResponse[] = []

  const applyLocalizedStats = (): void => {
    if (session.role === 'owner') {
      state.stats = formatOwnerStats(ownerStatsPayload, messages())
      return
    }

    state.stats = formatDispatcherStats(dispatcherTripsPayload, messages())
  }

  const resetDashboardState = (): void => {
    resetError()
    state.profile = null
    state.stats = []
    state.trips = []
    ownerStatsPayload = null
    dispatcherTripsPayload = []
  }

  const syncMetaState = (): void => {
    state.isLoading = isLoading.value
    state.error = error.value
  }

  watch([isLoading, error], syncMetaState, { immediate: true })

  const loadOwnerData = async (signal?: AbortSignal): Promise<void> => {
    const [profile, stats] = await Promise.all([getOwnerProfile(signal), getOwnerStats(signal)])

    ownerStatsPayload = stats
    dispatcherTripsPayload = []
    state.profile = profile
    state.trips = []
    updateUser(profile)
    applyLocalizedStats()
  }

  const loadDispatcherData = async (signal?: AbortSignal): Promise<void> => {
    const [profile, trips] = await Promise.all([
      getDispatcherProfile(signal),
      getDispatcherTrips(signal),
    ])

    dispatcherTripsPayload = Array.isArray(trips) ? trips : []
    ownerStatsPayload = null
    state.profile = profile
    state.trips = dispatcherTripsPayload.slice(0, 5)
    updateUser(profile)
    applyLocalizedStats()
  }

  const loadDashboard = async (signal?: AbortSignal): Promise<void> => {
    if (!session.accessToken || !session.role) {
      resetDashboardState()
      syncMetaState()
      return
    }

    try {
      await execute(
        () => (session.role === 'owner' ? loadOwnerData(signal) : loadDispatcherData(signal)),
        (errorValue) =>
          errorValue instanceof Error ? errorValue.message : messages().dashboard.loadError,
      )
    } catch {
      return
    } finally {
      syncMetaState()
    }
  }

  watch(
    () => [session.accessToken, session.role],
    async ([token, role], _previous, onCleanup) => {
      const controller = new AbortController()

      onCleanup(() => controller.abort())

      if (token && role) {
        await loadDashboard(controller.signal)
      } else {
        resetDashboardState()
        syncMetaState()
      }
    },
    { immediate: true },
  )

  watch(messages, () => {
    if (session.role && (ownerStatsPayload || dispatcherTripsPayload.length)) {
      applyLocalizedStats()
    }
  })

  return {
    dashboardState: state,
    activeProfile: computed(() => state.profile ?? session.user),
    resetDashboardState,
    reloadDashboard: loadDashboard,
  }
}
