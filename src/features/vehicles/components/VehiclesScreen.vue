<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import BaseButton from '@shared/components/BaseButton.vue'
import BaseCheckbox from '@shared/components/BaseCheckbox.vue'
import BaseDialog from '@shared/components/BaseDialog.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import { useSnackbar } from '@shared/composables/useSnackbar'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { OwnerUser, SessionState } from '@shared/types'

import type { TrackerItem } from '../types/TrackerItem'
import type { VehicleItem } from '../types/VehicleItem'
import type { VehicleSortBy } from '../types/VehicleSortBy'
import type { VehicleSortOrder } from '../types/VehicleSortOrder'

const props = defineProps<{
  session: Readonly<SessionState>
  activeProfile: OwnerUser | null
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
  vehicles: VehicleItem[]
  trackers: TrackerItem[]
  searchQuery: string
  sortBy: VehicleSortBy
  sortOrder: VehicleSortOrder
  pageError: string
  actionSuccess: string
  isLoading: boolean
  isInitialLoading: boolean
  hasNextPage: boolean
  isLoadingMore: boolean
  isVehicleDialogOpen: boolean
  isEditingVehicle: boolean
  isSavingVehicle: boolean
  vehicleError: string
  vehicleForm: {
    name: string
    licensePlate: string
    brand: string
    model: string
    productionYear: string
    capacity: string
    isActive: boolean
  }
  isDeleteDialogOpen: boolean
  isDeletingVehicle: boolean
  deleteError: string
  selectedVehicleForDelete: VehicleItem | null
}>()

const emit = defineEmits<{
  logout: []
  updateTheme: [theme: AppTheme]
  openCreateDialog: []
  openEditDialog: [vehicle: VehicleItem]
  closeVehicleDialog: []
  updateSearchQuery: [value: string]
  updateSortBy: [value: VehicleSortBy]
  updateSortOrder: [value: VehicleSortOrder]
  updateVehicleForm: [field: keyof typeof props.vehicleForm, value: string | boolean]
  submitVehicle: []
  openDeleteDialog: [vehicle: VehicleItem]
  closeDeleteDialog: []
  confirmDelete: []
  loadMore: []
}>()

const { showSnackbar } = useSnackbar()
const router = useRouter()
const hasTriedVehicleSubmit = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const sortOptions: VehicleSortBy[] = ['name', 'license_plate', 'brand', 'production_year']

const normalizedName = computed(() => props.vehicleForm.name.trim())
const normalizedLicensePlate = computed(() => props.vehicleForm.licensePlate.trim())
const hasVehicleValidationError = computed(
  () => !normalizedName.value || !normalizedLicensePlate.value,
)
const shouldShowVehicleValidationError = computed(
  () => hasTriedVehicleSubmit.value && hasVehicleValidationError.value,
)
const emptyStateMessage = computed(() =>
  props.searchQuery.trim() ? props.messages.vehicles.emptySearch : props.messages.vehicles.empty,
)
const getSortLabel = (value: VehicleSortBy): string => {
  switch (value) {
    case 'license_plate':
      return props.messages.vehicles.sortLicensePlate
    case 'brand':
      return props.messages.vehicles.sortBrand
    case 'production_year':
      return props.messages.vehicles.sortProductionYear
    default:
      return props.messages.vehicles.sortName
  }
}

const getTrackerName = (vehicle: VehicleItem): string => {
  if (!vehicle.tracker_id) {
    return props.messages.vehicles.noTracker
  }

  return props.trackers.find((tracker) => tracker.id === vehicle.tracker_id)?.name ?? `#${vehicle.tracker_id}`
}

const formatNumber = (value: number | null): string =>
  value === null
    ? props.messages.common.noValue
    : new Intl.NumberFormat(props.locale === 'uk' ? 'uk-UA' : 'en-US').format(value)

const formatYear = (value: number | null): string =>
  value === null ? props.messages.common.noValue : String(value)

const handleVehicleSubmit = (): void => {
  hasTriedVehicleSubmit.value = true

  if (hasVehicleValidationError.value) {
    return
  }

  emit('submitVehicle')
}

