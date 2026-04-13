import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { createStatusRule, getSafeErrorMessage, mapApiErrorMessage } from '@core/api'
import { logoutAndRedirect } from '@core/navigation/logout'
import { useSessionStore } from '@core/stores/session'
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
import type { DispatcherUser, OwnerUser } from '@shared/types'

import {
  assignDispatcherTrackingChannelTrip,
  createTrackingChannel,
  deleteTrackingChannel,
  getDispatcherChannelTrip,
  getDispatcherChannelTrips,
  getDispatcherTrackingChannel,
  getDispatcherTrackingChannels,
  getTrackingChannel,
  getOwnerTrips,
  getTrackingChannels,
  updateTrackingChannel,
} from '../api/channels.api'
import type { OwnerTripItem } from '../types/OwnerTripItem'
import type { TrackingChannelItem } from '../types/TrackingChannelItem'
import type { TrackingChannelSortBy } from '../types/TrackingChannelSortBy'
import type { TrackingChannelSortOrder } from '../types/TrackingChannelSortOrder'

const DEFAULT_LIMIT = 20
const TRIP_PICKER_LIMIT = 10
const createChannelFilters = () => ({
  limit: DEFAULT_LIMIT,
  offset: 0,
  search: '',
  sortBy: 'name' as TrackingChannelSortBy,
  sortOrder: 'ASC' as TrackingChannelSortOrder,
})

const createTripPickerFilters = () => ({
  limit: TRIP_PICKER_LIMIT,
  offset: 0,
  search: '',
})

