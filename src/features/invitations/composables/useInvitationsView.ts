import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  createStatusRule,
  getSafeErrorMessage,
  hasApiErrorMessage,
  mapApiErrorMessage,
} from '@core/api'
import { useSessionStore } from '@core/stores/session'
import { createInvitation, getInvitations } from '@features/invitations/api/invitations.api'
import type { InvitationItem } from '@features/invitations/types/InvitationItem'
import type { InvitationRole } from '@features/invitations/types/InvitationRole'
import type { InvitationSortOrder } from '@features/invitations/types/InvitationSortOrder'
import {
  createPaginatedDirectoryState,
  applyPaginatedItems,
  resetPaginatedDirectory,
  useDebouncedSearch,
  useDirectoryRouteSync,
} from '@shared/composables/paginatedDirectory'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import type { OwnerUser } from '@shared/types'

const DEFAULT_INVITATIONS_LIMIT = 30

const createInvitationFilters = () => ({
  limit: DEFAULT_INVITATIONS_LIMIT,
  offset: 0,
  search: '',
  sortOrder: 'DESC' as InvitationSortOrder,
})

export const useInvitationsView = () => {
  const route = useRoute()
  const router = useRouter()
  const { session, logout } = useSessionStore()
  const { theme, setTheme } = useTheme()
  const { locale, messages } = useI18n()
  const { isLoading, error: pageError, execute: executePage } = useApiState('')
  const { isLoading: isSubmitting, error: createError, execute: executeCreate, resetError } = useApiState('')
  const activeProfile = ref<OwnerUser | null>((session.user as OwnerUser | null) ?? null)
  const invitations = ref<InvitationItem[]>([])
  const createSuccess = ref('')
  const isInviteDialogOpen = ref(false)
  const form = reactive({
    email: '',
    role: 'driver' as InvitationRole,
  })
  const directory = reactive(createPaginatedDirectoryState<InvitationItem, ReturnType<typeof createInvitationFilters>>(createInvitationFilters))
  const filters = directory.filters
  const hasMoreInvitations = computed(() => directory.hasNextPage)
  const isInitialLoading = computed(() => isLoading.value && !directory.hasLoaded)
  const isLoadingMore = computed(() => isLoading.value && directory.hasLoaded && directory.filters.offset > 0)

  const normalizeSortOrder = (value: unknown): InvitationSortOrder =>
    value === 'ASC' ? 'ASC' : 'DESC'

  const applyQueryState = (): void => {
    filters.search = typeof route.query.search === 'string' ? route.query.search : ''
    filters.sortOrder = normalizeSortOrder(route.query.sortOrder)
    filters.offset = 0
    directory.appliedSearch = filters.search.trim()
  }

  useDirectoryRouteSync({
    route,
    router,
    applyRouteState: applyQueryState,
    buildRouteQuery: () => ({
      ...route.query,
      search: filters.search.trim() || undefined,
      sortOrder: filters.sortOrder === 'DESC' ? undefined : filters.sortOrder,
    }),
    watchSources: () => [filters.search, filters.sortOrder] as const,
  })

  const resetCreateFeedback = (): void => {
    createSuccess.value = ''
    resetError()
  }

  const loadInvitations = async (signal?: AbortSignal): Promise<void> => {
    try {
      const items = await executePage(
        () =>
          getInvitations(
            {
              limit: filters.limit,
              offset: filters.offset,
              sortOrder: filters.sortOrder,
              search: directory.appliedSearch,
            },
            signal,
          ),
        (error) => getSafeErrorMessage(error, messages.value.invitations.loadError),
      )

      invitations.value = Array.isArray(items) ? items : []
      applyPaginatedItems(directory, invitations.value)
      invitations.value = directory.items
    } catch {
      return
    }
  }

  watch(
    () => [session.accessToken, filters.limit, filters.offset, filters.sortOrder, directory.appliedSearch] as const,
    async (token, _previous, onCleanup) => {
      if (!token[0]) {
        invitations.value = []
        resetPaginatedDirectory(directory, createInvitationFilters)
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadInvitations(controller.signal)
    },
    { immediate: true },
  )

  useDebouncedSearch(
    () => filters.search,
    () => {
      filters.offset = 0
      directory.appliedSearch = filters.search.trim()
    },
  )

  const handleLogout = async (): Promise<void> => {
    logout()
    await router.replace({ name: 'login' })
  }

  const handleInviteSubmit = async (): Promise<void> => {
    resetCreateFeedback()

    try {
      await executeCreate(
        () =>
          createInvitation({
            email: form.email.trim(),
            role: form.role,
          }),
        (error) =>
          mapApiErrorMessage(error, messages.value.invitations.createError, [
            createStatusRule(
              409,
              messages.value.invitations.alreadyRegistered,
              (apiError) => hasApiErrorMessage(apiError, [/already registered/i]),
            ),
            createStatusRule(
              409,
              messages.value.invitations.alreadyInvited,
              (apiError) => hasApiErrorMessage(apiError, [/already sent/i]),
            ),
          ]),
      )

      if (filters.offset !== 0) {
        filters.offset = 0
      } else {
        await loadInvitations()
      }
      form.email = ''
      form.role = 'driver'
      createSuccess.value = messages.value.invitations.inviteSent
      isInviteDialogOpen.value = false
    } catch {
      return
    }
  }

  const openInviteDialog = (): void => {
    resetCreateFeedback()
    isInviteDialogOpen.value = true
  }

  const closeInviteDialog = (): void => {
    resetCreateFeedback()
    isInviteDialogOpen.value = false
  }

  const loadMoreInvitations = (): void => {
    if (!hasMoreInvitations.value || isLoading.value) {
      return
    }

    filters.offset += filters.limit
  }

  return {
    activeProfile,
    closeInviteDialog,
    createError,
    createSuccess,
    filters,
    form,
    hasMoreInvitations,
    handleInviteSubmit,
    handleLogout,
    invitations,
    isInviteDialogOpen,
    isInitialLoading,
    isLoading,
    isLoadingMore,
    isSubmitting,
    locale,
    loadMoreInvitations,
    messages,
    openInviteDialog,
    pageError,
    session,
    setInvitationEmail: (value: string) => {
      resetCreateFeedback()
      form.email = value
    },
    setInvitationRole: (value: InvitationRole) => {
      resetCreateFeedback()
      form.role = value
    },
    setSearch: (value: string) => {
      filters.search = value
    },
    setSortOrder: (value: InvitationSortOrder) => {
      filters.offset = 0
      filters.sortOrder = value
    },
    setTheme,
    theme,
  }
}
