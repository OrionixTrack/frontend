import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getSafeErrorMessage, isApiError } from '@core/api'
import { useSessionStore } from '@core/stores/session'
import {
  createVehicle,
  deleteVehicle,
  getTrackers,
  getVehicles,
  regenerateTrackerToken,
  updateTracker,
  updateVehicle,
} from '@features/vehicles/api/vehicles.api'
import type { TrackerItem } from '@features/vehicles/types/TrackerItem'
import type { VehicleItem } from '@features/vehicles/types/VehicleItem'
import type { VehiclePayload } from '@features/vehicles/types/VehiclePayload'
import type { VehicleSortBy } from '@features/vehicles/types/VehicleSortBy'
import type { VehicleSortOrder } from '@features/vehicles/types/VehicleSortOrder'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import type { OwnerUser } from '@shared/types'

const DEFAULT_LIMIT = 20

interface VehicleDirectoryState {
  items: VehicleItem[]
  hasNextPage: boolean
  hasLoaded: boolean
  appliedSearch: string
  filters: {
    limit: number
    offset: number
    search: string
    sortBy: VehicleSortBy
    sortOrder: VehicleSortOrder
  }
}

const createDirectoryState = (): VehicleDirectoryState => ({
  items: [],
  hasNextPage: true,
  hasLoaded: false,
  appliedSearch: '',
  filters: {
    limit: DEFAULT_LIMIT,
    offset: 0,
    search: '',
    sortBy: 'name',
    sortOrder: 'ASC',
  },
})

