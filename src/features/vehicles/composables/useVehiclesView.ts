import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { createStatusRule, getSafeErrorMessage, mapApiErrorMessage } from '@core/api'
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
import { getTrackerToken } from '@features/trackers/utils/trackerToken'
import {
  applyPaginatedItems,
  createPaginatedDirectoryState,
  resetPaginatedDirectory,
  useDebouncedSearch,
  useDirectoryRouteSync,
} from '@shared/composables/paginatedDirectory'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import type { OwnerUser } from '@shared/types'

const DEFAULT_LIMIT = 20
const createVehicleFilters = () => ({
  limit: DEFAULT_LIMIT,
  offset: 0,
  search: '',
  sortBy: 'name' as VehicleSortBy,
  sortOrder: 'ASC' as VehicleSortOrder,
})

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
  const directory = reactive(createPaginatedDirectoryState<VehicleItem, ReturnType<typeof createVehicleFilters>>(createVehicleFilters))
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
    directory.filters.search = typeof route.query.search === 'string' ? route.query.search : ''
    directory.filters.sortBy = normalizeSortBy(route.query.sortBy)
    directory.filters.sortOrder = normalizeSortOrder(route.query.sortOrder)
    directory.filters.offset = 0
    directory.appliedSearch = directory.filters.search.trim()
  }

  useDirectoryRouteSync({
    route,
    router,
    applyRouteState: applyQueryState,
    buildRouteQuery: () => ({
      ...route.query,
      search: directory.filters.search.trim() || undefined,
      sortBy: directory.filters.sortBy === 'name' ? undefined : directory.filters.sortBy,
      sortOrder: directory.filters.sortOrder === 'ASC' ? undefined : directory.filters.sortOrder,
    }),
    watchSources: () => [directory.filters.search, directory.filters.sortBy, directory.filters.sortOrder] as const,
  })

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

      applyPaginatedItems(directory, Array.isArray(vehicleItems) ? vehicleItems : [])
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
        resetPaginatedDirectory(directory, createVehicleFilters)
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

  useDebouncedSearch(
    () => directory.filters.search,
    () => {
      directory.filters.offset = 0
      directory.appliedSearch = directory.filters.search.trim()
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
        (error) =>
          mapApiErrorMessage(error, messages.value.vehicles.saveError, [
            createStatusRule(409, messages.value.vehicles.duplicateLicensePlate),
          ]),
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
        (error) =>
          mapApiErrorMessage(error, messages.value.vehicles.deleteError, [
            createStatusRule(409, messages.value.vehicles.deleteConflict),
          ]),
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

      trackerToken.value = getTrackerToken(response)

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
