import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { createStatusRule, getSafeErrorMessage, mapApiErrorMessage } from '@core/api'
import { useSessionStore } from '@core/stores/session'
import {
  createTracker,
  deleteTracker,
  getTrackers,
  getVehicles,
  regenerateTrackerToken,
  updateTracker,
} from '@features/vehicles/api/vehicles.api'
import type {TrackerItem} from '@features/vehicles/types/TrackerItem'
import type {VehicleItem} from '@features/vehicles/types/VehicleItem'
import { getTrackerToken } from '@features/trackers/utils/trackerToken'
import {
  applyPaginatedItems,
  applyUniquePaginatedItems,
  createPaginatedDirectoryState,
  resetPaginatedDirectory,
  useDebouncedSearch,
  useDirectoryRouteSync,
} from '@shared/composables/paginatedDirectory'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import type { OwnerUser } from '@shared/types'

import type { TrackerSortBy } from '../types/TrackerSortBy'
import type { TrackerSortOrder } from '../types/TrackerSortOrder'

const DEFAULT_LIMIT = 20
const VEHICLE_PICKER_LIMIT = 10

const createTrackerFilters = () => ({
  limit: DEFAULT_LIMIT,
  offset: 0,
  search: '',
  sortBy: 'name' as TrackerSortBy,
  sortOrder: 'ASC' as TrackerSortOrder,
})

const createVehiclePickerFilters = () => ({
  limit: VEHICLE_PICKER_LIMIT,
  offset: 0,
  search: '',
})