const extractTrackerToken = (payload: unknown): string => {
  if (typeof payload === 'string') {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const safePayload = payload as Record<string, unknown>
  const candidateKeys = ['secret_token', 'secretToken', 'token', 'tracker_token']

  for (const key of candidateKeys) {
    if (typeof safePayload[key] === 'string') {
      return safePayload[key]
    }
  }

  for (const value of Object.values(safePayload)) {
    const nestedToken = extractTrackerToken(value)

    if (nestedToken) {
      return nestedToken
    }
  }

  return ''
}

export const useVehiclesView = () => {
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
    isLoading: isSavingVehicle,
    error: vehicleError,
    execute: executeVehicleAction,
    resetError: resetVehicleError,
  } = useApiState('')
  const {
    isLoading: isDeletingVehicle,
    error: deleteError,
    execute: executeDeleteAction,
    resetError: resetDeleteError,
  } = useApiState('')
  const {
    isLoading: isSavingTracker,
    error: trackerError,
    execute: executeTrackerAction,
    resetError: resetTrackerError,
  } = useApiState('')

  const activeProfile = ref<OwnerUser | null>((session.user as OwnerUser | null) ?? null)
  const directory = reactive<VehicleDirectoryState>(createDirectoryState())
  const trackers = ref<TrackerItem[]>([])
  const actionSuccess = ref('')
  const trackerToken = ref('')
  const isVehicleDialogOpen = ref(false)
  const isDeleteDialogOpen = ref(false)
  const isTrackerDialogOpen = ref(false)
  const selectedVehicleForEdit = ref<VehicleItem | null>(null)
  const selectedVehicleForDelete = ref<VehicleItem | null>(null)
  const selectedVehicleForTracker = ref<VehicleItem | null>(null)
  const selectedTrackerId = ref('')
  const vehicleForm = reactive({
    name: '',
    licensePlate: '',
    brand: '',
    model: '',
    productionYear: '',
    capacity: '',
    isActive: true,
  })
  let isSyncingRouteQuery = false

  const items = computed(() => directory.items)
  const filters = computed(() => directory.filters)
  const isInitialLoading = computed(() => isLoading.value && !directory.hasLoaded)
  const isLoadingMore = computed(() => isLoading.value && directory.hasLoaded && directory.filters.offset > 0)
  const hasNextPage = computed(() => directory.hasNextPage)
  const isEditingVehicle = computed(() => selectedVehicleForEdit.value !== null)

  const normalizeSortBy = (value: unknown): VehicleSortBy => {
    switch (value) {
      case 'license_plate':
      case 'brand':
      case 'production_year':
      case 'name':
        return value
      default:
        return 'name'
    }
  }

  const normalizeSortOrder = (value: unknown): VehicleSortOrder =>
    value === 'DESC' ? 'DESC' : 'ASC'

  const applyQueryState = (): void => {
    isSyncingRouteQuery = true
    directory.filters.search = typeof route.query.search === 'string' ? route.query.search : ''
    directory.filters.sortBy = normalizeSortBy(route.query.sortBy)
    directory.filters.sortOrder = normalizeSortOrder(route.query.sortOrder)
    directory.filters.offset = 0
    directory.appliedSearch = directory.filters.search.trim()
    isSyncingRouteQuery = false
  }

  applyQueryState()

  const toVehiclePayload = (): VehiclePayload => {
    const productionYear = vehicleForm.productionYear.trim()
    const capacity = vehicleForm.capacity.trim()
    const brand = vehicleForm.brand.trim()
    const model = vehicleForm.model.trim()

    return {
      name: vehicleForm.name.trim(),
      license_plate: vehicleForm.licensePlate.trim().toUpperCase(),
      is_active: vehicleForm.isActive,
      brand: brand || undefined,
      model: model || undefined,
      production_year: productionYear ? Number(productionYear) : undefined,
      capacity: capacity ? Number(capacity) : undefined,
    }
  }

  const syncVehicleForm = (vehicle: VehicleItem | null): void => {
    vehicleForm.name = vehicle?.name ?? ''
    vehicleForm.licensePlate = vehicle?.license_plate ?? ''
    vehicleForm.brand = vehicle?.brand ?? ''
    vehicleForm.model = vehicle?.model ?? ''
    vehicleForm.productionYear = vehicle?.production_year ? String(vehicle.production_year) : ''
    vehicleForm.capacity = vehicle?.capacity !== null && vehicle?.capacity !== undefined ? String(vehicle.capacity) : ''
    vehicleForm.isActive = vehicle?.is_active ?? true
  }

  const resetFeedback = (): void => {
    actionSuccess.value = ''
    trackerToken.value = ''
  }

  const loadVehicles = async (signal?: AbortSignal): Promise<void> => {
    try {
      const vehicleItems = await executePage(
        () =>
          getVehicles(
            {
              limit: directory.filters.limit,
              offset: directory.filters.offset,
              search: directory.appliedSearch,
              sortBy: directory.filters.sortBy,
              sortOrder: directory.filters.sortOrder,
            },
            signal,
          ),
        (error) => getSafeErrorMessage(error, messages.value.vehicles.loadError),
      )

      const normalizedItems = Array.isArray(vehicleItems) ? vehicleItems : []
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

  const loadTrackers = async (signal?: AbortSignal): Promise<void> => {
    try {
      const trackerItems = await getTrackers(
        {
          limit: 100,
          offset: 0,
          sortBy: 'name',
          sortOrder: 'ASC',
        },
        signal,
      )

      trackers.value = Array.isArray(trackerItems) ? trackerItems : []
    } catch {
      return
    }
  }

  const refreshData = async (): Promise<void> => {
    await Promise.all([loadVehicles(), loadTrackers()])
  }

  watch(
    () =>
      [
        session.accessToken,
        directory.filters.limit,
        directory.filters.offset,
        directory.filters.sortBy,
        directory.filters.sortOrder,
        directory.appliedSearch,
      ] as const,
    async (token, _previous, onCleanup) => {
      if (!token[0]) {
        Object.assign(directory, createDirectoryState())
        trackers.value = []
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())

      await loadVehicles(controller.signal)
    },
    { immediate: true },
  )

  watch(
    () => session.accessToken,
    async (token, _previous, onCleanup) => {
      if (!token) {
        trackers.value = []
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadTrackers(controller.signal)
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
      if (isSyncingRouteQuery) {
        return
      }

      applyQueryState()
    },
  )

  watch(
    () => [directory.filters.search, directory.filters.sortBy, directory.filters.sortOrder] as const,
    async ([search, sortBy, sortOrder]) => {
      if (isSyncingRouteQuery) {
        return
      }

      isSyncingRouteQuery = true

      await router.replace({
        query: {
          ...route.query,
          search: search.trim() || undefined,
          sortBy: sortBy === 'name' ? undefined : sortBy,
          sortOrder: sortOrder === 'ASC' ? undefined : sortOrder,
        },
      })

      isSyncingRouteQuery = false
    },
  )

  const handleLogout = async (): Promise<void> => {
    logout()
    await router.replace({ name: 'login' })
  }

  const openCreateDialog = (): void => {
    resetFeedback()
    resetVehicleError()
    selectedVehicleForEdit.value = null
    syncVehicleForm(null)
    isVehicleDialogOpen.value = true
  }

  const openEditDialog = (vehicle: VehicleItem): void => {
    resetFeedback()
    resetVehicleError()
    selectedVehicleForEdit.value = vehicle
    syncVehicleForm(vehicle)
    isVehicleDialogOpen.value = true
  }

  const closeVehicleDialog = (): void => {
    resetVehicleError()
    selectedVehicleForEdit.value = null
    syncVehicleForm(null)
    isVehicleDialogOpen.value = false
  }

  const openDeleteDialog = (vehicle: VehicleItem): void => {
    resetFeedback()
    resetDeleteError()
    selectedVehicleForDelete.value = vehicle
    isDeleteDialogOpen.value = true
  }

  const closeDeleteDialog = (): void => {
    resetDeleteError()
    selectedVehicleForDelete.value = null
    isDeleteDialogOpen.value = false
  }

  const openTrackerDialog = (vehicle: VehicleItem): void => {
    resetFeedback()
    resetTrackerError()
    selectedVehicleForTracker.value = vehicle
    selectedTrackerId.value = vehicle.tracker_id ? String(vehicle.tracker_id) : ''
    trackerToken.value = ''
    isTrackerDialogOpen.value = true
  }

  const closeTrackerDialog = (): void => {
    resetTrackerError()
    selectedVehicleForTracker.value = null
    selectedTrackerId.value = ''
    trackerToken.value = ''
    isTrackerDialogOpen.value = false
  }

  const submitVehicle = async (): Promise<void> => {
    resetFeedback()
    resetVehicleError()

    const payload = toVehiclePayload()

    try {
      await executeVehicleAction(
        () =>
          selectedVehicleForEdit.value
            ? updateVehicle(selectedVehicleForEdit.value.id, payload)
            : createVehicle(payload),
        (error) => {
          if (isApiError(error) && error.status === 409) {
            return messages.value.vehicles.duplicateLicensePlate
          }

          return getSafeErrorMessage(error, messages.value.vehicles.saveError)
        },
      )

      actionSuccess.value = selectedVehicleForEdit.value
        ? messages.value.vehicles.updateSuccess
        : messages.value.vehicles.createSuccess
      closeVehicleDialog()
      await refreshData()
    } catch {
      return
    }
  }

  const confirmDelete = async (): Promise<void> => {
    const vehicle = selectedVehicleForDelete.value

    if (!vehicle) {
      return
    }

    resetFeedback()
    resetDeleteError()

    try {
      await executeDeleteAction(
        () => deleteVehicle(vehicle.id),
        (error) => {
          if (isApiError(error) && error.status === 409) {
            return messages.value.vehicles.deleteConflict
          }

          return getSafeErrorMessage(error, messages.value.vehicles.deleteError)
        },
      )

      actionSuccess.value = messages.value.vehicles.deleteSuccess
      closeDeleteDialog()
      await refreshData()
    } catch {
      return
    }
  }

  const saveTrackerBinding = async (): Promise<void> => {
    const vehicle = selectedVehicleForTracker.value

    if (!vehicle) {
      return
    }

    resetTrackerError()
    trackerToken.value = ''

    const currentTrackerId = vehicle.tracker_id
    const nextTrackerId = selectedTrackerId.value ? Number(selectedTrackerId.value) : null

    if (currentTrackerId === nextTrackerId) {
      closeTrackerDialog()
      return
    }

    const currentTracker = trackers.value.find((tracker) => tracker.id === currentTrackerId) ?? null
    const nextTracker = trackers.value.find((tracker) => tracker.id === nextTrackerId) ?? null

    try {
      await executeTrackerAction(
        async () => {
          if (currentTracker && currentTracker.id !== nextTrackerId) {
            await updateTracker(currentTracker.id, {
              name: currentTracker.name,
              vehicle_id: null,
            })
          }

          try {
            if (nextTracker && nextTracker.id !== currentTrackerId) {
              await updateTracker(nextTracker.id, {
                name: nextTracker.name,
                vehicle_id: vehicle.id,
              })
            }
          } catch (error) {
            if (currentTracker && currentTracker.id !== nextTrackerId) {
              void updateTracker(currentTracker.id, {
                name: currentTracker.name,
                vehicle_id: vehicle.id,
              }).catch(() => undefined)
            }

            throw error
          }
        },
        (error) => getSafeErrorMessage(error, messages.value.vehicles.trackerSaveError),
      )

      actionSuccess.value = messages.value.vehicles.trackerSaved
      closeTrackerDialog()
      await refreshData()
    } catch {
      return
    }
  }

  const regenerateToken = async (): Promise<void> => {
    const vehicle = selectedVehicleForTracker.value

    if (!vehicle?.tracker_id) {
      return
    }

    resetTrackerError()
    trackerToken.value = ''

    try {
      const response = await executeTrackerAction(
        () => regenerateTrackerToken(vehicle.tracker_id!),
        (error) => getSafeErrorMessage(error, messages.value.vehicles.trackerTokenError),
      )

      trackerToken.value = extractTrackerToken(response)

      if (!trackerToken.value) {
        trackerError.value = messages.value.vehicles.trackerTokenUnavailable
      }
    } catch {
      return
    }
  }

  return {
    activeProfile,
    actionSuccess,
    closeDeleteDialog,
    closeTrackerDialog,
    closeVehicleDialog,
    confirmDelete,
    deleteError,
    filters,
    handleLogout,
    hasNextPage,
    isDeleteDialogOpen,
    isDeletingVehicle,
    isEditingVehicle,
    isInitialLoading,
    isLoading,
    isLoadingMore,
    isSavingTracker,
    isSavingVehicle,
    isTrackerDialogOpen,
    isVehicleDialogOpen,
    items,
    loadMoreVehicles: () => {
      if (!directory.hasNextPage || isLoading.value) {
        return
      }

      directory.filters.offset += directory.filters.limit
    },
    locale,
    messages,
    openCreateDialog,
    openDeleteDialog,
    openEditDialog,
    openTrackerDialog,
    pageError,
    regenerateToken,
    saveTrackerBinding,
    selectedTrackerId,
    selectedVehicleForDelete,
    selectedVehicleForTracker,
    session,
    setSearch: (value: string) => {
      resetFeedback()
      resetPageError()
      directory.filters.search = value
    },
    setSelectedTrackerId: (value: string) => {
      selectedTrackerId.value = value
    },
    setVehicleFormField: (
      field: keyof typeof vehicleForm,
      value: string | boolean,
    ) => {
      resetFeedback()
      resetVehicleError()

      if (field === 'isActive') {
        vehicleForm.isActive = Boolean(value)
        return
      }

      vehicleForm[field] = String(value)
    },
    setSortBy: (value: VehicleSortBy) => {
      resetFeedback()
      resetPageError()
      directory.filters.offset = 0
      directory.filters.sortBy = value
    },
    setSortOrder: (value: VehicleSortOrder) => {
      resetFeedback()
      resetPageError()
      directory.filters.offset = 0
      directory.filters.sortOrder = value
    },
    setTheme,
    submitVehicle,
    theme,
    trackerError,
    trackerToken,
    trackers,
    vehicleError,
    vehicleForm,
  }
}