export const useChannelsView = () => {
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
    isLoading: isSavingChannel,
    error: channelError,
    execute: executeChannelAction,
    resetError: resetChannelError,
  } = useApiState('')
  const {
    isLoading: isDeletingChannel,
    error: deleteError,
    execute: executeDeleteAction,
    resetError: resetDeleteError,
  } = useApiState('')
  const {
    isLoading: isLoadingTripOptions,
    execute: executeTripOptions,
  } = useApiState('')

  const isDispatcher = computed(() => session.role === 'dispatcher')
  const activeProfile = ref<OwnerUser | DispatcherUser | null>(
    (session.user as OwnerUser | DispatcherUser | null) ?? null,
  )
  const directory = reactive(createPaginatedDirectoryState<TrackingChannelItem, ReturnType<typeof createChannelFilters>>(createChannelFilters))
  const tripPicker = reactive(createPaginatedDirectoryState<OwnerTripItem, ReturnType<typeof createTripPickerFilters>>(createTripPickerFilters))
  const selectedTripOption = ref<OwnerTripItem | null>(null)
  const actionSuccess = ref('')
  const isChannelDialogOpen = ref(false)
  const isDeleteDialogOpen = ref(false)
  const selectedChannelForEdit = ref<TrackingChannelItem | null>(null)
  const selectedChannelForDelete = ref<TrackingChannelItem | null>(null)
  const form = reactive({
    name: '',
    assignedTripId: '',
  })
  const items = computed(() => directory.items)
  const filters = computed(() => directory.filters)
  const isInitialLoading = computed(() => isLoading.value && !directory.hasLoaded)
  const isLoadingMore = computed(() => isLoading.value && directory.hasLoaded && directory.filters.offset > 0)
  const hasNextPage = computed(() => directory.hasNextPage)
  const isEditingChannel = computed(() => selectedChannelForEdit.value !== null)
  const canCreateChannels = computed(() => !isDispatcher.value)
  const canDeleteChannels = computed(() => !isDispatcher.value)
  const canRenameChannels = computed(() => !isDispatcher.value)
  const availableTrips = computed(() => {
    const mergedItems = [...tripPicker.items]

    if (selectedTripOption.value && !mergedItems.some((item) => item.id === selectedTripOption.value?.id)) {
      mergedItems.unshift(selectedTripOption.value)
    }

    return mergedItems
  })
  const tripPickerOptions = computed(() =>
    availableTrips.value.map((trip) => ({
      value: String(trip.id),
      label: `${trip.name} · ${messages.value.channels[getTripStatusKey(trip.status)]}`,
    })),
  )
  const selectedTripLabel = computed(() => {
    if (!form.assignedTripId) {
      return messages.value.channels.unassigned
    }

    const trip = availableTrips.value.find((item) => String(item.id) === form.assignedTripId)

    return trip ? `${trip.name} · ${messages.value.channels[getTripStatusKey(trip.status)]}` : messages.value.channels.unassigned
  })

  const normalizeSortBy = (value: unknown): TrackingChannelSortBy =>
    value === 'tracking_channel_id' ? 'tracking_channel_id' : 'name'

  const normalizeSortOrder = (value: unknown): TrackingChannelSortOrder =>
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

  const resetFeedback = (): void => {
    actionSuccess.value = ''
  }

  const syncForm = (channel: TrackingChannelItem | null): void => {
    form.name = channel?.name ?? ''
    form.assignedTripId = channel?.assigned_trip_id ? String(channel.assigned_trip_id) : ''
  }

  const getPublicTrackingUrl = (token: string): string => `${window.location.origin}/tracking/${token}`

  const loadChannels = async (signal?: AbortSignal): Promise<void> => {
    try {
      const channels = await executePage(
        () =>
          (isDispatcher.value ? getDispatcherTrackingChannels : getTrackingChannels)(
            {
              limit: directory.filters.limit,
              offset: directory.filters.offset,
              search: directory.appliedSearch,
              sortBy: directory.filters.sortBy,
              sortOrder: directory.filters.sortOrder,
            },
            signal,
          ),
        (error) => getSafeErrorMessage(error, messages.value.channels.loadError),
      )

      applyPaginatedItems(directory, Array.isArray(channels) ? channels : [])
    } catch {
      return
    }
  }

  const loadSelectedTripOption = async (tripId: number, signal?: AbortSignal): Promise<void> => {
    try {
      selectedTripOption.value = isDispatcher.value
        ? await getDispatcherChannelTrip(tripId, signal)
        : await (async () => {
            const trips = await getOwnerTrips(
              {
                limit: 50,
                offset: 0,
                search: String(tripId),
                sortBy: 'trip_id',
                sortOrder: 'ASC',
              },
              signal,
            )

            return (Array.isArray(trips) ? trips : []).find((trip) => trip.id === tripId) ?? null
          })()
    } catch {
      return
    }
  }

  const loadTripOptions = async (signal?: AbortSignal): Promise<void> => {
    try {
      const trips = await executeTripOptions(
        () =>
          (isDispatcher.value ? getDispatcherChannelTrips : getOwnerTrips)(
            {
              limit: tripPicker.filters.limit,
              offset: tripPicker.filters.offset,
              search: tripPicker.appliedSearch,
              sortBy: 'trip_id',
              sortOrder: 'DESC',
            },
            signal,
          ),
        () => '',
      )

      applyUniquePaginatedItems(tripPicker, Array.isArray(trips) ? trips : [])
    } catch {
      return
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
        directory.appliedSearch,
      ] as const,
    async (token, _previous, onCleanup) => {
      if (!token[0]) {
        resetPaginatedDirectory(directory, createChannelFilters)
        resetPaginatedDirectory(tripPicker, createTripPickerFilters)
        selectedTripOption.value = null
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadChannels(controller.signal)
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
    () => tripPicker.filters.search,
    () => {
      tripPicker.filters.offset = 0
      tripPicker.appliedSearch = tripPicker.filters.search.trim()
    },
  )

  watch(
    () => [session.accessToken, tripPicker.filters.offset, tripPicker.appliedSearch, isChannelDialogOpen.value] as const,
    async (values, _previous, onCleanup) => {
      const [token, , , isDialogOpen] = values

      if (!token || !isDialogOpen) {
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadTripOptions(controller.signal)
    },
    { immediate: true },
  )

  const handleLogout = async (): Promise<void> => {
    logoutAndRedirect(logout)
  }

  const openCreateDialog = (): void => {
    if (!canCreateChannels.value) {
      return
    }

    resetFeedback()
    resetChannelError()
    selectedChannelForEdit.value = null
    syncForm(null)
    resetPaginatedDirectory(tripPicker, createTripPickerFilters)
    selectedTripOption.value = null
    isChannelDialogOpen.value = true
  }

  const openEditDialog = async (channel: TrackingChannelItem): Promise<void> => {
    resetFeedback()
    resetChannelError()
    const detail = await executeChannelAction(
      () => (isDispatcher.value ? getDispatcherTrackingChannel(channel.id) : getTrackingChannel(channel.id)),
      (error) => getSafeErrorMessage(error, messages.value.channels.loadError),
    ).catch(() => null)

    if (!detail) {
      return
    }

    selectedChannelForEdit.value = detail
    syncForm(detail)
    resetPaginatedDirectory(tripPicker, createTripPickerFilters)
    isChannelDialogOpen.value = true

    if (detail.assigned_trip_id) {
      void loadSelectedTripOption(detail.assigned_trip_id)
    } else {
      selectedTripOption.value = null
    }
  }

  const closeChannelDialog = (): void => {
    resetChannelError()
    selectedChannelForEdit.value = null
    syncForm(null)
    resetPaginatedDirectory(tripPicker, createTripPickerFilters)
    selectedTripOption.value = null
    isChannelDialogOpen.value = false
  }

  const openDeleteDialog = (channel: TrackingChannelItem): void => {
    if (!canDeleteChannels.value) {
      return
    }

    resetFeedback()
    resetDeleteError()
    selectedChannelForDelete.value = channel
    isDeleteDialogOpen.value = true
  }

  const closeDeleteDialog = (): void => {
    resetDeleteError()
    selectedChannelForDelete.value = null
    isDeleteDialogOpen.value = false
  }

  const submitChannel = async (): Promise<void> => {
    resetFeedback()
    resetChannelError()

    try {
      await executeChannelAction(
        () =>
          isDispatcher.value
            ? (() => {
                if (!selectedChannelForEdit.value) {
                  return Promise.reject(new Error('Channel must be selected before assignment'))
                }

                return assignDispatcherTrackingChannelTrip(selectedChannelForEdit.value.id, {
                  tripId: form.assignedTripId ? Number(form.assignedTripId) : null,
                })
              })()
            : (() => {
                const payload = {
                  name: form.name.trim(),
                  assigned_trip_id: form.assignedTripId ? Number(form.assignedTripId) : null,
                }

                return selectedChannelForEdit.value
                  ? updateTrackingChannel(selectedChannelForEdit.value.id, payload)
                  : createTrackingChannel(payload)
              })(),
        (error) =>
          mapApiErrorMessage(error, messages.value.channels.saveError, [
            createStatusRule(400, messages.value.channels.tripConflict),
          ]),
      )

      actionSuccess.value = selectedChannelForEdit.value || isDispatcher.value
        ? messages.value.channels.updateSuccess
        : messages.value.channels.createSuccess
      closeChannelDialog()
      await loadChannels()
    } catch {
      return
    }
  }

  const confirmDelete = async (): Promise<void> => {
    const channel = selectedChannelForDelete.value

    if (!channel) {
      return
    }

    resetFeedback()
    resetDeleteError()

    try {
      await executeDeleteAction(
        () => deleteTrackingChannel(channel.id),
        (error) => getSafeErrorMessage(error, messages.value.channels.deleteError),
      )

      actionSuccess.value = messages.value.channels.deleteSuccess
      closeDeleteDialog()
      await loadChannels()
    } catch {
      return
    }
  }

  return {
    actionSuccess,
    activeProfile,
    availableTrips,
    canCreateChannels,
    canDeleteChannels,
    canRenameChannels,
    channelError,
    closeChannelDialog,
    closeDeleteDialog,
    confirmDelete,
    deleteError,
    filters,
    form,
    getPublicTrackingUrl,
    handleLogout,
    hasNextPage,
    isChannelDialogOpen,
    isDeleteDialogOpen,
    isDeletingChannel,
    isEditingChannel,
    isInitialLoading,
    isLoading,
    isLoadingMore,
    isSavingChannel,
    items,
    loadMoreChannels: () => {
      if (!directory.hasNextPage || isLoading.value) {
        return
      }

      directory.filters.offset += directory.filters.limit
    },
    loadMoreTripOptions: () => {
      if (!tripPicker.hasNextPage || isLoadingTripOptions.value) {
        return
      }

      tripPicker.filters.offset += tripPicker.filters.limit
    },
    locale,
    messages,
    openCreateDialog,
    openDeleteDialog,
    openEditDialog,
    pageError,
    selectedChannelForEdit,
    selectedChannelForDelete,
    selectedTripLabel,
    session,
    setChannelFormField: (field: keyof typeof form, value: string) => {
      resetFeedback()
      resetChannelError()
      form[field] = value

      if (field === 'assignedTripId') {
        selectedTripOption.value =
          availableTrips.value.find((trip) => String(trip.id) === value) ?? null
      }
    },
    setSearch: (value: string) => {
      resetFeedback()
      resetPageError()
      directory.filters.search = value
    },
    setSortBy: (value: TrackingChannelSortBy) => {
      resetFeedback()
      resetPageError()
      directory.filters.offset = 0
      directory.filters.sortBy = value
    },
    setSortOrder: (value: TrackingChannelSortOrder) => {
      resetFeedback()
      resetPageError()
      directory.filters.offset = 0
      directory.filters.sortOrder = value
    },
    setTheme,
    setTripSearch: (value: string) => {
      resetChannelError()
      tripPicker.filters.search = value
    },
    submitChannel,
    theme,
    tripPickerHasNextPage: computed(() => tripPicker.hasNextPage),
    tripPickerIsLoading: isLoadingTripOptions,
    tripPickerOptions,
    tripSearchQuery: computed(() => tripPicker.filters.search),
  }
}

const getTripStatusKey = (status: OwnerTripItem['status']) => {
  switch (status) {
    case 'planned':
      return 'statusPlanned'
    case 'in_progress':
      return 'statusInProgress'
    case 'completed':
      return 'statusCompleted'
    case 'cancelled':
      return 'statusCancelled'
  }
}
