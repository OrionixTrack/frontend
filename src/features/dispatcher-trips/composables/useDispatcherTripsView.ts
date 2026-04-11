import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ApiError, getSafeErrorMessage } from '@core/api'
import { useSessionStore } from '@core/stores/session'
import {
  cancelDispatcherTrip,
  createDispatcherTrip,
  endDispatcherTrip,
  getDispatcherTrip,
  getDispatcherTrips,
  getDispatcherTripStats,
  startDispatcherTrip,
  updateDispatcherTrip,
  type DispatcherTripPayload,
} from '@features/dispatcher-trips/api/dispatcher-trips.api'
import { getEmployees } from '@features/employees/api/employees.api'
import type { EmployeeItem } from '@features/employees/types/EmployeeItem'
import { patchTripInCollection, patchTripStatus, patchTripTelemetry } from '@features/trips/live/trips.live'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import {
  connectTrackingSocket,
  onTelemetryUpdate,
  onTripStatus,
  subscribeTrip,
  unsubscribeTrip,
} from '@shared/realtime/tracking.socket'
import type { DispatcherUser } from '@shared/types'
import { getVehicles } from '@features/vehicles/api/vehicles.api'
import type { VehicleItem } from '@features/vehicles/types/VehicleItem'

import type {
  OwnerTripItem,
} from '@features/trips/types/OwnerTripItem'
import type { OwnerTripListParams } from '@features/trips/types/OwnerTripListParams'
import type { OwnerTripSortBy } from '@features/trips/types/OwnerTripSortBy'
import type { OwnerTripSortOrder } from '@features/trips/types/OwnerTripSortOrder'
import type { OwnerTripStats } from '@features/trips/types/OwnerTripStats'
import type { OwnerTripStatus } from '@features/trips/types/OwnerTripStatus'

const DEFAULT_LIMIT = 20
const DEFAULT_DIRECTORY_LIMIT = 20

interface TripDirectoryState {
  items: OwnerTripItem[]
  hasNextPage: boolean
  hasLoaded: boolean
  appliedSearch: string
  filters: {
    limit: number
    offset: number
    search: string
    sortBy: OwnerTripSortBy
    sortOrder: OwnerTripSortOrder
    status: OwnerTripStatus | ''
    dateFrom: string
    dateTo: string
  }
}

const createDirectoryState = (): TripDirectoryState => ({
  items: [],
  hasNextPage: true,
  hasLoaded: false,
  appliedSearch: '',
  filters: {
    limit: DEFAULT_LIMIT,
    offset: 0,
    search: '',
    sortBy: 'planned_start_datetime',
    sortOrder: 'DESC',
    status: '',
    dateFrom: '',
    dateTo: '',
  },
})

interface ReferenceDirectoryState<TItem> {
  items: TItem[]
  hasNextPage: boolean
  search: string
  offset: number
  hasLoaded: boolean
}

const createReferenceDirectoryState = <TItem>(): ReferenceDirectoryState<TItem> => ({
  items: [],
  hasNextPage: true,
  search: '',
  offset: 0,
  hasLoaded: false,
})

const toStartOfDay = (value: string): string => `${value}T00:00:00.000Z`
const toEndOfDay = (value: string): string => `${value}T23:59:59.999Z`

const toDateTimeLocal = (value?: string | null): string => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60_000)
  return localDate.toISOString().slice(0, 16)
}

const toIsoDateTime = (value: string): string => {
  const date = new Date(value)
  return date.toISOString()
}

