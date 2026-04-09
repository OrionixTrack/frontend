<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import BaseButton from '@shared/components/BaseButton.vue'
import BaseDialog from '@shared/components/BaseDialog.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import BaseSearchSelect from '@shared/components/BaseSearchSelect.vue'
import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import { useSnackbar } from '@shared/composables/useSnackbar'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { OwnerUser, SessionState } from '@shared/types'

import type { OwnerTripItem } from '../types/OwnerTripItem'
import type { TrackingChannelItem } from '../types/TrackingChannelItem'
import type { TrackingChannelSortBy } from '../types/TrackingChannelSortBy'
import type { TrackingChannelSortOrder } from '../types/TrackingChannelSortOrder'

const props = defineProps<{
  session: Readonly<SessionState>
  activeProfile: OwnerUser | null
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
  channels: TrackingChannelItem[]
  availableTrips: OwnerTripItem[]
  tripPickerOptions: Array<{ value: string; label: string }>
  selectedTripLabel: string
  tripSearchQuery: string
  tripPickerIsLoading: boolean
  tripPickerHasNextPage: boolean
  searchQuery: string
  sortBy: TrackingChannelSortBy
  sortOrder: TrackingChannelSortOrder
  pageError: string
  actionSuccess: string
  isLoading: boolean
  isInitialLoading: boolean
  hasNextPage: boolean
  isLoadingMore: boolean
  isChannelDialogOpen: boolean
  isEditingChannel: boolean
  isSavingChannel: boolean
  channelError: string
  selectedChannelForEdit: TrackingChannelItem | null
  form: {
    name: string
    assignedTripId: string
  }
  isDeleteDialogOpen: boolean
  isDeletingChannel: boolean
  deleteError: string
  selectedChannelForDelete: TrackingChannelItem | null
  getPublicTrackingUrl: (token: string) => string
}>()

const emit = defineEmits<{
  logout: []
  updateTheme: [theme: AppTheme]
  openCreateDialog: []
  openEditDialog: [channel: TrackingChannelItem]
  closeChannelDialog: []
  updateSearchQuery: [value: string]
  updateSortBy: [value: TrackingChannelSortBy]
  updateSortOrder: [value: TrackingChannelSortOrder]
  updateChannelForm: [field: keyof typeof props.form, value: string]
  updateTripSearchQuery: [value: string]
  submitChannel: []
  openDeleteDialog: [channel: TrackingChannelItem]
  closeDeleteDialog: []
  confirmDelete: []
  loadMoreTripOptions: []
  loadMore: []
}>()

const { showSnackbar } = useSnackbar()
const hasTriedSubmit = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const sortOptions: TrackingChannelSortBy[] = ['name', 'tracking_channel_id']
const normalizedName = computed(() => props.form.name.trim())
const hasValidationError = computed(() => !normalizedName.value)
const shouldShowValidationError = computed(() => hasTriedSubmit.value && hasValidationError.value)
const emptyStateMessage = computed(() =>
  props.searchQuery.trim() ? props.messages.channels.emptySearch : props.messages.channels.empty,
)

const getSortLabel = (value: TrackingChannelSortBy): string =>
  value === 'tracking_channel_id' ? props.messages.channels.sortChannelId : props.messages.channels.sortName

const getTripLabel = (channel: TrackingChannelItem): string => {
  if (!channel.assigned_trip_id) {
    return props.messages.channels.unassigned
  }

  const trip = props.availableTrips.find((item) => item.id === channel.assigned_trip_id)

  return trip ? trip.name : `#${channel.assigned_trip_id}`
}

const getChannelPublicLink = (channel: TrackingChannelItem): string => props.getPublicTrackingUrl(channel.publicToken)

const copyText = async (value: string, successMessage: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(value)
    showSnackbar(successMessage, { tone: 'success' })
  } catch {
    showSnackbar(props.messages.channels.copyError, { tone: 'error' })
  }
}

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
      if (entries.some((entry) => entry.isIntersecting) && props.hasNextPage && !props.isLoading) {
        emit('loadMore')
      }
    },
    {
      rootMargin: '240px 0px',
    },
  )

  observer?.observe(loadMoreTrigger.value)
}

const handleSubmit = (): void => {
  hasTriedSubmit.value = true

  if (hasValidationError.value) {
    return
  }

  emit('submitChannel')
}

const handleCloseDialog = (): void => {
  hasTriedSubmit.value = false
  emit('closeChannelDialog')
}

const handleSortByChange = (event: Event): void => {
  const target = event.target

  if (!(target instanceof window.HTMLSelectElement)) {
    return
  }

  emit('updateSortBy', target.value as TrackingChannelSortBy)
}

