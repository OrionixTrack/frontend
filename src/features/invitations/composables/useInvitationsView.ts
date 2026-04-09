import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { getSafeErrorMessage, isApiError } from '@core/api/errors'
import { useSessionStore } from '@core/stores/session'
import { createInvitation, getInvitations } from '@features/invitations/api/invitations.api'
import type { InvitationItem } from '@features/invitations/types/InvitationItem'
import type { InvitationRole } from '@features/invitations/types/InvitationRole'
import type { InvitationSortOrder } from '@features/invitations/types/InvitationSortOrder'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import type { OwnerUser } from '@shared/types'

const DEFAULT_INVITATIONS_LIMIT = 30

export const useInvitationsView = () => {
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
  const appliedSearch = ref('')
  const form = reactive({
    email: '',
    role: 'driver' as InvitationRole,
  })
  const filters = reactive({
    limit: DEFAULT_INVITATIONS_LIMIT,
    offset: 0,
    search: '',
    sortOrder: 'DESC' as InvitationSortOrder,
  })
  const hasMoreInvitations = ref(true)
  const isInitialLoading = computed(() => isLoading.value && invitations.value.length === 0)
  const isLoadingMore = computed(() => isLoading.value && invitations.value.length > 0)

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
              search: appliedSearch.value,
            },
            signal,
          ),
        (error) => getSafeErrorMessage(error, messages.value.invitations.loadError),
      )

      const normalizedItems = Array.isArray(items) ? items : []
      invitations.value =
        filters.offset === 0
          ? normalizedItems
          : [...invitations.value, ...normalizedItems]
      hasMoreInvitations.value = normalizedItems.length === filters.limit
    } catch {
      return
    }
  }

  watch(
    () => [session.accessToken, filters.limit, filters.offset, filters.sortOrder, appliedSearch.value] as const,
    async (token, _previous, onCleanup) => {
      if (!token[0]) {
        invitations.value = []
        hasMoreInvitations.value = true
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadInvitations(controller.signal)
    },
    { immediate: true },
  )

  watch(
    () => filters.search,
    (value, _previous, onCleanup) => {
      const timeoutId = window.setTimeout(() => {
        filters.offset = 0
        appliedSearch.value = value.trim()
      }, 250)

      onCleanup(() => window.clearTimeout(timeoutId))
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
        (error) => {
          if (isApiError(error) && error.status === 409) {
            if (/already registered/i.test(error.message)) {
              return messages.value.invitations.alreadyRegistered
            }

            if (/already sent/i.test(error.message)) {
              return messages.value.invitations.alreadyInvited
            }
          }

          return getSafeErrorMessage(error, messages.value.invitations.createError)
        },
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
