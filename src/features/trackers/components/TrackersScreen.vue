<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { TrackerItem } from '@features/vehicles/types/TrackerItem'
import type { VehicleItem } from '@features/vehicles/types/VehicleItem'
import BaseButton from '@shared/components/BaseButton.vue'
import BaseDialog from '@shared/components/BaseDialog.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import BaseSearchSelect from '@shared/components/BaseSearchSelect.vue'
import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import { useSnackbar } from '@shared/composables/useSnackbar'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { OwnerUser, SessionState } from '@shared/types'

import type { TrackerSortBy } from '../types/TrackerSortBy'
import type { TrackerSortOrder } from '../types/TrackerSortOrder'

const props = defineProps<{
  session: Readonly<SessionState>
  activeProfile: OwnerUser | null
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
  trackers: TrackerItem[]
  vehicles: VehicleItem[]
  availableVehicles: VehicleItem[]
  vehiclePickerOptions: Array<{ value: string; label: string }>
  selectedVehicleLabel: string
  vehicleSearchQuery: string
  vehiclePickerIsLoading: boolean
  vehiclePickerHasNextPage: boolean
  searchQuery: string
  sortBy: TrackerSortBy
  sortOrder: TrackerSortOrder
  pageError: string
  actionSuccess: string
  isLoading: boolean
  isInitialLoading: boolean
  hasNextPage: boolean
  isLoadingMore: boolean
  isTrackerDialogOpen: boolean
  isTokenDialogOpen: boolean
  isRegenerateConfirmOpen: boolean
  isEditingTracker: boolean
  isSavingTracker: boolean
  trackerError: string
  trackerForm: {
    name: string
    vehicleId: string
  }
  isDeleteDialogOpen: boolean
  isDeletingTracker: boolean
  deleteError: string
  selectedTrackerForDelete: TrackerItem | null
  selectedTrackerForRegeneration: TrackerItem | null
  trackerToken: string
}>()

const emit = defineEmits<{
  logout: []
  updateTheme: [theme: AppTheme]
  openCreateDialog: []
  openEditDialog: [tracker: TrackerItem]
  closeTrackerDialog: []
  closeTokenDialog: []
  openRegenerateConfirm: []
  closeRegenerateConfirm: []
  updateSearchQuery: [value: string]
  updateSortBy: [value: TrackerSortBy]
  updateSortOrder: [value: TrackerSortOrder]
  updateTrackerForm: [field: keyof typeof props.trackerForm, value: string]
  updateVehicleSearchQuery: [value: string]
  submitTracker: []
  openDeleteDialog: [tracker: TrackerItem]
  closeDeleteDialog: []
  confirmDelete: []
  confirmRegenerateToken: []
  loadMoreVehicleOptions: []
  loadMore: []
}>()

const { showSnackbar } = useSnackbar()
const hasTriedTrackerSubmit = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const sortOptions: TrackerSortBy[] = ['name', 'tracker_id']
const normalizedName = computed(() => props.trackerForm.name.trim())
const hasTrackerValidationError = computed(() => !normalizedName.value)
const shouldShowTrackerValidationError = computed(
  () => hasTriedTrackerSubmit.value && hasTrackerValidationError.value,
)
const emptyStateMessage = computed(() =>
  props.searchQuery.trim() ? props.messages.trackers.emptySearch : props.messages.trackers.empty,
)

const getSortLabel = (value: TrackerSortBy): string =>
  value === 'tracker_id' ? props.messages.trackers.sortTrackerId : props.messages.trackers.sortName

