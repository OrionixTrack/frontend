<script setup lang="ts">
import { computed, ref } from 'vue'

import BaseButton from '@shared/components/BaseButton.vue'
import BaseDialog from '@shared/components/BaseDialog.vue'
import { DispatcherTripFormScreen, useDispatcherTripsView } from '@features/dispatcher-trips'
import { TripDetailsScreen, TripsListScreen } from '@features/trips'
import type { OwnerTripItem } from '@features/trips/types/OwnerTripItem'

const {
  activeProfile,
  actionError,
  detailError,
  detailTab,
  filters,
  form,
  formMode,
  handleLogout,
  handleCancelTrip,
  handleEndTrip,
  handleStartTrip,
  hasNextPage,
  hasMoreDrivers,
  hasMoreVehicles,
  isActionLoading,
  isDetailLoading,
  isDriversLoading,
  isFormRoute,
  isInitialLoading,
  isLoading,
  isLoadingMore,
  isSaving,
  isStatsLoading,
  isVehiclesLoading,
  items,
  loadMoreDrivers,
  loadMoreTrips,
  loadMoreVehicles,
  locale,
  messages,
  navigateBackToList,
  openDriverPicker,
  openCreateTrip,
  openEditTrip,
  openTripDetails,
  openVehiclePicker,
  pageError,
  saveError,
  selectedDriverLabel,
  selectedTrip,
  selectedTripId,
  selectedTripStats,
  selectedVehicleLabel,
  session,
  setDateFrom,
  setDateTo,
  setDetailTab,
  setDriverSearchQuery,
  setField,
  setSearch,
  setSortBy,
  setSortOrder,
  setStatus,
  setTheme,
  setVehicleSearchQuery,
  statsError,
  submitForm,
  theme,
  driverOptions,
  driverSearchQuery,
  vehicleOptions,
  vehicleSearchQuery,
} = useDispatcherTripsView()

type PendingStatusAction = 'start' | 'end' | 'cancel'

const pendingStatusAction = ref<PendingStatusAction | null>(null)
const pendingTripId = ref<number | null>(null)
const statusValidationError = ref('')

const isStatusConfirmOpen = computed(() => pendingStatusAction.value !== null && pendingTripId.value !== null)
const isStatusValidationDialogOpen = computed(() => Boolean(statusValidationError.value))

const getStartValidationError = (trip: OwnerTripItem): string => {
  if (!trip.driver && !trip.vehicle) {
    return messages.value.dispatcherTrips.startRequiresDriverAndVehicle
  }

  if (!trip.driver) {
    return messages.value.dispatcherTrips.startRequiresDriver
  }

  if (!trip.vehicle) {
    return messages.value.dispatcherTrips.startRequiresVehicle
  }

  return ''
}

const getTripForAction = (tripId: number): OwnerTripItem | null => {
  if (selectedTrip.value?.id === tripId) {
    return selectedTrip.value
  }

  return items.value.find((trip) => trip.id === tripId) ?? null
}

const openStatusConfirm = (action: PendingStatusAction, trip: OwnerTripItem): void => {
  statusValidationError.value = ''

  if (action === 'start') {
    const validationError = getStartValidationError(trip)

    if (validationError) {
      statusValidationError.value = validationError
      return
    }
  }

  pendingStatusAction.value = action
  pendingTripId.value = trip.id
}

const closeStatusConfirm = (): void => {
  pendingStatusAction.value = null
  pendingTripId.value = null
}

const closeStatusValidationDialog = (): void => {
  statusValidationError.value = ''
}

const confirmStatusAction = async (): Promise<void> => {
  if (!pendingStatusAction.value || pendingTripId.value === null) {
    return
  }

  const tripId = pendingTripId.value
  const action = pendingStatusAction.value

  if (action === 'start') {
    const trip = getTripForAction(tripId)
    const validationError = trip ? getStartValidationError(trip) : messages.value.dispatcherTrips.actionError

    if (validationError) {
      statusValidationError.value = validationError
      closeStatusConfirm()
      return
    }
  }

  closeStatusConfirm()

  if (action === 'start') {
    statusValidationError.value = ''
    await handleStartTrip(tripId)
    return
  }

  if (action === 'end') {
    statusValidationError.value = ''
    await handleEndTrip(tripId)
    return
  }

  statusValidationError.value = ''
  await handleCancelTrip(tripId)
}

const confirmDialogTitle = computed(() => {
  if (pendingStatusAction.value === 'start') {
    return messages.value.dispatcherTrips.confirmStartTitle
  }

  if (pendingStatusAction.value === 'end') {
    return messages.value.dispatcherTrips.confirmEndTitle
  }

  return messages.value.dispatcherTrips.confirmCancelTitle
})

const confirmDialogDescription = computed(() => {
  if (pendingStatusAction.value === 'start') {
    return messages.value.dispatcherTrips.confirmStartDescription
  }

  if (pendingStatusAction.value === 'end') {
    return messages.value.dispatcherTrips.confirmEndDescription
  }

  return messages.value.dispatcherTrips.confirmCancelDescription
})

const confirmDialogActionLabel = computed(() => {
  if (pendingStatusAction.value === 'start') {
    return messages.value.dispatcherTrips.startAction
  }

  if (pendingStatusAction.value === 'end') {
    return messages.value.dispatcherTrips.endAction
  }

  return messages.value.dispatcherTrips.cancelAction
})
</script>

