<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import BaseButton from '@shared/components/BaseButton.vue'
import BaseDialog from '@shared/components/BaseDialog.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import { useSnackbar } from '@shared/composables/useSnackbar'
import type { InvitationItem } from '@features/invitations/types/InvitationItem'
import type { InvitationRole } from '@features/invitations/types/InvitationRole'
import type { InvitationSortOrder } from '@features/invitations/types/InvitationSortOrder'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { OwnerUser, SessionState } from '@shared/types'

const props = defineProps<{
  session: Readonly<SessionState>
  activeProfile: OwnerUser | null
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
  invitationEmail: string
  invitationRole: InvitationRole
  invitations: InvitationItem[]
  isInviteDialogOpen: boolean
  hasMoreInvitations: boolean
  isInitialLoading: boolean
  isLoading: boolean
  isLoadingMore: boolean
  isSubmitting: boolean
  pageError: string
  searchQuery: string
  sortOrder: InvitationSortOrder
  createError: string
  createSuccess: string
}>()

const emit = defineEmits<{
  logout: []
  closeInviteDialog: []
  loadMore: []
  openInviteDialog: []
  updateTheme: [theme: AppTheme]
  updateSearchQuery: [value: string]
  updateInvitationEmail: [value: string]
  updateInvitationRole: [value: InvitationRole]
  updateSortOrder: [value: InvitationSortOrder]
  submitInvitation: []
}>()

const { showSnackbar } = useSnackbar()
const loadMoreTrigger = ref(null)
const hasTriedInviteSubmit = ref(false)
let observer: { disconnect: () => void; observe: (element: unknown) => void } | null = null

const disconnectObserver = (): void => {
  observer?.disconnect()
  observer = null
}

const connectObserver = (): void => {
  disconnectObserver()

  if (!loadMoreTrigger.value) {
    return
  }

  observer = new window.IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting) && props.hasMoreInvitations && !props.isLoading) {
        emit('loadMore')
      }
    },
    {
      rootMargin: '240px 0px',
    },
  )

  observer.observe(loadMoreTrigger.value)
}

onMounted(connectObserver)
onBeforeUnmount(disconnectObserver)
watch([loadMoreTrigger, () => props.hasMoreInvitations, () => props.isLoading], connectObserver)
watch(
  () => props.createSuccess,
  (value) => {
    if (value) {
      showSnackbar(value, { tone: 'success' })
    }
  },
)

const normalizedInvitationEmail = computed(() => props.invitationEmail.trim())
const hasInvitationEmailError = computed(() => {
  if (!normalizedInvitationEmail.value) {
    return false
  }

  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedInvitationEmail.value)
})

const shouldShowInvitationEmailError = computed(
  () => hasTriedInviteSubmit.value && hasInvitationEmailError.value,
)
const invitationsEmptyMessage = computed(() =>
  props.searchQuery.trim() ? props.messages.invitations.emptySearch : props.messages.invitations.empty,
)

const formatDate = (value: string, locale: Locale): string =>
  new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const getStatusLabel = (status: InvitationItem['status'], messages: TranslationDictionary): string => {
  switch (status) {
    case 'accepted':
      return messages.invitations.statusAccepted
    case 'expired':
      return messages.invitations.statusExpired
    default:
      return messages.invitations.statusPending
  }
}

const handleInviteSubmit = (): void => {
  hasTriedInviteSubmit.value = true

  if (!normalizedInvitationEmail.value || hasInvitationEmailError.value) {
    return
  }

  emit('submitInvitation')
}

const handleCloseInviteDialog = (): void => {
  hasTriedInviteSubmit.value = false
  emit('closeInviteDialog')
}
</script>

