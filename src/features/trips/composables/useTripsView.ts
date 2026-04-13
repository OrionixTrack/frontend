import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getSafeErrorMessage } from '@core/api'
import { useSessionStore } from '@core/stores/session'
import {
  applyPaginatedItems,
  createPaginatedDirectoryState,
  resetPaginatedDirectory,
  useDebouncedSearch,
  useDirectoryRouteSync,
} from '@shared/composables/paginatedDirectory'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import {
  connectTrackingSocket,
  disconnectTrackingSocket,
  onTelemetryUpdate,
  onTripStatus,
  subscribeCompany,
  subscribeTrip,
  unsubscribeCompany,
  unsubscribeTrip,
} from '@shared/realtime/tracking.socket'
import { useTheme } from '@shared/composables/useTheme'
import type { OwnerUser } from '@shared/types'

import {getOwnerTrip, getOwnerTrips, getOwnerTripStats} from '../api/trips.api'
import {patchTripInCollection, patchTripStatus, patchTripTelemetry} from '../live/trips.live'
import type {OwnerTripItem} from '../types/OwnerTripItem'
import type {OwnerTripSortBy} from '../types/OwnerTripSortBy'
import type {OwnerTripSortOrder} from '../types/OwnerTripSortOrder'
import type {OwnerTripStats} from '../types/OwnerTripStats'
import type {OwnerTripStatus} from '../types/OwnerTripStatus'

const DEFAULT_LIMIT = 20
const createTripFilters = () => ({
  limit: DEFAULT_LIMIT,
  offset: 0,
  search: '',
  sortBy: 'planned_start_datetime' as OwnerTripSortBy,
  sortOrder: 'DESC' as OwnerTripSortOrder,
  status: '' as OwnerTripStatus | '',
  dateFrom: '',
  dateTo: '',
})

const toStartOfDay = (value: string): string =>
  `${value}T00:00:00.000Z`

const toEndOfDay = (value: string): string =>
  `${value}T23:59:59.999Z`