<template>
  <BaseDialog :open="isStatusConfirmOpen" @close="closeStatusConfirm">
    <div class="panel-header modal-header">
      <div>
        <p class="section-kicker">{{ messages.trips.detailTitle }}</p>
        <h3>{{ confirmDialogTitle }}</h3>
      </div>
    </div>

    <p class="muted-copy">{{ confirmDialogDescription }}</p>

    <div class="auth-actions modal-actions">
      <BaseButton class="btn btn-secondary" type="button" @click="closeStatusConfirm">
        {{ messages.common.cancel }}
      </BaseButton>
      <BaseButton
        class="btn"
        :class="pendingStatusAction === 'cancel' ? 'btn-danger' : 'btn-primary'"
        type="button"
        :disabled="isActionLoading"
        @click="confirmStatusAction"
      >
        {{ confirmDialogActionLabel }}
      </BaseButton>
    </div>
  </BaseDialog>
  <BaseDialog :open="isStatusValidationDialogOpen" @close="closeStatusValidationDialog">
    <div class="panel-header modal-header status-validation-header">
      <div>
        <h3>{{ messages.dispatcherTrips.startBlockedTitle }}</h3>
      </div>
      <BaseButton class="dialog-close" :aria-label="messages.common.close" @click="closeStatusValidationDialog">
        ×
      </BaseButton>
    </div>

    <div class="error-banner status-validation-banner" role="alert" aria-live="assertive">
      <strong class="status-validation-label" aria-hidden="true">!</strong>
      <p class="muted-copy status-validation-message">{{ statusValidationError }}</p>
    </div>

    <div class="auth-actions modal-actions status-validation-actions">
      <BaseButton class="btn btn-danger" type="button" @click="closeStatusValidationDialog">
        {{ messages.common.close }}
      </BaseButton>
    </div>
  </BaseDialog>
  <DispatcherTripFormScreen
    v-if="isFormRoute"
    :session="session"
    :active-profile="activeProfile"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :mode="formMode"
    :form="form"
    :selected-driver-label="selectedDriverLabel"
    :selected-vehicle-label="selectedVehicleLabel"
    :driver-search-query="driverSearchQuery"
    :vehicle-search-query="vehicleSearchQuery"
    :driver-options="driverOptions"
    :vehicle-options="vehicleOptions"
    :is-drivers-loading="isDriversLoading"
    :is-vehicles-loading="isVehiclesLoading"
    :has-more-drivers="hasMoreDrivers"
    :has-more-vehicles="hasMoreVehicles"
    :page-error="pageError"
    :save-error="saveError"
    :is-loading="isLoading"
    :is-saving="isSaving"
    @logout="handleLogout"
    @update-theme="setTheme"
    @update-field="setField"
    @update-driver-search-query="setDriverSearchQuery"
    @update-vehicle-search-query="setVehicleSearchQuery"
    @load-more-drivers="loadMoreDrivers"
    @load-more-vehicles="loadMoreVehicles"
    @open-driver-picker="openDriverPicker"
    @open-vehicle-picker="openVehiclePicker"
    @submit="submitForm"
    @cancel="navigateBackToList"
  />
  <TripDetailsScreen
    v-else-if="selectedTripId"
    :session="session"
    :active-profile="activeProfile"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :selected-trip="selectedTrip"
    :detail-error="detailError || actionError"
    :is-detail-loading="isDetailLoading"
    :detail-tab="detailTab"
    :selected-trip-stats="selectedTripStats"
    :stats-error="statsError"
    :is-stats-loading="isStatsLoading"
    @logout="handleLogout"
    @update-theme="setTheme"
    @close-trip-details="navigateBackToList"
    @update-detail-tab="setDetailTab"
  >
    <template #header-actions="{ trip }">
      <BaseButton
        v-if="trip.status === 'planned'"
        class="btn btn-secondary employee-action-button"
        :disabled="isActionLoading"
        @click="openEditTrip(trip.id)"
      >
        {{ messages.dispatcherTrips.editAction }}
      </BaseButton>
      <BaseButton
        v-if="trip.status === 'planned'"
        class="btn btn-primary employee-action-button"
        :disabled="isActionLoading"
        @click="openStatusConfirm('start', trip)"
      >
        {{ messages.dispatcherTrips.startAction }}
      </BaseButton>
      <BaseButton
        v-if="trip.status === 'in_progress'"
        class="btn btn-primary employee-action-button"
        :disabled="isActionLoading"
        @click="openStatusConfirm('end', trip)"
      >
        {{ messages.dispatcherTrips.endAction }}
      </BaseButton>
      <BaseButton
        v-if="trip.status === 'planned' || trip.status === 'in_progress'"
        class="btn btn-secondary employee-action-button"
        :disabled="isActionLoading"
        @click="openStatusConfirm('cancel', trip)"
      >
        {{ messages.dispatcherTrips.cancelAction }}
      </BaseButton>
    </template>
  </TripDetailsScreen>
  <TripsListScreen
    v-else
    :session="session"
    :active-profile="activeProfile"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :trips="items"
    :filters="filters"
    :page-error="pageError || actionError"
    :is-loading="isLoading"
    :is-initial-loading="isInitialLoading"
    :has-next-page="hasNextPage"
    :is-loading-more="isLoadingMore"
    :action-label="messages.dispatcherTrips.createAction"
    :row-actions-label="messages.common.actions"
    @logout="handleLogout"
    @update-theme="setTheme"
    @update-search-query="setSearch"
    @update-sort-by="setSortBy"
    @update-sort-order="setSortOrder"
    @update-status="setStatus"
    @update-date-from="setDateFrom"
    @update-date-to="setDateTo"
    @open-trip-details="openTripDetails"
    @load-more="loadMoreTrips"
    @open-action="openCreateTrip"
  />
</template>