const getVehicleLabel = (tracker: TrackerItem): string => {
  if (!tracker.vehicle_id) {
    return props.messages.trackers.unassigned
  }

  const vehicle = props.vehicles.find((item) => item.id === tracker.vehicle_id)

  return vehicle ? `${vehicle.name} · ${vehicle.license_plate}` : `#${tracker.vehicle_id}`
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

const handleTrackerSubmit = (): void => {
  hasTriedTrackerSubmit.value = true

  if (hasTrackerValidationError.value) {
    return
  }

  emit('submitTracker')
}

const handleCloseTrackerDialog = (): void => {
  hasTriedTrackerSubmit.value = false
  emit('closeTrackerDialog')
}

const handleSortByChange = (event: Event): void => {
  const target = event.target

  if (!(target instanceof window.HTMLSelectElement)) {
    return
  }

  emit('updateSortBy', target.value as TrackerSortBy)
}

const copyTrackerToken = async (): Promise<void> => {
  if (!props.trackerToken) {
    return
  }

  try {
    await navigator.clipboard.writeText(props.trackerToken)
    showSnackbar(props.messages.trackers.copySuccess, { tone: 'success' })
  } catch {
    showSnackbar(props.messages.trackers.copyError, { tone: 'error' })
  }
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
    :title="messages.trackers.pageTitle"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
    <BaseDialog :open="isTrackerDialogOpen" @close="handleCloseTrackerDialog">
      <div class="panel-header modal-header">
        <div>
          <p class="section-kicker">{{ messages.trackers.pageTitle }}</p>
          <h3>{{ isEditingTracker ? messages.trackers.editTitle : messages.trackers.createTitle }}</h3>
        </div>
        <div class="tracker-dialog-header-actions">
          <BaseButton
            v-if="isEditingTracker"
            class="btn btn-secondary tracker-regenerate-button"
            :disabled="isSavingTracker"
            @click="emit('openRegenerateConfirm')"
          >
            {{ messages.trackers.regenerateAction }}
          </BaseButton>
          <BaseButton class="dialog-close" :aria-label="messages.common.close" @click="handleCloseTrackerDialog">
            ×
          </BaseButton>
        </div>
      </div>

      <p class="muted-copy">
        {{ isEditingTracker ? messages.trackers.editDescription : messages.trackers.createDescription }}
      </p>

      <form class="auth-form" @submit.prevent="handleTrackerSubmit">
        <label class="field" for="tracker-name">
          <span>{{ messages.trackers.fieldName }}</span>
          <BaseInput
            id="tracker-name"
            :model-value="trackerForm.name"
            @update:model-value="emit('updateTrackerForm', 'name', $event)"
          />
        </label>

        <label class="field" for="tracker-vehicle">
          <span>{{ messages.trackers.fieldVehicle }}</span>
          <BaseSearchSelect
            id="tracker-vehicle"
            :model-value="trackerForm.vehicleId"
            :selected-label="selectedVehicleLabel"
            :search-query="vehicleSearchQuery"
            :placeholder="messages.trackers.searchVehiclePlaceholder"
            :empty-label="messages.trackers.unassigned"
            :loading-label="messages.common.loading"
            :options="vehiclePickerOptions"
            :is-loading="vehiclePickerIsLoading"
            :has-next-page="vehiclePickerHasNextPage"
            @update:model-value="emit('updateTrackerForm', 'vehicleId', $event)"
            @update:search-query="emit('updateVehicleSearchQuery', $event)"
            @load-more="emit('loadMoreVehicleOptions')"
          />
        </label>

        <p v-if="shouldShowTrackerValidationError" class="error-banner">
          {{ messages.trackers.validationError }}
        </p>
        <p v-if="trackerError" class="error-banner">
          {{ trackerError }}
        </p>

        <div class="auth-actions modal-actions">
          <BaseButton class="btn btn-secondary" :disabled="isSavingTracker" @click="handleCloseTrackerDialog">
            {{ messages.common.cancel }}
          </BaseButton>
          <BaseButton class="btn btn-primary auth-submit" type="submit" :disabled="isSavingTracker">
            {{ isSavingTracker ? messages.trackers.saving : messages.trackers.saveChanges }}
          </BaseButton>
        </div>
      </form>
    </BaseDialog>

    <BaseDialog :open="isRegenerateConfirmOpen" @close="emit('closeRegenerateConfirm')">
      <div class="panel-header modal-header">
        <div>
          <p class="section-kicker">{{ messages.trackers.pageTitle }}</p>
          <h3>{{ messages.trackers.regenerateConfirmTitle }}</h3>
        </div>
        <BaseButton class="dialog-close" :aria-label="messages.common.close" @click="emit('closeRegenerateConfirm')">
          ×
        </BaseButton>
      </div>

      <p class="muted-copy">{{ messages.trackers.regenerateConfirmDescription }}</p>
      <p v-if="selectedTrackerForRegeneration" class="info-banner">
        {{ selectedTrackerForRegeneration.name }}
      </p>
      <p v-if="trackerError" class="error-banner">
        {{ trackerError }}
      </p>

      <div class="auth-actions modal-actions">
        <BaseButton class="btn btn-secondary" :disabled="isSavingTracker" @click="emit('closeRegenerateConfirm')">
          {{ messages.common.cancel }}
        </BaseButton>
        <BaseButton class="btn btn-primary auth-submit" :disabled="isSavingTracker" @click="emit('confirmRegenerateToken')">
          {{ isSavingTracker ? messages.trackers.saving : messages.trackers.confirmRegenerate }}
        </BaseButton>
      </div>
    </BaseDialog>

    <BaseDialog :open="isTokenDialogOpen" @close="emit('closeTokenDialog')">
      <div class="panel-header modal-header">
        <div>
          <p class="section-kicker">{{ messages.trackers.pageTitle }}</p>
          <h3>{{ messages.trackers.tokenDialogTitle }}</h3>
        </div>
        <BaseButton class="dialog-close" :aria-label="messages.common.close" @click="emit('closeTokenDialog')">
          ×
        </BaseButton>
      </div>

      <p class="muted-copy">{{ messages.trackers.tokenDialogDescription }}</p>
      <p class="success-banner vehicle-token-banner">
        <strong>{{ messages.trackers.tokenLabel }}</strong>
        <span class="vehicle-token-row">
          <code>{{ trackerToken }}</code>
          <BaseButton class="tracker-icon-button tracker-copy-button" :aria-label="messages.trackers.copyToken" @click="copyTrackerToken">
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
        </span>
      </p>
    </BaseDialog>

    <BaseDialog :open="isDeleteDialogOpen" @close="emit('closeDeleteDialog')">
      <div class="panel-header modal-header">
        <div>
          <p class="section-kicker">{{ messages.trackers.pageTitle }}</p>
          <h3>{{ messages.trackers.deleteTitle }}</h3>
        </div>
        <BaseButton class="dialog-close" :aria-label="messages.common.close" @click="emit('closeDeleteDialog')">
          ×
        </BaseButton>
      </div>

      <p class="muted-copy">{{ messages.trackers.deleteDescription }}</p>
      <p v-if="selectedTrackerForDelete" class="info-banner">
        {{ selectedTrackerForDelete.name }}
      </p>
      <p v-if="deleteError" class="error-banner">
        {{ deleteError }}
      </p>

      <div class="auth-actions modal-actions">
        <BaseButton class="btn btn-secondary" :disabled="isDeletingTracker" @click="emit('closeDeleteDialog')">
          {{ messages.common.cancel }}
        </BaseButton>
        <BaseButton class="btn btn-danger auth-submit" :disabled="isDeletingTracker" @click="emit('confirmDelete')">
          {{ isDeletingTracker ? messages.trackers.deleting : messages.trackers.confirmDelete }}
        </BaseButton>
      </div>
    </BaseDialog>

    <section class="dashboard-grid invitations-layout">
      <article class="panel settings-panel invitations-panel">
        <div class="panel-header">
        <div>
          <p class="section-kicker">{{ messages.trackers.pageTitle }}</p>
          <h3>{{ messages.trackers.listTitle }}</h3>
          </div>
          <BaseButton class="btn btn-primary" @click="emit('openCreateDialog')">
            {{ messages.trackers.createAction }}
          </BaseButton>
        </div>

        <p class="muted-copy">{{ messages.trackers.description }}</p>
        <p v-if="pageError" class="error-banner">{{ pageError }}</p>

        <div class="table-toolbar trackers-toolbar">
          <label class="field table-search" for="tracker-search">
            <span>{{ messages.trackers.searchLabel }}</span>
            <BaseInput
              id="tracker-search"
              :model-value="searchQuery"
              :placeholder="messages.trackers.searchPlaceholder"
              @update:model-value="emit('updateSearchQuery', $event)"
            />
          </label>

          <label class="field" for="tracker-sort-by">
            <span>{{ messages.trackers.sortByLabel }}</span>
            <select id="tracker-sort-by" :value="sortBy" @change="handleSortByChange">
              <option v-for="option in sortOptions" :key="option" :value="option">
                {{ getSortLabel(option) }}
              </option>
            </select>
          </label>

          <div class="field">
            <span>{{ messages.trackers.sortOrderLabel }}</span>
            <div class="role-switch role-switch-tabs compact-switch">
              <BaseButton class="role-option" :class="{ active: sortOrder === 'ASC' }" @click="emit('updateSortOrder', 'ASC')">
                {{ messages.trackers.ascending }}
              </BaseButton>
              <BaseButton class="role-option" :class="{ active: sortOrder === 'DESC' }" @click="emit('updateSortOrder', 'DESC')">
                {{ messages.trackers.descending }}
              </BaseButton>
            </div>
          </div>
        </div>

        <div v-if="!trackers.length" class="employee-empty-state">
          <p class="muted-copy">{{ emptyStateMessage }}</p>
          <BaseButton class="btn btn-secondary" @click="emit('openCreateDialog')">
            {{ messages.trackers.createAction }}
          </BaseButton>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table tracker-table">
            <thead>
              <tr>
                <th>{{ messages.trackers.columnId }}</th>
                <th>{{ messages.trackers.columnName }}</th>
                <th>{{ messages.trackers.columnVehicle }}</th>
                <th>{{ messages.trackers.columnActions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tracker in trackers" :key="tracker.id">
                <td>{{ tracker.id }}</td>
                <td class="table-email">{{ tracker.name }}</td>
                <td>{{ getVehicleLabel(tracker) }}</td>
                <td>
                  <div class="employee-actions">
                    <BaseButton class="btn btn-secondary employee-action-button" @click="emit('openEditDialog', tracker)">
                      {{ messages.trackers.editAction }}
                    </BaseButton>
                    <BaseButton class="btn btn-secondary employee-action-button" @click="emit('openDeleteDialog', tracker)">
                      {{ messages.trackers.deleteAction }}
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