export const useTripsView = () => {
  const route = useRoute()
  const router = useRouter()
  const { session, logout } = useSessionStore()
  const { theme, setTheme } = useTheme()
  const { locale, messages } = useI18n()
  const {
    isLoading,
    error: pageError,
    execute: executePage,
    resetError: resetPageError,
  } = useApiState('')
  const {
    isLoading: isDetailLoading,
    error: detailError,
    execute: executeDetail,
    resetError: resetDetailError,
  } = useApiState('')
  const {
    isLoading: isStatsLoading,
    error: statsError,
    execute: executeStats,
    resetError: resetStatsError,
  } = useApiState('')

  const activeProfile = ref<OwnerUser | null>((session.user as OwnerUser | null) ?? null)
  const directory = reactive(createPaginatedDirectoryState<OwnerTripItem, ReturnType<typeof createTripFilters>>(createTripFilters))
  const selectedTrip = ref<OwnerTripItem | null>(null)
  const selectedTripStats = ref<OwnerTripStats | null>(null)
  const detailTab = ref<'overview' | 'stats'>('overview')
  const statsLoadedForTripId = ref<number | null>(null)
  let removeTripStatusListener: (() => void) | null = null
  let removeTelemetryListener: (() => void) | null = null

  const items = computed(() => directory.items)
  const filters = computed(() => directory.filters)
  const hasNextPage = computed(() => directory.hasNextPage)
  const isInitialLoading = computed(() => isLoading.value && !directory.hasLoaded)
  const isLoadingMore = computed(() => isLoading.value && directory.hasLoaded && directory.filters.offset > 0)
  const selectedTripId = computed(() => {
    const rawValue = route.params.tripId
    const numericId = typeof rawValue === 'string' ? Number(rawValue) : NaN

    return Number.isFinite(numericId) ? numericId : null
  })

  const normalizeSortBy = (value: unknown): OwnerTripSortBy => {
    switch (value) {
      case 'trip_id':
      case 'status':
      case 'planned_start_datetime':
        return value
      default:
        return 'planned_start_datetime'
    }
  }

  const normalizeSortOrder = (value: unknown): OwnerTripSortOrder =>
    value === 'ASC' ? 'ASC' : 'DESC'

  const normalizeStatus = (value: unknown): OwnerTripStatus | '' => {
    switch (value) {
      case 'planned':
      case 'in_progress':
      case 'completed':
      case 'cancelled':
        return value
      default:
        return ''
    }
  }

  const applyRouteState = (): void => {
    directory.filters.search = typeof route.query.search === 'string' ? route.query.search : ''
    directory.filters.sortBy = normalizeSortBy(route.query.sortBy)
    directory.filters.sortOrder = normalizeSortOrder(route.query.sortOrder)
    directory.filters.status = normalizeStatus(route.query.status)
    directory.filters.dateFrom = typeof route.query.dateFrom === 'string' ? route.query.dateFrom : ''
    directory.filters.dateTo = typeof route.query.dateTo === 'string' ? route.query.dateTo : ''
    directory.filters.offset = 0
    directory.appliedSearch = directory.filters.search.trim()
    detailTab.value = route.query.tab === 'stats' ? 'stats' : 'overview'
  }

  useDirectoryRouteSync({
    route,
    router,
    applyRouteState,
    buildRouteQuery: () => ({
      search: directory.filters.search.trim() || undefined,
      sortBy: directory.filters.sortBy === 'planned_start_datetime' ? undefined : directory.filters.sortBy,
      sortOrder: directory.filters.sortOrder === 'DESC' ? undefined : directory.filters.sortOrder,
      status: directory.filters.status || undefined,
      dateFrom: directory.filters.dateFrom || undefined,
      dateTo: directory.filters.dateTo || undefined,
      tab: selectedTripId.value && detailTab.value === 'stats' ? 'stats' : undefined,
    }),
    watchSources: () => [
      directory.filters.search,
      directory.filters.sortBy,
      directory.filters.sortOrder,
      directory.filters.status,
      directory.filters.dateFrom,
      directory.filters.dateTo,
      detailTab.value,
      selectedTripId.value,
    ] as const,
  })

  const patchDirectoryTrip = (tripId: number, patcher: (trip: OwnerTripItem) => OwnerTripItem): void => {
    directory.items = patchTripInCollection(directory.items, tripId, patcher)
  }

  const patchSelectedTrip = (tripId: number, patcher: (trip: OwnerTripItem) => OwnerTripItem): void => {
    if (selectedTrip.value?.id !== tripId) {
      return
    }

    selectedTrip.value = patcher(selectedTrip.value)
  }

  const refreshTripDetails = async (tripId: number): Promise<void> => {
    await loadTripDetails(tripId)

    if (detailTab.value === 'stats' || statsLoadedForTripId.value === tripId) {
      await loadTripStats(tripId)
    }
  }

  const detachLiveListeners = (): void => {
    removeTripStatusListener?.()
    removeTripStatusListener = null
    removeTelemetryListener?.()
    removeTelemetryListener = null
  }

  const attachLiveListeners = (token: string): void => {
    connectTrackingSocket(token)
    detachLiveListeners()

    removeTripStatusListener = onTripStatus((payload) => {
      patchDirectoryTrip(payload.tripId, (trip) => patchTripStatus(trip, payload.status))
      patchSelectedTrip(payload.tripId, (trip) => patchTripStatus(trip, payload.status))

      if (
        selectedTripId.value === payload.tripId &&
        (payload.status === 'completed' || payload.status === 'cancelled')
      ) {
        unsubscribeTrip(payload.tripId)
        void refreshTripDetails(payload.tripId)
      }
    })

    removeTelemetryListener = onTelemetryUpdate((payload) => {
      patchDirectoryTrip(payload.tripId, (trip) => patchTripTelemetry(trip, payload))
      patchSelectedTrip(payload.tripId, (trip) => patchTripTelemetry(trip, payload))
    })
  }

  const loadTrips = async (signal?: AbortSignal): Promise<void> => {
    try {
      const trips = await executePage(
        () =>
          getOwnerTrips(
            {
              limit: directory.filters.limit,
              offset: directory.filters.offset,
              search: directory.appliedSearch || undefined,
              sortBy: directory.filters.sortBy,
              sortOrder: directory.filters.sortOrder,
              status: directory.filters.status || undefined,
              dateFrom: directory.filters.dateFrom ? toStartOfDay(directory.filters.dateFrom) : undefined,
              dateTo: directory.filters.dateTo ? toEndOfDay(directory.filters.dateTo) : undefined,
            },
            signal,
          ),
        (error) => getSafeErrorMessage(error, messages.value.trips.loadError),
      )

      applyPaginatedItems(directory, Array.isArray(trips) ? trips : [])
    } catch {
      return
    }
  }

  const loadTripDetails = async (tripId: number, signal?: AbortSignal): Promise<void> => {
    try {
      selectedTrip.value = await executeDetail(
          () => getOwnerTrip(tripId, signal),
          (error) => getSafeErrorMessage(error, messages.value.trips.detailLoadError),
      )
    } catch {
      selectedTrip.value = null
    }
  }

  const loadTripStats = async (tripId: number, signal?: AbortSignal): Promise<void> => {
    try {
      selectedTripStats.value = await executeStats(
          () => getOwnerTripStats(tripId, signal),
          (error) => getSafeErrorMessage(error, messages.value.trips.statsLoadError),
      )
      statsLoadedForTripId.value = tripId
    } catch {
      selectedTripStats.value = null
      statsLoadedForTripId.value = null
    }
  }

  watch(
    () =>
      [
        session.accessToken,
        directory.filters.limit,
        directory.filters.offset,
        directory.filters.sortBy,
        directory.filters.sortOrder,
        directory.filters.status,
        directory.filters.dateFrom,
        directory.filters.dateTo,
        directory.appliedSearch,
      ] as const,
    async (token, _previous, onCleanup) => {
      if (!token[0]) {
        resetPaginatedDirectory(directory, createTripFilters)
        selectedTrip.value = null
        selectedTripStats.value = null
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadTrips(controller.signal)
    },
    { immediate: true },
  )

  useDebouncedSearch(
    () => directory.filters.search,
    () => {
      directory.filters.offset = 0
      directory.appliedSearch = directory.filters.search.trim()
    },
  )

  watch(
    () => session.accessToken,
    (token) => {
      detachLiveListeners()

      if (!token) {
        disconnectTrackingSocket()
        return
      }

      attachLiveListeners(token)
    },
    { immediate: true },
  )

  watch(
    () => selectedTripId.value,
    async (tripId, _previous, onCleanup) => {
      resetDetailError()
      resetStatsError()
      selectedTripStats.value = null
      statsLoadedForTripId.value = null

      if (!tripId) {
        selectedTrip.value = null
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadTripDetails(tripId, controller.signal)

      if (detailTab.value === 'stats') {
        await loadTripStats(tripId, controller.signal)
      }
    },
    { immediate: true },
  )

  watch(
    () => [detailTab.value, selectedTripId.value] as const,
    async ([tab, tripId], _previous, onCleanup) => {
      if (tab !== 'stats' || !tripId || statsLoadedForTripId.value === tripId) {
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadTripStats(tripId, controller.signal)
    },
  )

  watch(
    () => [session.accessToken, activeProfile.value?.company.id ?? null, selectedTripId.value] as const,
    ([token, companyId, tripId], _previous, onCleanup) => {
      if (!token || !companyId || tripId) {
        return
      }

      subscribeCompany(token, companyId)
      onCleanup(() => {
        unsubscribeCompany(companyId)
      })
    },
    { immediate: true },
  )

  watch(
    () => [session.accessToken, selectedTrip.value?.id ?? null, selectedTrip.value?.status ?? null] as const,
    ([token, tripId, status], _previous, onCleanup) => {
      if (!token || !tripId || status !== 'in_progress') {
        return
      }

      subscribeTrip(token, tripId)
      onCleanup(() => {
        unsubscribeTrip(tripId)
      })
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    detachLiveListeners()
    disconnectTrackingSocket()
  })

  const handleLogout = async (): Promise<void> => {
    logout()
    await router.replace({ name: 'login' })
  }

  return {
    activeProfile,
    closeTripDetails: async () => {
      await router.push({
        name: 'owner-trips',
        query: {
          search: directory.filters.search.trim() || undefined,
          sortBy: directory.filters.sortBy === 'planned_start_datetime' ? undefined : directory.filters.sortBy,
          sortOrder: directory.filters.sortOrder === 'DESC' ? undefined : directory.filters.sortOrder,
          status: directory.filters.status || undefined,
          dateFrom: directory.filters.dateFrom || undefined,
          dateTo: directory.filters.dateTo || undefined,
        },
      })
    },
    detailError,
    detailTab,
    filters,
    handleLogout,
    hasNextPage,
    isDetailLoading,
    isInitialLoading,
    isLoading,
    isLoadingMore,
    isStatsLoading,
    items,
    loadMoreTrips: () => {
      if (!directory.hasNextPage || isLoading.value) {
        return
      }

      directory.filters.offset += directory.filters.limit
    },
    locale,
    messages,
    openTripDetails: async (tripId: number) => {
      await router.push({
        name: 'owner-trip-details',
        params: { tripId },
        query: {
          search: directory.filters.search.trim() || undefined,
          sortBy: directory.filters.sortBy === 'planned_start_datetime' ? undefined : directory.filters.sortBy,
          sortOrder: directory.filters.sortOrder === 'DESC' ? undefined : directory.filters.sortOrder,
          status: directory.filters.status || undefined,
          dateFrom: directory.filters.dateFrom || undefined,
          dateTo: directory.filters.dateTo || undefined,
          tab: detailTab.value === 'stats' ? 'stats' : undefined,
        },
      })
    },
    pageError,
    selectedTrip,
    selectedTripId,
    selectedTripStats,
    session,
    setDateFrom: (value: string) => {
      resetPageError()
      directory.filters.offset = 0
      directory.filters.dateFrom = value
    },
    setDateTo: (value: string) => {
      resetPageError()
      directory.filters.offset = 0
      directory.filters.dateTo = value
    },
    setDetailTab: (value: 'overview' | 'stats') => {
      detailTab.value = value
    },
    setSearch: (value: string) => {
      resetPageError()
      directory.filters.search = value
    },
    setSortBy: (value: OwnerTripSortBy) => {
      resetPageError()
      directory.filters.offset = 0
      directory.filters.sortBy = value
    },
    setSortOrder: (value: OwnerTripSortOrder) => {
      resetPageError()
      directory.filters.offset = 0
      directory.filters.sortOrder = value
    },
    setStatus: (value: OwnerTripStatus | '') => {
      resetPageError()
      directory.filters.offset = 0
      directory.filters.status = value
    },
    setTheme,
    statsError,
    theme,
  }
}