onMounted(connectObserver)
onBeforeUnmount(disconnectObserver)
watch([loadMoreTrigger, () => props.hasNextPage, () => props.isLoading], connectObserver)
watch(
  () => props.actionSuccess,
  (value) => {
    if (value) {
      showSnackbar(value, { tone: 'success' })
    }
  },
)
</script>

<template>
  <WorkspaceShell
    :session="session"
    :active-profile="activeProfile"
    :is-loading="isInitialLoading"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :title="messages.channels.pageTitle"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
    <BaseDialog :open="isChannelDialogOpen" @close="handleCloseDialog">
      <div class="panel-header modal-header">
        <div>
          <p class="section-kicker">{{ messages.channels.pageTitle }}</p>
          <h3>{{ isEditingChannel ? messages.channels.editTitle : messages.channels.createTitle }}</h3>
        </div>
        <BaseButton class="dialog-close" :aria-label="messages.common.close" @click="handleCloseDialog">
          ×
        </BaseButton>
      </div>

      <p class="muted-copy">
        {{ isEditingChannel ? messages.channels.editDescription : messages.channels.createDescription }}
      </p>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label class="field" for="channel-name">
          <span>{{ messages.channels.fieldName }}</span>
          <BaseInput
            id="channel-name"
            :model-value="form.name"
            @update:model-value="emit('updateChannelForm', 'name', $event)"
          />
        </label>

        <label class="field" for="channel-trip">
          <span>{{ messages.channels.fieldTrip }}</span>
          <BaseSearchSelect
            id="channel-trip"
            :model-value="form.assignedTripId"
            :selected-label="selectedTripLabel"
            :search-query="tripSearchQuery"
            :placeholder="messages.channels.searchTripPlaceholder"
            :empty-label="messages.channels.unassigned"
            :loading-label="messages.common.loading"
            :options="tripPickerOptions"
            :is-loading="tripPickerIsLoading"
            :has-next-page="tripPickerHasNextPage"
            @update:model-value="emit('updateChannelForm', 'assignedTripId', $event)"
            @update:search-query="emit('updateTripSearchQuery', $event)"
            @load-more="emit('loadMoreTripOptions')"
          />
        </label>

        <div v-if="isEditingChannel && selectedChannelForEdit" class="channel-detail-grid">
          <div class="channel-detail-card">
            <span>{{ messages.channels.publicLinkLabel }}</span>
            <div class="channel-copy-row">
              <code>{{ getChannelPublicLink(selectedChannelForEdit) }}</code>
              <BaseButton
                class="tracker-icon-button channel-copy-button"
                :aria-label="messages.channels.copyLink"
                @click="copyText(getChannelPublicLink(selectedChannelForEdit), messages.channels.copyLinkSuccess)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M9 9.75A2.25 2.25 0 0 1 11.25 7.5h7.5A2.25 2.25 0 0 1 21 9.75v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5A2.25 2.25 0 0 1 9 17.25z"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                  />
                  <path
                    d="M15 7.5V6A2.25 2.25 0 0 0 12.75 3.75h-7.5A2.25 2.25 0 0 0 3 6v7.5a2.25 2.25 0 0 0 2.25 2.25H6.75"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                  />
                </svg>
              </BaseButton>
            </div>
          </div>
        </div>

        <p v-if="shouldShowValidationError" class="error-banner">
          {{ messages.channels.validationError }}
        </p>
        <p v-if="channelError" class="error-banner">
          {{ channelError }}
        </p>

        <div class="auth-actions modal-actions">
          <BaseButton class="btn btn-secondary" :disabled="isSavingChannel" @click="handleCloseDialog">
            {{ messages.common.cancel }}
          </BaseButton>
          <BaseButton class="btn btn-primary auth-submit" type="submit" :disabled="isSavingChannel">
            {{ isSavingChannel ? messages.channels.saving : messages.channels.saveChanges }}
          </BaseButton>
        </div>
      </form>
    </BaseDialog>

    <BaseDialog :open="isDeleteDialogOpen" @close="emit('closeDeleteDialog')">
      <div class="panel-header modal-header">
        <div>
          <p class="section-kicker">{{ messages.channels.pageTitle }}</p>
          <h3>{{ messages.channels.deleteTitle }}</h3>
        </div>
        <BaseButton class="dialog-close" :aria-label="messages.common.close" @click="emit('closeDeleteDialog')">
          ×
        </BaseButton>
      </div>

      <p class="muted-copy">{{ messages.channels.deleteDescription }}</p>
      <p v-if="selectedChannelForDelete" class="info-banner">
        {{ selectedChannelForDelete.name }}
      </p>
      <p v-if="deleteError" class="error-banner">
        {{ deleteError }}
      </p>

      <div class="auth-actions modal-actions">
        <BaseButton class="btn btn-secondary" :disabled="isDeletingChannel" @click="emit('closeDeleteDialog')">
          {{ messages.common.cancel }}
        </BaseButton>
        <BaseButton class="btn btn-danger auth-submit" :disabled="isDeletingChannel" @click="emit('confirmDelete')">
          {{ isDeletingChannel ? messages.channels.deleting : messages.channels.confirmDelete }}
        </BaseButton>
      </div>
    </BaseDialog>

    <section class="dashboard-grid invitations-layout">
      <article class="panel settings-panel invitations-panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">{{ messages.channels.pageTitle }}</p>
            <h3>{{ messages.channels.listTitle }}</h3>
          </div>
          <BaseButton class="btn btn-primary" @click="emit('openCreateDialog')">
            {{ messages.channels.createAction }}
          </BaseButton>
        </div>

        <p class="muted-copy page-description">{{ messages.channels.description }}</p>
        <p v-if="pageError" class="error-banner">{{ pageError }}</p>

        <div class="table-toolbar channels-toolbar">
          <label class="field table-search" for="channel-search">
            <span>{{ messages.channels.searchLabel }}</span>
            <BaseInput
              id="channel-search"
              :model-value="searchQuery"
              :placeholder="messages.channels.searchPlaceholder"
              @update:model-value="emit('updateSearchQuery', $event)"
            />
          </label>

          <label class="field" for="channel-sort-by">
            <span>{{ messages.channels.sortByLabel }}</span>
            <select id="channel-sort-by" :value="sortBy" @change="handleSortByChange">
              <option v-for="option in sortOptions" :key="option" :value="option">
                {{ getSortLabel(option) }}
              </option>
            </select>
          </label>

          <div class="field">
            <span>{{ messages.channels.sortOrderLabel }}</span>
            <div class="role-switch role-switch-tabs compact-switch">
              <BaseButton class="role-option" :class="{ active: sortOrder === 'ASC' }" @click="emit('updateSortOrder', 'ASC')">
                {{ messages.channels.ascending }}
              </BaseButton>
              <BaseButton class="role-option" :class="{ active: sortOrder === 'DESC' }" @click="emit('updateSortOrder', 'DESC')">
                {{ messages.channels.descending }}
              </BaseButton>
            </div>
          </div>
        </div>

        <div v-if="!channels.length" class="employee-empty-state">
          <p class="muted-copy">{{ emptyStateMessage }}</p>
          <BaseButton class="btn btn-secondary" @click="emit('openCreateDialog')">
            {{ messages.channels.createAction }}
          </BaseButton>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table channels-table">
            <thead>
              <tr>
                <th>{{ messages.channels.columnName }}</th>
                <th>{{ messages.channels.columnTrip }}</th>
                <th>{{ messages.channels.columnLink }}</th>
                <th>{{ messages.channels.columnActions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="channel in channels" :key="channel.id">
                <td>
                  <div class="channel-primary-cell">
                    <strong>{{ channel.name }}</strong>
                  </div>
                </td>
                <td>
                  <div class="channel-trip-cell">
                    <span class="status-pill" :class="channel.assigned_trip_id ? 'pending' : 'expired'">
                      {{ getTripLabel(channel) }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="channel-link-cell">
                    <div class="channel-copy-row">
                      <code>{{ getChannelPublicLink(channel) }}</code>
                      <BaseButton
                        class="tracker-icon-button channel-copy-button"
                        :aria-label="messages.channels.copyLink"
                        @click="copyText(getChannelPublicLink(channel), messages.channels.copyLinkSuccess)"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M9 9.75A2.25 2.25 0 0 1 11.25 7.5h7.5A2.25 2.25 0 0 1 21 9.75v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5A2.25 2.25 0 0 1 9 17.25z"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.8"
                          />
                          <path
                            d="M15 7.5V6A2.25 2.25 0 0 0 12.75 3.75h-7.5A2.25 2.25 0 0 0 3 6v7.5a2.25 2.25 0 0 0 2.25 2.25H6.75"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.8"
                          />
                        </svg>
                      </BaseButton>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="employee-actions">
                    <BaseButton class="btn btn-secondary employee-action-button" @click="emit('openEditDialog', channel)">
                      {{ messages.channels.editAction }}
                    </BaseButton>
                    <BaseButton class="btn btn-secondary employee-action-button" @click="emit('openDeleteDialog', channel)">
                      {{ messages.channels.deleteAction }}
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div ref="loadMoreTrigger" class="table-load-more">
          <span v-if="isLoadingMore" class="muted-copy">
            {{ messages.common.loading }}
          </span>
          <span v-else-if="hasNextPage" class="muted-copy" />
        </div>
      </article>
    </section>
  </WorkspaceShell>
</template>