<template>
  <WorkspaceShell
    :session="session"
    :active-profile="activeProfile"
    :is-loading="isInitialLoading"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :title="messages.invitations.pageTitle"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
    <BaseDialog :open="isInviteDialogOpen" @close="handleCloseInviteDialog">
        <div class="panel-header modal-header">
          <div>
            <p class="section-kicker">{{ messages.invitations.pageTitle }}</p>
            <h3>{{ messages.invitations.inviteTitle }}</h3>
          </div>
          <BaseButton
            class="dialog-close"
            :aria-label="messages.common.close"
            @click="handleCloseInviteDialog"
          >
            ×
          </BaseButton>
        </div>

        <p class="muted-copy">{{ messages.invitations.inviteDescription }}</p>

        <form class="auth-form" @submit.prevent="handleInviteSubmit">
          <label class="field" for="invite-email">
            <span>{{ messages.invitations.email }}</span>
            <BaseInput
              id="invite-email"
              :model-value="invitationEmail"
              autocomplete="email"
              inputmode="email"
              type="email"
              required
              @update:model-value="emit('updateInvitationEmail', $event)"
            />
          </label>

          <p v-if="shouldShowInvitationEmailError" class="error-banner">{{ messages.invitations.invalidEmail }}</p>

          <div class="field">
            <span>{{ messages.invitations.role }}</span>
            <div class="role-switch role-switch-tabs">
              <BaseButton
                class="role-option"
                :class="{ active: invitationRole === 'driver' }"
                @click="emit('updateInvitationRole', 'driver')"
              >
                {{ messages.invitations.roleDriver }}
              </BaseButton>
              <BaseButton
                class="role-option"
                :class="{ active: invitationRole === 'dispatcher' }"
                @click="emit('updateInvitationRole', 'dispatcher')"
              >
                {{ messages.invitations.roleDispatcher }}
              </BaseButton>
            </div>
          </div>

          <p v-if="createError" class="error-banner">{{ createError }}</p>

          <div class="auth-actions modal-actions">
            <BaseButton class="btn btn-secondary" :disabled="isSubmitting" @click="handleCloseInviteDialog">
              {{ messages.common.cancel }}
            </BaseButton>
            <BaseButton class="btn btn-primary auth-submit" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? messages.invitations.sendingInvite : messages.invitations.sendInvite }}
            </BaseButton>
          </div>
        </form>
    </BaseDialog>

    <section class="dashboard-grid invitations-layout">
      <article class="panel settings-panel invitations-panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">{{ messages.invitations.pageTitle }}</p>
            <h3>{{ messages.invitations.listTitle }}</h3>
          </div>
          <BaseButton class="btn btn-primary" @click="emit('openInviteDialog')">
            {{ messages.invitations.openInviteDialog }}
          </BaseButton>
        </div>

        <p class="muted-copy">{{ messages.invitations.inviteDescription }}</p>
        <p v-if="pageError" class="error-banner">{{ pageError }}</p>

        <div class="table-toolbar">
          <label class="field table-search" for="invitation-search">
            <span>{{ messages.invitations.email }}</span>
            <BaseInput
              id="invitation-search"
              :model-value="searchQuery"
              :placeholder="messages.invitations.searchPlaceholder"
              @update:model-value="emit('updateSearchQuery', $event)"
            />
          </label>

          <div class="field">
            <span>{{ messages.invitations.status }}</span>
            <div class="role-switch role-switch-tabs compact-switch">
              <BaseButton
                class="role-option"
                :class="{ active: sortOrder === 'DESC' }"
                @click="emit('updateSortOrder', 'DESC')"
              >
                {{ messages.invitations.newestFirst }}
              </BaseButton>
              <BaseButton
                class="role-option"
                :class="{ active: sortOrder === 'ASC' }"
                @click="emit('updateSortOrder', 'ASC')"
              >
                {{ messages.invitations.oldestFirst }}
              </BaseButton>
            </div>
          </div>
        </div>

        <div v-if="!invitations.length" class="endpoint-row empty-row">
          {{ invitationsEmptyMessage }}
        </div>

        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ messages.invitations.email }}</th>
                <th>{{ messages.invitations.role }}</th>
                <th>{{ messages.invitations.status }}</th>
                <th>{{ messages.invitations.createdAt }}</th>
                <th>{{ messages.invitations.expiresAt }}</th>
                <th>{{ messages.invitations.acceptedAt }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invitation in invitations" :key="invitation.invitation_id">
                <td class="table-email">{{ invitation.email }}</td>
                <td>
                  {{ invitation.role === 'driver' ? messages.invitations.roleDriver : messages.invitations.roleDispatcher }}
                </td>
                <td>
                  <span class="status-pill invitation-status-pill" :class="invitation.status">
                    {{ getStatusLabel(invitation.status, messages) }}
                  </span>
                </td>
                <td>{{ formatDate(invitation.created_at, locale) }}</td>
                <td>{{ formatDate(invitation.expires_at, locale) }}</td>
                <td>{{ invitation.accepted_at ? formatDate(invitation.accepted_at, locale) : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div ref="loadMoreTrigger" class="table-load-more">
          <span v-if="isLoadingMore" class="muted-copy">{{ messages.common.loading }}</span>
          <span v-else-if="hasMoreInvitations" class="muted-copy"> </span>
        </div>
      </article>
    </section>
  </WorkspaceShell>
</template>