export const useTrackersView = () => {
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
    isLoading: isSavingTracker,
    error: trackerError,
    execute: executeTrackerAction,
    resetError: resetTrackerError,
  } = useApiState('')
  const {
    isLoading: isDeletingTracker,
    error: deleteError,
    execute: executeDeleteAction,
    resetError: resetDeleteError,
  } = useApiState('')
  const {
    isLoading: isLoadingVehicleOptions,
    execute: executeVehicleOptions,
  } = useApiState('')

  const activeProfile = ref<OwnerUser | null>((session.user as OwnerUser | null) ?? null)
  const selectedVehicleOption = ref<VehicleItem | null>(null)
  const directory = reactive(createPaginatedDirectoryState<TrackerItem, ReturnType<typeof createTrackerFilters>>(createTrackerFilters))
  const vehiclePicker = reactive(createPaginatedDirectoryState<VehicleItem, ReturnType<typeof createVehiclePickerFilters>>(createVehiclePickerFilters))
  const actionSuccess = ref('')
  const trackerToken = ref('')
  const isTrackerDialogOpen = ref(false)
  const isTokenDialogOpen = ref(false)
  const isRegenerateConfirmOpen = ref(false)
  const isDeleteDialogOpen = ref(false)
  const selectedTrackerForEdit = ref<TrackerItem | null>(null)
  const selectedTrackerForDelete = ref<TrackerItem | null>(null)
  const selectedTrackerForRegeneration = ref<TrackerItem | null>(null)
  const trackerForm = reactive({
    name: '',
    vehicleId: '',
  })
  const items = computed(() => directory.items)
  const filters = computed(() => directory.filters)
  const isInitialLoading = computed(() => isLoading.value && !directory.hasLoaded)
  const isLoadingMore = computed(() => isLoading.value && directory.hasLoaded && directory.filters.offset > 0)
  const hasNextPage = computed(() => directory.hasNextPage)
  const isEditingTracker = computed(() => selectedTrackerForEdit.value !== null)
  const availableVehicles = computed(() => {
    const mergedItems = [...vehiclePicker.items]

    if (selectedVehicleOption.value && !mergedItems.some((item) => item.id === selectedVehicleOption.value?.id)) {
      mergedItems.unshift(selectedVehicleOption.value)
    }

    return mergedItems
  })
  const vehiclePickerOptions = computed(() =>
    availableVehicles.value.map((vehicle) => ({
      value: String(vehicle.id),
      label: `${vehicle.name} · ${vehicle.license_plate}`,
    })),
  )
  const selectedVehicleLabel = computed(() => {
    if (!trackerForm.vehicleId) {
      return messages.value.trackers.unassigned
    }

    const vehicle = availableVehicles.value.find((item) => String(item.id) === trackerForm.vehicleId)

    return vehicle ? `${vehicle.name} · ${vehicle.license_plate}` : messages.value.trackers.unassigned
  })
  const trackerIdToEdit = computed(() => {
    const rawValue = route.query.trackerId

    if (typeof rawValue !== 'string') {
      return null
    }

    const parsedValue = Number(rawValue)

    return Number.isFinite(parsedValue) ? parsedValue : null
  })

  const normalizeSortBy = (value: unknown): TrackerSortBy =>
    value === 'tracker_id' ? 'tracker_id' : 'name'

  const normalizeSortOrder = (value: unknown): TrackerSortOrder =>
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

  const syncTrackerForm = (tracker: TrackerItem | null): void => {
    trackerForm.name = tracker?.name ?? ''
    trackerForm.vehicleId = tracker?.vehicle_id ? String(tracker.vehicle_id) : ''
  }

  const resetFeedback = (): void => {
    actionSuccess.value = ''
  }

  const loadTrackers = async (signal?: AbortSignal): Promise<void> => {
    try {
      const trackerItems = await executePage(
        () =>
          getTrackers(
            {
              limit: directory.filters.limit,
              offset: directory.filters.offset,
              search: directory.appliedSearch,
              sortBy: directory.filters.sortBy,
              sortOrder: directory.filters.sortOrder,
            },
            signal,
          ),
        (error) => getSafeErrorMessage(error, messages.value.trackers.loadError),
      )

      applyPaginatedItems(directory, Array.isArray(trackerItems) ? trackerItems : [])
    } catch {
      return
    }
  }

  const loadSelectedVehicleOption = async (vehicleId: number, signal?: AbortSignal): Promise<void> => {
    try {
      const vehicleItems = await getVehicles(
        {
          limit: 1,
          offset: 0,
          sortBy: 'name',
          sortOrder: 'ASC',
          search: String(vehicleId),
        },
        signal,
      )

      selectedVehicleOption.value =
          (Array.isArray(vehicleItems) ? vehicleItems : []).find((vehicle) => vehicle.id === vehicleId) ?? null
    } catch {
      return
    }
  }

  const loadVehicleOptions = async (signal?: AbortSignal): Promise<void> => {
    try {
      const vehicleItems = await executeVehicleOptions(
        () =>
          getVehicles(
            {
              limit: vehiclePicker.filters.limit,
              offset: vehiclePicker.filters.offset,
              sortBy: 'name',
              sortOrder: 'ASC',
              search: vehiclePicker.appliedSearch,
            },
            signal,
          ),
        () => '',
      )

      applyUniquePaginatedItems(vehiclePicker, Array.isArray(vehicleItems) ? vehicleItems : [])
    } catch {
      return
    }
  }

  const refreshData = async (): Promise<void> => {
    await Promise.all([
      loadTrackers(),
      trackerForm.vehicleId ? loadSelectedVehicleOption(Number(trackerForm.vehicleId)) : Promise.resolve(),
      loadVehicleOptions(),
    ])
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
        resetPaginatedDirectory(directory, createTrackerFilters)
        resetPaginatedDirectory(vehiclePicker, createVehiclePickerFilters)
        selectedVehicleOption.value = null
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

  useDebouncedSearch(
    () => vehiclePicker.filters.search,
    () => {
      vehiclePicker.filters.offset = 0
      vehiclePicker.appliedSearch = vehiclePicker.filters.search.trim()
    },
  )

  watch(
    () => [session.accessToken, vehiclePicker.filters.offset, vehiclePicker.appliedSearch, isTrackerDialogOpen.value] as const,
    async (values, _previous, onCleanup) => {
      const [token, , , isDialogOpen] = values

      if (!token || !isDialogOpen) {
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadVehicleOptions(controller.signal)
    },
    { immediate: true },
  )

  const handleLogout = async (): Promise<void> => {
    logout()
    await router.replace({ name: 'login' })
  }

  const openCreateDialog = (): void => {
    resetFeedback()
    resetTrackerError()
    trackerToken.value = ''
    selectedTrackerForEdit.value = null
    syncTrackerForm(null)
    resetPaginatedDirectory(vehiclePicker, createVehiclePickerFilters)
    selectedVehicleOption.value = null
    isTrackerDialogOpen.value = true
  }

  const openEditDialog = (tracker: TrackerItem): void => {
    resetFeedback()
    resetTrackerError()
    trackerToken.value = ''
    selectedTrackerForEdit.value = tracker
    syncTrackerForm(tracker)
    resetPaginatedDirectory(vehiclePicker, createVehiclePickerFilters)
    isTrackerDialogOpen.value = true

    if (tracker.vehicle_id) {
      void loadSelectedVehicleOption(tracker.vehicle_id)
    } else {
      selectedVehicleOption.value = null
    }
  }

  const closeTrackerDialog = (): void => {
    resetTrackerError()
    selectedTrackerForEdit.value = null
    syncTrackerForm(null)
    resetPaginatedDirectory(vehiclePicker, createVehiclePickerFilters)
    selectedVehicleOption.value = null
    isTrackerDialogOpen.value = false

    if (route.query.trackerId) {
      void router.replace({
        query: {
          ...route.query,
          trackerId: undefined,
        },
      })
    }
  }

  const closeTokenDialog = (): void => {
    trackerToken.value = ''
    isTokenDialogOpen.value = false
  }

  const openDeleteDialog = (tracker: TrackerItem): void => {
    resetFeedback()
    resetDeleteError()
    selectedTrackerForDelete.value = tracker
    isDeleteDialogOpen.value = true
  }

  const closeDeleteDialog = (): void => {
    resetDeleteError()
    selectedTrackerForDelete.value = null
    isDeleteDialogOpen.value = false
  }

  const openRegenerateConfirm = (): void => {
    if (!selectedTrackerForEdit.value) {
      return
    }

    resetTrackerError()
    selectedTrackerForRegeneration.value = selectedTrackerForEdit.value
    isRegenerateConfirmOpen.value = true
  }

  const closeRegenerateConfirm = (): void => {
    selectedTrackerForRegeneration.value = null
    isRegenerateConfirmOpen.value = false
  }

  watch(
    () => [trackerIdToEdit.value, items.value] as const,
    ([targetTrackerId, trackerItems]) => {
      if (!targetTrackerId) {
        return
      }

      const tracker = trackerItems.find((item) => item.id === targetTrackerId)

      if (!tracker) {
        return
      }

      if (selectedTrackerForEdit.value?.id === tracker.id && isTrackerDialogOpen.value) {
        return
      }

      openEditDialog(tracker)
    },
    { immediate: true },
  )

  const submitTracker = async (): Promise<void> => {
    resetFeedback()
    resetTrackerError()

    const payload = {
      name: trackerForm.name.trim(),
      vehicle_id: trackerForm.vehicleId ? Number(trackerForm.vehicleId) : null,
    }

    try {
      const response = await executeTrackerAction(
        () =>
          selectedTrackerForEdit.value
            ? updateTracker(selectedTrackerForEdit.value.id, payload)
            : createTracker(payload),
        (error) =>
          mapApiErrorMessage(error, messages.value.trackers.saveError, [
            createStatusRule(409, messages.value.trackers.vehicleConflict),
          ]),
      )

      trackerToken.value = getTrackerToken(response)
      actionSuccess.value = selectedTrackerForEdit.value
        ? messages.value.trackers.updateSuccess
        : messages.value.trackers.createSuccess
      closeTrackerDialog()
      if (trackerToken.value) {
        isTokenDialogOpen.value = true
      }
      await refreshData()
    } catch {
      return
    }
  }

  const confirmDelete = async (): Promise<void> => {
    const tracker = selectedTrackerForDelete.value

    if (!tracker) {
      return
    }

    resetFeedback()
    resetDeleteError()

    try {
      await executeDeleteAction(
        () => deleteTracker(tracker.id),
        (error) =>
          mapApiErrorMessage(error, messages.value.trackers.deleteError, [
            createStatusRule(409, messages.value.trackers.deleteConflict),
          ]),
      )

      actionSuccess.value = messages.value.trackers.deleteSuccess
      closeDeleteDialog()
      await refreshData()
    } catch {
      return
    }
  }

  const handleRegenerateToken = async (tracker: TrackerItem): Promise<void> => {
    resetFeedback()
    resetTrackerError()

    try {
      const response = await executeTrackerAction(
        () => regenerateTrackerToken(tracker.id),
        (error) => getSafeErrorMessage(error, messages.value.trackers.tokenError),
      )

      trackerToken.value = getTrackerToken(response)
      actionSuccess.value = messages.value.trackers.tokenSuccess
      closeRegenerateConfirm()
      if (trackerToken.value) {
        isTokenDialogOpen.value = true
      }
      await refreshData()
    } catch {
      return
    }
  }

  const confirmRegenerateToken = async (): Promise<void> => {
    if (!selectedTrackerForRegeneration.value) {
      return
    }

    await handleRegenerateToken(selectedTrackerForRegeneration.value)
  }

  return {
    actionSuccess,
    activeProfile,
    availableVehicles,
    vehiclePickerOptions,
    selectedVehicleLabel,
    closeRegenerateConfirm,
    closeTokenDialog,
    closeDeleteDialog,
    closeTrackerDialog,
    confirmRegenerateToken,
    confirmDelete,
    deleteError,
    filters,
    handleLogout,
    hasNextPage,
    isDeleteDialogOpen,
    isDeletingTracker,
    isEditingTracker,
    isInitialLoading,
    isLoading,
    isLoadingMore,
    isRegenerateConfirmOpen,
    isSavingTracker,
    isTrackerDialogOpen,
    isTokenDialogOpen,
    items,
    loadMoreTrackers: () => {
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
    openRegenerateConfirm,
    pageError,
    selectedTrackerForRegeneration,
    selectedTrackerForDelete,
    session,
    setSearch: (value: string) => {
      resetFeedback()
      resetPageError()
      directory.filters.search = value
    },
    setSortBy: (value: TrackerSortBy) => {
      resetFeedback()
      resetPageError()
      directory.filters.offset = 0
      directory.filters.sortBy = value
    },
    setSortOrder: (value: TrackerSortOrder) => {
      resetFeedback()
      resetPageError()
      directory.filters.offset = 0
      directory.filters.sortOrder = value
    },
    setVehicleSearch: (value: string) => {
      resetTrackerError()
      vehiclePicker.filters.search = value
    },
    setTheme,
    setTrackerFormField: (field: keyof typeof trackerForm, value: string) => {
      resetTrackerError()
      resetFeedback()
      trackerForm[field] = value

      if (field === 'vehicleId') {
        selectedVehicleOption.value =
          availableVehicles.value.find((vehicle) => String(vehicle.id) === value) ?? null
      }
    },
    submitTracker,
    theme,
    trackerError,
    trackerForm,
    trackerToken,
    vehicles: availableVehicles,
    vehiclePickerHasNextPage: computed(() => vehiclePicker.hasNextPage),
    vehiclePickerIsLoading: isLoadingVehicleOptions,
    vehicleSearchQuery: computed(() => vehiclePicker.filters.search),
    loadMoreVehicleOptions: () => {
      if (!vehiclePicker.hasNextPage || isSavingTracker.value) {
        return
      }

      vehiclePicker.filters.offset += vehiclePicker.filters.limit
    },
  }
}