const handleCloseVehicleDialog = (): void => {
  hasTriedVehicleSubmit.value = false
  emit('closeVehicleDialog')
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

const handleSortByChange = (event: Event): void => {
  const target = event.target

  if (!(target instanceof window.HTMLSelectElement)) {
    return
  }

  emit('updateSortBy', target.value as VehicleSortBy)
}

const openTrackerEditor = async (vehicle: VehicleItem): Promise<void> => {
  if (!vehicle.tracker_id) {
    return
  }

  await router.push({
    name: 'owner-trackers',
    query: {
      trackerId: String(vehicle.tracker_id),
    },
  })
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
    :title="messages.vehicles.pageTitle"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
    <BaseDialog :open="isVehicleDialogOpen" @close="handleCloseVehicleDialog">
      <div class="panel-header modal-header">
        <div>
          <p class="section-kicker">{{ messages.vehicles.pageTitle }}</p>
          <h3>{{ isEditingVehicle ? messages.vehicles.editTitle : messages.vehicles.createTitle }}</h3>
        </div>
        <BaseButton class="dialog-close" :aria-label="messages.common.close" @click="handleCloseVehicleDialog">
          ×
        </BaseButton>
      </div>

      <p v-if="!isEditingVehicle" class="muted-copy">
        {{ messages.vehicles.createDescription }}
      </p>

      <form class="auth-form" @submit.prevent="handleVehicleSubmit">
        <label class="field" for="vehicle-name">
          <span>{{ messages.vehicles.fieldName }}</span>
          <BaseInput
            id="vehicle-name"
            :model-value="vehicleForm.name"
            @update:model-value="emit('updateVehicleForm', 'name', $event)"
          />
        </label>

        <label class="field" for="vehicle-license-plate">
          <span>{{ messages.vehicles.fieldLicensePlate }}</span>
          <BaseInput
            id="vehicle-license-plate"
            :model-value="vehicleForm.licensePlate"
            @update:model-value="emit('updateVehicleForm', 'licensePlate', $event)"
          />
        </label>

        <div class="vehicle-form-grid">
          <label class="field" for="vehicle-brand">
            <span>{{ messages.vehicles.fieldBrand }}</span>
            <BaseInput
              id="vehicle-brand"
              :model-value="vehicleForm.brand"
              @update:model-value="emit('updateVehicleForm', 'brand', $event)"
            />
          </label>

          <label class="field" for="vehicle-model">
            <span>{{ messages.vehicles.fieldModel }}</span>
            <BaseInput
              id="vehicle-model"
              :model-value="vehicleForm.model"
              @update:model-value="emit('updateVehicleForm', 'model', $event)"
            />
          </label>

          <label class="field" for="vehicle-production-year">
            <span>{{ messages.vehicles.fieldProductionYear }}</span>
            <input
              id="vehicle-production-year"
              type="number"
              min="1900"
              max="2100"
              :value="vehicleForm.productionYear"
              @input="emit('updateVehicleForm', 'productionYear', ($event.target as HTMLInputElement).value)"
            >
          </label>

          <label class="field" for="vehicle-capacity">
            <span>{{ messages.vehicles.fieldCapacity }}</span>
            <input
              id="vehicle-capacity"
              type="number"
              min="0"
              step="0.1"
              :value="vehicleForm.capacity"
              @input="emit('updateVehicleForm', 'capacity', ($event.target as HTMLInputElement).value)"
            >
          </label>
        </div>

        <BaseCheckbox
          :model-value="vehicleForm.isActive"
          :label="messages.vehicles.fieldIsActive"
          @update:model-value="emit('updateVehicleForm', 'isActive', $event)"
        />

        <p v-if="shouldShowVehicleValidationError" class="error-banner">
          {{ messages.vehicles.validationError }}
        </p>
        <p v-if="vehicleError" class="error-banner">
          {{ vehicleError }}
        </p>

        <div class="auth-actions modal-actions">
          <BaseButton class="btn btn-secondary" :disabled="isSavingVehicle" @click="handleCloseVehicleDialog">
            {{ messages.common.cancel }}
          </BaseButton>
          <BaseButton class="btn btn-primary auth-submit" type="submit" :disabled="isSavingVehicle">
            {{ isSavingVehicle ? messages.vehicles.saving : messages.vehicles.saveChanges }}
          </BaseButton>
        </div>
      </form>
    </BaseDialog>

    <BaseDialog :open="isDeleteDialogOpen" @close="emit('closeDeleteDialog')">
      <div class="panel-header modal-header">
        <div>
          <p class="section-kicker">{{ messages.vehicles.pageTitle }}</p>
          <h3>{{ messages.vehicles.deleteTitle }}</h3>
        </div>
        <BaseButton class="dialog-close" :aria-label="messages.common.close" @click="emit('closeDeleteDialog')">
          ×
        </BaseButton>
      </div>

      <p class="muted-copy">{{ messages.vehicles.deleteDescription }}</p>
      <p v-if="selectedVehicleForDelete" class="info-banner">
        {{ selectedVehicleForDelete.name }} · {{ selectedVehicleForDelete.license_plate }}
      </p>
      <p v-if="deleteError" class="error-banner">
        {{ deleteError }}
      </p>

      <div class="auth-actions modal-actions">
        <BaseButton class="btn btn-secondary" :disabled="isDeletingVehicle" @click="emit('closeDeleteDialog')">
          {{ messages.common.cancel }}
        </BaseButton>
        <BaseButton class="btn btn-danger auth-submit" :disabled="isDeletingVehicle" @click="emit('confirmDelete')">
          {{ isDeletingVehicle ? messages.vehicles.deleting : messages.vehicles.confirmDelete }}
        </BaseButton>
      </div>
    </BaseDialog>

    <section class="dashboard-grid invitations-layout">
      <article class="panel settings-panel invitations-panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">{{ messages.vehicles.pageTitle }}</p>
            <h3>{{ messages.vehicles.listTitle }}</h3>
          </div>
          <BaseButton class="btn btn-primary" @click="emit('openCreateDialog')">
            {{ messages.vehicles.createAction }}
          </BaseButton>
        </div>

        <p class="muted-copy page-description">{{ messages.vehicles.description }}</p>
        <p v-if="pageError" class="error-banner">{{ pageError }}</p>

        <div class="table-toolbar vehicles-toolbar">
          <label class="field table-search" for="vehicle-search">
            <span>{{ messages.vehicles.searchLabel }}</span>
            <BaseInput
              id="vehicle-search"
              :model-value="searchQuery"
              :placeholder="messages.vehicles.searchPlaceholder"
              @update:model-value="emit('updateSearchQuery', $event)"
            />
          </label>

          <label class="field" for="vehicle-sort-by">
            <span>{{ messages.vehicles.sortByLabel }}</span>
            <select id="vehicle-sort-by" :value="sortBy" @change="handleSortByChange">
              <option v-for="option in sortOptions" :key="option" :value="option">
                {{ getSortLabel(option) }}
              </option>
            </select>
          </label>

          <div class="field">
            <span>{{ messages.vehicles.sortOrderLabel }}</span>
            <div class="role-switch role-switch-tabs compact-switch">
              <BaseButton class="role-option" :class="{ active: sortOrder === 'ASC' }" @click="emit('updateSortOrder', 'ASC')">
                {{ messages.vehicles.ascending }}
              </BaseButton>
              <BaseButton class="role-option" :class="{ active: sortOrder === 'DESC' }" @click="emit('updateSortOrder', 'DESC')">
                {{ messages.vehicles.descending }}
              </BaseButton>
            </div>
          </div>
        </div>

        <div v-if="!vehicles.length" class="employee-empty-state">
          <p class="muted-copy">{{ emptyStateMessage }}</p>
          <BaseButton class="btn btn-secondary" @click="emit('openCreateDialog')">
            {{ messages.vehicles.createAction }}
          </BaseButton>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table vehicle-table">
            <thead>
              <tr>
                <th>{{ messages.vehicles.columnVehicle }}</th>
                <th>{{ messages.vehicles.columnSpecs }}</th>
                <th>{{ messages.vehicles.columnCapacity }}</th>
                <th>{{ messages.vehicles.columnTracker }}</th>
                <th>{{ messages.vehicles.columnStatus }}</th>
                <th>{{ messages.vehicles.columnActions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vehicle in vehicles" :key="vehicle.id">
                <td>
                  <div class="vehicle-cell">
                    <strong>{{ vehicle.name }}</strong>
                    <span>{{ vehicle.license_plate }}</span>
                  </div>
                </td>
                <td>
                  <div class="vehicle-cell">
                    <strong>{{ [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || messages.common.noValue }}</strong>
                    <span>{{ messages.vehicles.fieldProductionYear }}: {{ formatYear(vehicle.production_year) }}</span>
                  </div>
                </td>
                <td>{{ vehicle.capacity === null ? messages.common.noValue : vehicle.capacity }}</td>
                <td>
                  <div class="vehicle-cell">
                    <div class="vehicle-tracker-row">
                      <strong>{{ getTrackerName(vehicle) }}</strong>
                      <BaseButton
                        v-if="vehicle.tracker_id"
                        class="tracker-icon-button"
                        :aria-label="messages.vehicles.trackerAction"
                        @click="openTrackerEditor(vehicle)"
                      >
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path
                            d="M8.125 5.625H6.875C5.49429 5.625 4.375 6.74429 4.375 8.125V13.125C4.375 14.5057 5.49429 15.625 6.875 15.625H11.875C13.2557 15.625 14.375 14.5057 14.375 13.125V11.875"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M11.25 5H15V8.75"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M14.6875 5.3125L8.75 11.25"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </BaseButton>
                    </div>
                    <span v-if="vehicle.tracker_id">ID: {{ vehicle.tracker_id }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-pill" :class="vehicle.is_active ? 'accepted' : 'expired'">
                    {{ vehicle.is_active ? messages.vehicles.statusActive : messages.vehicles.statusInactive }}
                  </span>
                </td>
                <td>
                  <div class="employee-actions">
                    <BaseButton class="btn btn-secondary employee-action-button" @click="emit('openEditDialog', vehicle)">
                      {{ messages.vehicles.editAction }}
                    </BaseButton>
                    <BaseButton class="btn btn-secondary employee-action-button" @click="emit('openDeleteDialog', vehicle)">
                      {{ messages.vehicles.deleteAction }}
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
