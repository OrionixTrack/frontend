<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'

import BaseButton from '@shared/components/BaseButton.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { SessionState } from '@shared/types'

import type { OwnerTripItem } from '../types/OwnerTripItem'
import type { OwnerTripSortBy } from '../types/OwnerTripSortBy'
import type { OwnerTripSortOrder } from '../types/OwnerTripSortOrder'
import type { OwnerTripStatus } from '../types/OwnerTripStatus'

const props = defineProps<{
  session: Readonly<SessionState>
  activeProfile: SessionState['user']
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
  trips: OwnerTripItem[]
  filters: {
    search: string
    sortBy: OwnerTripSortBy
    sortOrder: OwnerTripSortOrder
    status: OwnerTripStatus | ''
    dateFrom: string
    dateTo: string
  }
  pageError: string
  isLoading: boolean
  isInitialLoading: boolean
  hasNextPage: boolean
  isLoadingMore: boolean
  actionLabel?: string
  rowActionsLabel?: string
}>()

const slots = useSlots()

const emit = defineEmits<{
  logout: []
  updateTheme: [theme: AppTheme]
  updateSearchQuery: [value: string]
  updateSortBy: [value: OwnerTripSortBy]
  updateSortOrder: [value: OwnerTripSortOrder]
  updateStatus: [value: OwnerTripStatus | '']
  updateDateFrom: [value: string]
  updateDateTo: [value: string]
  openTripDetails: [tripId: number]
  loadMore: []
  openAction: []
}>()

const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const sortOptions: OwnerTripSortBy[] = ['planned_start_datetime', 'trip_id', 'status']
const statusOptions = computed<Array<{ value: OwnerTripStatus | ''; label: string }>>(() => [
  { value: '', label: props.messages.trips.allStatuses },
  { value: 'planned', label: props.messages.trips.statusPlanned },
  { value: 'in_progress', label: props.messages.trips.statusInProgress },
  { value: 'completed', label: props.messages.trips.statusCompleted },
  { value: 'cancelled', label: props.messages.trips.statusCancelled },
])

const emptyStateMessage = computed(() =>
  props.filters.search.trim() || props.filters.status || props.filters.dateFrom || props.filters.dateTo
    ? props.messages.trips.emptySearch
    : props.messages.trips.empty,
)
const hasRowActions = computed(() => Boolean(slots['row-actions']))

const getSortLabel = (value: OwnerTripSortBy): string => {
  switch (value) {
    case 'trip_id':
      return props.messages.trips.sortTripId
    case 'status':
      return props.messages.trips.sortStatus
    default:
      return props.messages.trips.sortPlannedStart
  }
}