const parseCoordinate = (value: string): number | null => {
  if (!value.trim()) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const useDispatcherTripsView = () => {
  const route = useRoute()
  const router = useRouter()
  const { session, logout } = useSessionStore()
  const { theme, setTheme } = useTheme()
  const { locale, messages } = useI18n()
  const { isLoading, error: pageError, execute: executePage, resetError: resetPageError } = useApiState('')
  const { isLoading: isDetailLoading, error: detailError, execute: executeDetail, resetError: resetDetailError } = useApiState('')
  const { isLoading: isStatsLoading, error: statsError, execute: executeStats, resetError: resetStatsError } = useApiState('')
  const { isLoading: isSaving, error: saveError, execute: executeSave, resetError: resetSaveError } = useApiState('')
  const { isLoading: isActionLoading, error: actionError, execute: executeAction, resetError: resetActionError } = useApiState('')
  const { isLoading: isDriversLoading, execute: executeDrivers } = useApiState('')
  const { isLoading: isVehiclesLoading, execute: executeVehicles } = useApiState('')

  const activeProfile = ref<DispatcherUser | null>((session.user as DispatcherUser | null) ?? null)
  const directory = reactive<TripDirectoryState>(createDirectoryState())
  const driverDirectory = reactive<ReferenceDirectoryState<EmployeeItem>>(createReferenceDirectoryState())
  const vehicleDirectory = reactive<ReferenceDirectoryState<VehicleItem>>(createReferenceDirectoryState())
  const selectedTrip = ref<OwnerTripItem | null>(null)
  const selectedTripStats = ref<OwnerTripStats | null>(null)
  const selectedDriver = ref<EmployeeItem | null>(null)
  const selectedVehicle = ref<VehicleItem | null>(null)
  const detailTab = ref<'overview' | 'stats'>('overview')
  const statsLoadedForTripId = ref<number | null>(null)
  const form = reactive({
    name: '',
    description: '',
    plannedStart: '',
    contactInfo: '',
    startAddress: '',
    finishAddress: '',
    startLatitude: '',
    startLongitude: '',
    finishLatitude: '',
    finishLongitude: '',
    driverId: '',
    vehicleId: '',
  })

  let isSyncingRouteState = false

  const items = computed(() => directory.items)
  const filters = computed(() => directory.filters)
  const hasNextPage = computed(() => directory.hasNextPage)
  const isInitialLoading = computed(() => isLoading.value && !directory.hasLoaded)
  const isLoadingMore = computed(() => isLoading.value && directory.hasLoaded && directory.filters.offset > 0)
  const driverOptions = computed(() =>
    driverDirectory.items.map((driver) => ({
      value: String(driver.id),
      label: `${driver.name} ${driver.surname}`.trim(),
    })),
  )
  const vehicleOptions = computed(() =>
    vehicleDirectory.items.map((vehicle) => ({
      value: String(vehicle.id),
      label: `${vehicle.name}${vehicle.license_plate ? ` · ${vehicle.license_plate}` : ''}`,
    })),
  )
  const selectedDriverLabel = computed(() =>
    selectedDriver.value
      ? `${selectedDriver.value.name} ${selectedDriver.value.surname}`.trim()
      : messages.value.dispatcherTrips.unassignedDriver,
  )
  const selectedVehicleLabel = computed(() =>
    selectedVehicle.value
      ? `${selectedVehicle.value.name}${selectedVehicle.value.license_plate ? ` · ${selectedVehicle.value.license_plate}` : ''}`
      : messages.value.dispatcherTrips.unassignedVehicle,
  )
  const selectedTripId = computed(() => {
    const rawValue = route.params.tripId
    const numericId = typeof rawValue === 'string' ? Number(rawValue) : NaN
    return Number.isFinite(numericId) ? numericId : null
  })
  const formMode = computed<'create' | 'edit'>(() =>
    route.name === 'dispatcher-trip-edit' ? 'edit' : 'create',
  )
  const isFormRoute = computed(() =>
    route.name === 'dispatcher-trip-create' || route.name === 'dispatcher-trip-edit',
  )

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

  const normalizeSortOrder = (value: unknown): OwnerTripSortOrder => (value === 'ASC' ? 'ASC' : 'DESC')

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

  const syncForm = (trip: OwnerTripItem | null): void => {
    form.name = trip?.name ?? ''
    form.description = trip?.description ?? ''
    form.plannedStart = toDateTimeLocal(trip?.plannedStart)
    form.contactInfo = trip?.contactInfo ?? ''
    form.startAddress = trip?.startAddress ?? ''
    form.finishAddress = trip?.finishAddress ?? ''
    form.startLatitude = trip?.startLatitude !== undefined ? String(trip.startLatitude) : ''
    form.startLongitude = trip?.startLongitude !== undefined ? String(trip.startLongitude) : ''
    form.finishLatitude = trip?.finishLatitude !== undefined ? String(trip.finishLatitude) : ''
    form.finishLongitude = trip?.finishLongitude !== undefined ? String(trip.finishLongitude) : ''
    form.driverId = trip?.driver?.id ? String(trip.driver.id) : ''
    form.vehicleId = trip?.vehicle?.id ? String(trip.vehicle.id) : ''
    selectedDriver.value = trip?.driver
      ? {
          id: trip.driver.id,
          name: trip.driver.name,
          surname: trip.driver.surname,
          email: '',
          register_date: '',
          language: '',
        }
      : null
    selectedVehicle.value = trip?.vehicle
      ? {
          id: trip.vehicle.id,
          name: trip.vehicle.name,
          license_plate: trip.vehicle.licensePlate,
          is_active: true,
          brand: trip.vehicle.brand ?? null,
          model: trip.vehicle.model ?? null,
          production_year: null,
          capacity: null,
          tracker_id: null,
        }
      : null
  }

  const applyRouteState = (): void => {
    isSyncingRouteState = true
    directory.filters.search = typeof route.query.search === 'string' ? route.query.search : ''
    directory.filters.sortBy = normalizeSortBy(route.query.sortBy)
    directory.filters.sortOrder = normalizeSortOrder(route.query.sortOrder)
    directory.filters.status = normalizeStatus(route.query.status)
    directory.filters.dateFrom = typeof route.query.dateFrom === 'string' ? route.query.dateFrom : ''
    directory.filters.dateTo = typeof route.query.dateTo === 'string' ? route.query.dateTo : ''
    directory.filters.offset = 0
    directory.appliedSearch = directory.filters.search.trim()
    detailTab.value = route.query.tab === 'stats' ? 'stats' : 'overview'
    isSyncingRouteState = false
  }

  applyRouteState()

  const buildListParams = (): OwnerTripListParams => ({
    limit: directory.filters.limit,
    offset: directory.filters.offset,
    search: directory.appliedSearch || undefined,
    sortBy: directory.filters.sortBy,
    sortOrder: directory.filters.sortOrder,
    status: directory.filters.status || undefined,
    dateFrom: directory.filters.dateFrom ? toStartOfDay(directory.filters.dateFrom) : undefined,
    dateTo: directory.filters.dateTo ? toEndOfDay(directory.filters.dateTo) : undefined,
  })

  const loadTrips = async (signal?: AbortSignal): Promise<void> => {
    try {
      const trips = await executePage(
        () => getDispatcherTrips(buildListParams(), signal),
        (error) => getSafeErrorMessage(error, messages.value.trips.loadError),
      )

      const normalizedItems = Array.isArray(trips) ? trips : []
      directory.items =
        directory.filters.offset === 0
          ? normalizedItems
          : [...directory.items, ...normalizedItems]
      directory.hasNextPage = normalizedItems.length === directory.filters.limit
      directory.hasLoaded = true
    } catch {
      return
    }
  }

  const loadDrivers = async (reset = false, signal?: AbortSignal): Promise<void> => {
    const offset = reset ? 0 : driverDirectory.offset
    const response = await executeDrivers(
      () =>
        getEmployees(
          'driver',
          {
            limit: DEFAULT_DIRECTORY_LIMIT,
            offset,
            sortBy: 'name',
            sortOrder: 'ASC',
            search: driverDirectory.search.trim() || undefined,
          },
          signal,
          'dispatcher',
        ),
      () => '',
    )

    const items = Array.isArray(response) ? response : []
    driverDirectory.items = reset ? items : [...driverDirectory.items, ...items]
    driverDirectory.offset = offset
    driverDirectory.hasNextPage = items.length === DEFAULT_DIRECTORY_LIMIT
    driverDirectory.hasLoaded = true
  }

  const loadVehicles = async (reset = false, signal?: AbortSignal): Promise<void> => {
    const offset = reset ? 0 : vehicleDirectory.offset
    const response = await executeVehicles(
      () =>
        getVehicles(
          {
            limit: DEFAULT_DIRECTORY_LIMIT,
            offset,
            sortBy: 'name',
            sortOrder: 'ASC',
            search: vehicleDirectory.search.trim() || undefined,
          },
          signal,
          'dispatcher',
        ),
      () => '',
    )

    const items = Array.isArray(response) ? response : []
    vehicleDirectory.items = reset ? items : [...vehicleDirectory.items, ...items]
    vehicleDirectory.offset = offset
    vehicleDirectory.hasNextPage = items.length === DEFAULT_DIRECTORY_LIMIT
    vehicleDirectory.hasLoaded = true
  }

  const loadTripDetails = async (tripId: number, signal?: AbortSignal): Promise<void> => {
    try {
      const trip = await executeDetail(
        () => getDispatcherTrip(tripId, signal),
        (error) => getSafeErrorMessage(error, messages.value.trips.detailLoadError),
      )
      selectedTrip.value = trip
      if (route.name === 'dispatcher-trip-edit') {
        if (trip.status !== 'planned') {
          await router.replace({
            name: 'dispatcher-trip-details',
            params: { tripId: trip.id },
            query: route.query,
          })
          return
        }
        syncForm(trip)
      }
    } catch {
      selectedTrip.value = null
    }
  }

  const loadTripStats = async (tripId: number, signal?: AbortSignal): Promise<void> => {
    try {
      const stats = await executeStats(
        () => getDispatcherTripStats(tripId, signal),
        (error) => getSafeErrorMessage(error, messages.value.trips.statsLoadError),
      )
      selectedTripStats.value = stats
      statsLoadedForTripId.value = tripId
    } catch {
      selectedTripStats.value = null
      statsLoadedForTripId.value = null
    }
  }

  const patchSelectedTrip = (patcher: (trip: OwnerTripItem) => OwnerTripItem): void => {
    if (selectedTrip.value) {
      selectedTrip.value = patcher(selectedTrip.value)
    }
  }

  const syncTripInState = (trip: OwnerTripItem): void => {
    selectedTrip.value = selectedTrip.value?.id === trip.id ? trip : selectedTrip.value
    directory.items = patchTripInCollection(directory.items, trip.id, () => trip)
  }

  watch(
    () => [session.accessToken, directory.filters.limit, directory.filters.offset, directory.filters.sortBy, directory.filters.sortOrder, directory.filters.status, directory.filters.dateFrom, directory.filters.dateTo, directory.appliedSearch] as const,
    async (token, _previous, onCleanup) => {
      if (!token[0] || session.role !== 'dispatcher') {
        Object.assign(directory, createDirectoryState())
        selectedTrip.value = null
        selectedTripStats.value = null
        return
      }

      if (isFormRoute.value) {
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadTrips(controller.signal)
    },
    { immediate: true },
  )

  watch(
    () => [session.accessToken, route.name, driverDirectory.search] as const,
    async ([token], _previous, onCleanup) => {
      if (!token || session.role !== 'dispatcher' || !isFormRoute.value) {
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      driverDirectory.offset = 0
      await loadDrivers(true, controller.signal)
    },
    { immediate: true },
  )

  watch(
    () => [session.accessToken, route.name, vehicleDirectory.search] as const,
    async ([token], _previous, onCleanup) => {
      if (!token || session.role !== 'dispatcher' || !isFormRoute.value) {
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      vehicleDirectory.offset = 0
      await loadVehicles(true, controller.signal)
    },
    { immediate: true },
  )

  watch(
    () => directory.filters.search,
    (_value, _previous, onCleanup) => {
      const timeoutId = window.setTimeout(() => {
        directory.filters.offset = 0
        directory.appliedSearch = directory.filters.search.trim()
      }, 250)

      onCleanup(() => window.clearTimeout(timeoutId))
    },
  )

  watch(
    () => route.query,
    () => {
      if (isSyncingRouteState) {
        return
      }

      applyRouteState()
    },
  )

  watch(
    () => [directory.filters.search, directory.filters.sortBy, directory.filters.sortOrder, directory.filters.status, directory.filters.dateFrom, directory.filters.dateTo, detailTab.value, selectedTripId.value, route.name] as const,
    async ([search, sortBy, sortOrder, status, dateFrom, dateTo, tab, tripId, routeName]) => {
      if (isSyncingRouteState || routeName === 'dispatcher-trip-create' || routeName === 'dispatcher-trip-edit') {
        return
      }

      isSyncingRouteState = true
      await router.replace({
        name: tripId ? 'dispatcher-trip-details' : 'dispatcher-trips',
        params: tripId ? { tripId } : undefined,
        query: {
          search: search.trim() || undefined,
          sortBy: sortBy === 'planned_start_datetime' ? undefined : sortBy,
          sortOrder: sortOrder === 'DESC' ? undefined : sortOrder,
          status: status || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          tab: tripId && tab === 'stats' ? 'stats' : undefined,
        },
      })
      isSyncingRouteState = false
    },
  )

  watch(
    () => [selectedTripId.value, route.name] as const,
    async ([tripId, routeName], _previous, onCleanup) => {
      resetDetailError()
      resetStatsError()
      selectedTripStats.value = null
      statsLoadedForTripId.value = null

      if (routeName === 'dispatcher-trip-create') {
        selectedTrip.value = null
        syncForm(null)
        return
      }

      if (!tripId) {
        selectedTrip.value = null
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadTripDetails(tripId, controller.signal)

      if (detailTab.value === 'stats' && routeName === 'dispatcher-trip-details') {
        await loadTripStats(tripId, controller.signal)
      }
    },
    { immediate: true },
  )

  watch(
    () => [detailTab.value, selectedTripId.value, route.name] as const,
    async ([tab, tripId, routeName], _previous, onCleanup) => {
      if (routeName !== 'dispatcher-trip-details' || tab !== 'stats' || !tripId || statsLoadedForTripId.value === tripId) {
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadTripStats(tripId, controller.signal)
    },
  )

  watch(
    () => [session.accessToken, selectedTripId.value, selectedTrip.value?.status, route.name] as const,
    ([token, tripId, status, routeName], _previous, onCleanup) => {
      if (!token || routeName !== 'dispatcher-trip-details' || !tripId || status !== 'in_progress') {
        return
      }

      connectTrackingSocket(token)
      subscribeTrip(token, tripId)

      const offStatus = onTripStatus(async (payload) => {
        if (payload.tripId !== tripId) {
          return
        }

        directory.items = patchTripInCollection(directory.items, payload.tripId, (trip) =>
          patchTripStatus(trip, payload.status),
        )
        patchSelectedTrip((trip) => patchTripStatus(trip, payload.status))

        if (payload.status === 'completed' || payload.status === 'cancelled') {
          unsubscribeTrip(tripId)
          await loadTripDetails(tripId)
        }
      })

      const offTelemetry = onTelemetryUpdate((payload) => {
        if (payload.tripId !== tripId) {
          return
        }

        directory.items = patchTripInCollection(directory.items, payload.tripId, (trip) =>
          patchTripTelemetry(trip, payload),
        )
        patchSelectedTrip((trip) => patchTripTelemetry(trip, payload))
      })

      onCleanup(() => {
        offStatus()
        offTelemetry()
        unsubscribeTrip(tripId)
      })
    },
    { immediate: true },
  )

  const handleLogout = async (): Promise<void> => {
    logout()
    await router.replace({ name: 'login' })
  }

  const navigateBackToList = async (): Promise<void> => {
    resetActionError()
    await router.push({
      name: 'dispatcher-trips',
      query: {
        search: directory.filters.search.trim() || undefined,
        sortBy: directory.filters.sortBy === 'planned_start_datetime' ? undefined : directory.filters.sortBy,
        sortOrder: directory.filters.sortOrder === 'DESC' ? undefined : directory.filters.sortOrder,
        status: directory.filters.status || undefined,
        dateFrom: directory.filters.dateFrom || undefined,
        dateTo: directory.filters.dateTo || undefined,
      },
    })
  }

  const buildPayload = (): DispatcherTripPayload => ({
    // Validation runs before submit, so coordinate casts are safe here.
    name: form.name.trim(),
    description: form.description.trim() || null,
    plannedStart: toIsoDateTime(form.plannedStart),
    contactInfo: form.contactInfo.trim() || null,
    startAddress: form.startAddress.trim(),
    finishAddress: form.finishAddress.trim(),
    startLatitude: Number(form.startLatitude),
    startLongitude: Number(form.startLongitude),
    finishLatitude: Number(form.finishLatitude),
    finishLongitude: Number(form.finishLongitude),
    driverId: form.driverId ? Number(form.driverId) : null,
    vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
  })

  const submitForm = async (): Promise<void> => {
    resetSaveError()

    const startLatitude = parseCoordinate(form.startLatitude)
    const startLongitude = parseCoordinate(form.startLongitude)
    const finishLatitude = parseCoordinate(form.finishLatitude)
    const finishLongitude = parseCoordinate(form.finishLongitude)

    if (
      startLatitude === null ||
      startLongitude === null ||
      finishLatitude === null ||
      finishLongitude === null
    ) {
      try {
        await executeSave(
          async () => {
            throw new ApiError(messages.value.dispatcherTrips.locationRequired, 0)
          },
          (error) => getSafeErrorMessage(error, messages.value.dispatcherTrips.saveError),
        )
      } catch {
        return
      }
    }

    try {
      const trip = await executeSave(
        () =>
          formMode.value === 'create'
            ? createDispatcherTrip(buildPayload())
            : updateDispatcherTrip(selectedTripId.value as number, buildPayload()),
        (error) => getSafeErrorMessage(error, messages.value.dispatcherTrips.saveError),
      )

      await router.push({
        name: 'dispatcher-trip-details',
        params: { tripId: trip.id },
        query: {
          search: directory.filters.search.trim() || undefined,
          sortBy: directory.filters.sortBy === 'planned_start_datetime' ? undefined : directory.filters.sortBy,
          sortOrder: directory.filters.sortOrder === 'DESC' ? undefined : directory.filters.sortOrder,
          status: directory.filters.status || undefined,
          dateFrom: directory.filters.dateFrom || undefined,
          dateTo: directory.filters.dateTo || undefined,
        },
      })
      syncTripInState(trip)
    } catch {
      return
    }
  }

  const runTripAction = async (
    tripId: number,
    action: () => Promise<OwnerTripItem>,
  ): Promise<void> => {
    resetActionError()

    try {
      const trip = await executeAction(
        action,
        (error) => getSafeErrorMessage(error, messages.value.dispatcherTrips.actionError),
      )
      syncTripInState(trip)
      selectedTrip.value = trip
    } catch {
      return
    }
  }

  return {
    activeProfile,
    detailError,
    detailTab,
    filters,
    form,
    formMode,
    handleLogout,
    hasNextPage,
    isDetailLoading,
    isFormRoute,
    isInitialLoading,
    isLoading,
    isLoadingMore,
    isSaving,
    isStatsLoading,
    items,
    locale,
    messages,
    navigateBackToList,
    openCreateTrip: async () => {
      resetActionError()
      syncForm(null)
      await router.push({
        name: 'dispatcher-trip-create',
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
    openEditTrip: async (tripId: number) => {
      resetActionError()
      await router.push({
        name: 'dispatcher-trip-edit',
        params: { tripId },
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
    actionError,
    handleCancelTrip: async (tripId: number) => {
      await runTripAction(tripId, () => cancelDispatcherTrip(tripId))
    },
    handleEndTrip: async (tripId: number) => {
      await runTripAction(tripId, () => endDispatcherTrip(tripId))
    },
    handleStartTrip: async (tripId: number) => {
      await runTripAction(tripId, () => startDispatcherTrip(tripId))
    },
    isActionLoading,
    openTripDetails: async (tripId: number) => {
      resetActionError()
      await router.push({
        name: 'dispatcher-trip-details',
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
    saveError,
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
    setField: (field: keyof typeof form, value: string) => {
      resetSaveError()
      resetActionError()
      form[field] = value
      if (field === 'driverId') {
        selectedDriver.value = driverDirectory.items.find((driver) => String(driver.id) === value) ?? null
      }
      if (field === 'vehicleId') {
        selectedVehicle.value = vehicleDirectory.items.find((vehicle) => String(vehicle.id) === value) ?? null
      }
    },
    setDriverSearchQuery: (value: string) => {
      driverDirectory.search = value
    },
    setVehicleSearchQuery: (value: string) => {
      vehicleDirectory.search = value
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
    submitForm,
    theme,
    driverOptions,
    vehicleOptions,
    driverSearchQuery: computed(() => driverDirectory.search),
    vehicleSearchQuery: computed(() => vehicleDirectory.search),
    selectedDriverLabel,
    selectedVehicleLabel,
    isDriversLoading,
    isVehiclesLoading,
    hasMoreDrivers: computed(() => driverDirectory.hasNextPage),
    hasMoreVehicles: computed(() => vehicleDirectory.hasNextPage),
    loadMoreDrivers: async () => {
      if (!driverDirectory.hasNextPage || isDriversLoading.value) {
        return
      }
      driverDirectory.offset += DEFAULT_DIRECTORY_LIMIT
      await loadDrivers(false)
    },
    loadMoreVehicles: async () => {
      if (!vehicleDirectory.hasNextPage || isVehiclesLoading.value) {
        return
      }
      vehicleDirectory.offset += DEFAULT_DIRECTORY_LIMIT
      await loadVehicles(false)
    },
    openDriverPicker: async () => {
      if (!driverDirectory.hasLoaded) {
        await loadDrivers(true)
      }
    },
    openVehiclePicker: async () => {
      if (!vehicleDirectory.hasLoaded || !vehicleDirectory.items.length) {
        await loadVehicles(true)
      }
    },
    loadMoreTrips: () => {
      if (!directory.hasNextPage || isLoading.value) {
        return
      }

      directory.filters.offset += directory.filters.limit
    },
  }
}
