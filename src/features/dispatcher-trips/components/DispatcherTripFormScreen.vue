<script setup lang="ts">
import BaseButton from '@shared/components/BaseButton.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import BaseSearchSelect from '@shared/components/BaseSearchSelect.vue'
import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { DispatcherUser, SessionState } from '@shared/types'

import DispatcherTripRoutePlanner from './DispatcherTripRoutePlanner.vue'

const props = defineProps<{
  session: Readonly<SessionState>
  activeProfile: DispatcherUser | null
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
  mode: 'create' | 'edit'
  form: {
    name: string
    description: string
    plannedStart: string
    contactInfo: string
    startAddress: string
    finishAddress: string
    startLatitude: string
    startLongitude: string
    finishLatitude: string
    finishLongitude: string
    driverId: string
    vehicleId: string
  }
  selectedDriverLabel: string
  selectedVehicleLabel: string
  driverSearchQuery: string
  vehicleSearchQuery: string
  driverOptions: Array<{ value: string; label: string }>
  vehicleOptions: Array<{ value: string; label: string }>
  isDriversLoading: boolean
  isVehiclesLoading: boolean
  hasMoreDrivers: boolean
  hasMoreVehicles: boolean
  pageError: string
  saveError: string
  isLoading: boolean
  isSaving: boolean
}>()

const emit = defineEmits<{
  logout: []
  updateTheme: [theme: AppTheme]
  updateField: [field: keyof typeof props.form, value: string]
  updateDriverSearchQuery: [value: string]
  updateVehicleSearchQuery: [value: string]
  loadMoreDrivers: []
  loadMoreVehicles: []
  openDriverPicker: []
  openVehiclePicker: []
  submit: []
  cancel: []
}>()

const title = props.mode === 'create' ? props.messages.dispatcherTrips.createTitle : props.messages.dispatcherTrips.editTitle
const description = props.mode === 'create' ? props.messages.dispatcherTrips.createDescription : props.messages.dispatcherTrips.editDescription

const handleRouteFieldUpdate = (
  field:
    | 'startAddress'
    | 'finishAddress'
    | 'startLatitude'
    | 'startLongitude'
    | 'finishLatitude'
    | 'finishLongitude',
  value: string,
): void => {
  emit('updateField', field, value)
}
</script>

<template>
  <WorkspaceShell
    :session="session"
    :active-profile="activeProfile"
    :is-loading="isLoading"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :title="title"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
    <section class="dashboard-grid invitations-layout">
      <article class="panel invitations-panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">{{ messages.trips.pageTitle }}</p>
            <h3>{{ title }}</h3>
          </div>
          <BaseButton class="btn btn-secondary employee-action-button" @click="emit('cancel')">
            {{ messages.common.cancel }}
          </BaseButton>
        </div>

        <p class="muted-copy page-description">{{ description }}</p>
        <p v-if="pageError" class="error-banner">{{ pageError }}</p>

        <form class="auth-form" @submit.prevent="emit('submit')">
          <label class="field" for="dispatcher-trip-name">
            <span>{{ messages.common.name }}</span>
            <BaseInput
              id="dispatcher-trip-name"
              :model-value="form.name"
              required
              @update:model-value="emit('updateField', 'name', $event)"
            />
          </label>

          <label class="field" for="dispatcher-trip-description">
            <span>{{ messages.trips.descriptionLabel }}</span>
            <textarea
              id="dispatcher-trip-description"
              class="base-textarea"
              :value="form.description"
              rows="4"
              @input="emit('updateField', 'description', ($event.target as HTMLTextAreaElement).value)"
            />
          </label>

          <div class="vehicle-form-grid">
            <label class="field" for="dispatcher-trip-planned-start">
              <span>{{ messages.trips.plannedStartLabel }}</span>
              <input
                id="dispatcher-trip-planned-start"
                type="datetime-local"
                :value="form.plannedStart"
                required
                @input="emit('updateField', 'plannedStart', ($event.target as HTMLInputElement).value)"
              >
            </label>

            <label class="field" for="dispatcher-trip-contact">
              <span>{{ messages.trips.contactLabel }}</span>
              <BaseInput
                id="dispatcher-trip-contact"
                :model-value="form.contactInfo"
                @update:model-value="emit('updateField', 'contactInfo', $event)"
              />
            </label>
          </div>

          <DispatcherTripRoutePlanner
            :theme="theme"
            :locale="locale"
            :messages="messages"
            :start-address="form.startAddress"
            :finish-address="form.finishAddress"
            :start-latitude="form.startLatitude"
            :start-longitude="form.startLongitude"
            :finish-latitude="form.finishLatitude"
            :finish-longitude="form.finishLongitude"
            @update-field="handleRouteFieldUpdate"
          />

          <div class="vehicle-form-grid">
            <label class="field">
              <span>{{ messages.dispatcherTrips.driverField }}</span>
              <BaseSearchSelect
                :model-value="form.driverId"
                :selected-label="selectedDriverLabel"
                :search-query="driverSearchQuery"
                :placeholder="messages.dispatcherTrips.searchDriverPlaceholder"
                :empty-label="messages.dispatcherTrips.unassignedDriver"
                :loading-label="messages.common.loading"
                :options="driverOptions"
                :is-loading="isDriversLoading"
                :has-next-page="hasMoreDrivers"
                @update:model-value="emit('updateField', 'driverId', $event)"
                @update:search-query="emit('updateDriverSearchQuery', $event)"
                @load-more="emit('loadMoreDrivers')"
                @open="emit('openDriverPicker')"
              />
            </label>

            <label class="field">
              <span>{{ messages.dispatcherTrips.vehicleField }}</span>
              <BaseSearchSelect
                :model-value="form.vehicleId"
                :selected-label="selectedVehicleLabel"
                :search-query="vehicleSearchQuery"
                :placeholder="messages.dispatcherTrips.searchVehiclePlaceholder"
                :empty-label="messages.dispatcherTrips.unassignedVehicle"
                :loading-label="messages.common.loading"
                :options="vehicleOptions"
                :is-loading="isVehiclesLoading"
                :has-next-page="hasMoreVehicles"
                @update:model-value="emit('updateField', 'vehicleId', $event)"
                @update:search-query="emit('updateVehicleSearchQuery', $event)"
                @load-more="emit('loadMoreVehicles')"
                @open="emit('openVehiclePicker')"
              />
            </label>
          </div>

          <p v-if="saveError" class="error-banner">{{ saveError }}</p>

          <div class="form-actions">
            <BaseButton class="btn btn-secondary" type="button" @click="emit('cancel')">
              {{ messages.common.cancel }}
            </BaseButton>
            <BaseButton class="btn btn-primary" type="submit" :disabled="isSaving">
              {{ isSaving ? messages.dispatcherTrips.saving : messages.dispatcherTrips.save }}
            </BaseButton>
          </div>
        </form>
      </article>
    </section>

  </WorkspaceShell>
</template>