const getStatusLabel = (status: OwnerTripStatus): string => {
  switch (status) {
    case 'planned':
      return props.messages.trips.statusPlanned
    case 'in_progress':
      return props.messages.trips.statusInProgress
    case 'completed':
      return props.messages.trips.statusCompleted
    case 'cancelled':
      return props.messages.trips.statusCancelled
  }
}

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(props.locale === 'uk' ? 'uk-UA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

const formatPerson = (person?: OwnerTripItem['driver'] | OwnerTripItem['createdByDispatcher'] | null): string =>
  person ? `${person.name} ${person.surname}`.trim() : props.messages.trips.noPersonAssigned

const formatVehicle = (vehicle?: OwnerTripItem['vehicle'] | null): string => {
  if (!vehicle) {
    return props.messages.trips.noVehicleAssigned
  }

  const details = [vehicle.brand, vehicle.model].filter(Boolean).join(' ')
  return `${vehicle.name}${details ? ` · ${details}` : ''}${vehicle.licensePlate ? ` · ${vehicle.licensePlate}` : ''}`
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

  observer.observe(loadMoreTrigger.value)
}

const handleSortByChange = (event: Event): void => {
  const target = event.target

  if (!(target instanceof window.HTMLSelectElement)) {
    return
  }

  emit('updateSortBy', target.value as OwnerTripSortBy)
}

const handleDateChange = (event: Event, field: 'dateFrom' | 'dateTo'): void => {
  const target = event.target

  if (!(target instanceof window.HTMLInputElement)) {
    return
  }

  if (field === 'dateFrom') {
    emit('updateDateFrom', target.value)
    return
  }

  emit('updateDateTo', target.value)
}

onMounted(connectObserver)
onBeforeUnmount(disconnectObserver)
watch([loadMoreTrigger, () => props.hasNextPage, () => props.isLoading], connectObserver)
</script>

<template>
  <WorkspaceShell
    :session="session"
    :active-profile="activeProfile"
    :is-loading="isInitialLoading"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :title="messages.trips.pageTitle"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
    <section class="dashboard-grid invitations-layout">
      <article class="panel invitations-panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">{{ messages.trips.pageTitle }}</p>
            <h3>{{ messages.trips.listTitle }}</h3>
          </div>
          <BaseButton
            v-if="actionLabel"
            class="btn btn-primary employee-action-button"
            @click="emit('openAction')"
          >
            {{ actionLabel }}
          </BaseButton>
        </div>

        <p class="muted-copy page-description">{{ messages.trips.description }}</p>
        <p v-if="pageError" class="error-banner">{{ pageError }}</p>

        <div class="trips-filters">
          <div class="table-toolbar trips-list-toolbar">
            <label class="field table-search" for="trip-search">
              <span>{{ messages.trips.searchLabel }}</span>
              <BaseInput
                id="trip-search"
                :model-value="filters.search"
                :placeholder="messages.trips.searchPlaceholder"
                @update:model-value="emit('updateSearchQuery', $event)"
              />
            </label>

            <label class="field" for="trip-date-from">
              <span>{{ messages.trips.dateFromLabel }}</span>
              <input id="trip-date-from" type="date" :value="filters.dateFrom" @input="handleDateChange($event, 'dateFrom')">
            </label>

            <label class="field" for="trip-date-to">
              <span>{{ messages.trips.dateToLabel }}</span>
              <input id="trip-date-to" type="date" :value="filters.dateTo" @input="handleDateChange($event, 'dateTo')">
            </label>

            <label class="field" for="trip-sort-by">
              <span>{{ messages.trips.sortByLabel }}</span>
              <select id="trip-sort-by" :value="filters.sortBy" @change="handleSortByChange">
                <option v-for="option in sortOptions" :key="option" :value="option">
                  {{ getSortLabel(option) }}
                </option>
              </select>
            </label>
          </div>

          <div class="trips-filter-bottom">
            <div class="field trip-status-field">
              <span>{{ messages.trips.statusLabel }}</span>
              <select
                id="trip-status"
                :value="filters.status"
                class="trip-status-select"
                @change="emit('updateStatus', ($event.target as HTMLSelectElement).value as OwnerTripStatus | '')"
              >
                <option v-for="option in statusOptions" :key="option.value || 'all'" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="field trip-order-field">
              <span>{{ messages.trips.sortOrderLabel }}</span>
              <div class="role-switch role-switch-tabs compact-switch">
                <BaseButton class="role-option" :class="{ active: filters.sortOrder === 'ASC' }" @click="emit('updateSortOrder', 'ASC')">
                  {{ messages.trips.ascending }}
                </BaseButton>
                <BaseButton class="role-option" :class="{ active: filters.sortOrder === 'DESC' }" @click="emit('updateSortOrder', 'DESC')">
                  {{ messages.trips.descending }}
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!trips.length" class="employee-empty-state">
          <p class="muted-copy">{{ emptyStateMessage }}</p>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table trips-table">
            <thead>
              <tr>
                <th>{{ messages.trips.sortTripId }}</th>
                <th>{{ messages.trips.pageTitle }}</th>
                <th>{{ messages.trips.statusLabel }}</th>
                <th>{{ messages.trips.plannedStartLabel }}</th>
                <th>{{ messages.trips.driverLabel }}</th>
                <th>{{ messages.trips.vehicleLabel }}</th>
                <th>{{ messages.trips.dispatcherLabel }}</th>
                <th v-if="hasRowActions">{{ rowActionsLabel || messages.common.actions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="trip in trips"
                :key="trip.id"
                class="trip-table-row"
                tabindex="0"
                @click="emit('openTripDetails', trip.id)"
                @keydown.enter.prevent="emit('openTripDetails', trip.id)"
                @keydown.space.prevent="emit('openTripDetails', trip.id)"
              >
                <td>{{ trip.id }}</td>
                <td class="trip-name-cell">
                  <div class="trip-table-primary">
                    <strong>{{ trip.name }}</strong>
                    <span>{{ trip.finishAddress }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-pill" :class="trip.status.replace('_', '-')">
                    {{ getStatusLabel(trip.status) }}
                  </span>
                </td>
                <td>{{ formatDateTime(trip.plannedStart) }}</td>
                <td>{{ formatPerson(trip.driver) }}</td>
                <td class="trip-vehicle-cell">{{ formatVehicle(trip.vehicle) }}</td>
                <td>{{ formatPerson(trip.createdByDispatcher) }}</td>
                <td v-if="hasRowActions" class="trip-actions-cell" @click.stop>
                  <div class="table-row-actions">
                    <slot name="row-actions" :trip="trip" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div ref="loadMoreTrigger" class="table-load-more">
          <span v-if="isLoadingMore" class="muted-copy">{{ messages.common.loading }}</span>
          <span v-else-if="hasNextPage" class="muted-copy" />
        </div>
      </article>
    </section>
  </WorkspaceShell>
</template>
