<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import BaseCheckbox from '@shared/components/BaseCheckbox.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'

import { reverseGeocode, searchAddress, type GeocodingResult } from '../api/geocoding.api'
import DispatcherTripLocationPickerMap from './DispatcherTripLocationPickerMap.vue'

const props = defineProps<{
  theme: AppTheme
  locale: Locale
  messages: TranslationDictionary
  startAddress: string
  finishAddress: string
  startLatitude: string
  startLongitude: string
  finishLatitude: string
  finishLongitude: string
}>()

const emit = defineEmits<{
  updateField: [
    field:
      | 'startAddress'
      | 'finishAddress'
      | 'startLatitude'
      | 'startLongitude'
      | 'finishLatitude'
      | 'finishLongitude',
    value: string,
  ]
}>()

type RoutePoint = 'start' | 'finish'

const rootRef = ref<globalThis.HTMLElement | null>(null)
const activePoint = ref<RoutePoint>('start')
const searchTimers: Partial<Record<RoutePoint, number>> = {}
const searchControllers: Partial<Record<RoutePoint, AbortController | null>> = {
  start: null,
  finish: null,
}
const reverseControllers: Partial<Record<RoutePoint, AbortController | null>> = {
  start: null,
  finish: null,
}
const searchState = reactive<Record<RoutePoint, GeocodingResult[]>>({
  start: [],
  finish: [],
})
const isSearching = reactive<Record<RoutePoint, boolean>>({
  start: false,
  finish: false,
})
const isReverseLoading = reactive<Record<RoutePoint, boolean>>({
  start: false,
  finish: false,
})
const isApplyingTypedAddress = reactive<Record<RoutePoint, boolean>>({
  start: false,
  finish: false,
})
const isDropdownOpen = reactive<Record<RoutePoint, boolean>>({
  start: false,
  finish: false,
})
const draftAddress = reactive<Record<RoutePoint, string>>({
  start: props.startAddress,
  finish: props.finishAddress,
})
const isAddressSyncedWithMap = reactive<Record<RoutePoint, boolean>>({
  start: true,
  finish: true,
})

const parseCoordinate = (value: string): number | null => {
  if (!value.trim()) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const isStartResolved = computed(() => parseCoordinate(props.startLatitude) !== null && parseCoordinate(props.startLongitude) !== null)
const isFinishResolved = computed(() => parseCoordinate(props.finishLatitude) !== null && parseCoordinate(props.finishLongitude) !== null)
const startBindingLabel = computed(() =>
  !isAddressSyncedWithMap.start
    ? ''
    : '',
)
const finishBindingLabel = computed(() =>
  !isAddressSyncedWithMap.finish
    ? ''
    : '',
)

const setPointFromResult = (point: RoutePoint, result: GeocodingResult): void => {
  draftAddress[point] = result.address
  emit('updateField', point === 'start' ? 'startAddress' : 'finishAddress', result.address)
  emit('updateField', point === 'start' ? 'startLatitude' : 'finishLatitude', result.latitude.toFixed(6))
  emit('updateField', point === 'start' ? 'startLongitude' : 'finishLongitude', result.longitude.toFixed(6))
}

const focusPoint = (point: RoutePoint): void => {
  activePoint.value = point
  isDropdownOpen.start = point === 'start' && searchState.start.length > 0
  isDropdownOpen.finish = point === 'finish' && searchState.finish.length > 0
}

const clearSearchState = (point: RoutePoint): void => {
  searchState[point] = []
  isSearching[point] = false
  isDropdownOpen[point] = false
  window.clearTimeout(searchTimers[point])
  searchControllers[point]?.abort()
  searchControllers[point] = null
}

const runAddressSearch = async (point: RoutePoint, query: string): Promise<GeocodingResult[]> => {
  searchControllers[point]?.abort()
  const controller = new AbortController()
  searchControllers[point] = controller
  isSearching[point] = true

  try {
    const response = await searchAddress(query, props.locale, controller.signal)
    if (searchControllers[point] !== controller) {
      return []
    }

    const results = Array.isArray(response.results) ? response.results : []
    searchState[point] = results
    return results
  } catch {
    if (controller.signal.aborted) {
      return []
    }

    searchState[point] = []
    isDropdownOpen[point] = false
    return []
  } finally {
    if (searchControllers[point] === controller) {
      isSearching[point] = false
    }
  }
}

const handleAddressInput = (point: RoutePoint, value: string): void => {
  draftAddress[point] = value
  activePoint.value = point

  if (!isAddressSyncedWithMap[point]) {
    emit('updateField', point === 'start' ? 'startAddress' : 'finishAddress', value)
    clearSearchState(point)
    return
  }

  emit('updateField', point === 'start' ? 'startAddress' : 'finishAddress', value)
  emit('updateField', point === 'start' ? 'startLatitude' : 'finishLatitude', '')
  emit('updateField', point === 'start' ? 'startLongitude' : 'finishLongitude', '')

  const normalized = value.trim()

  if (normalized.length < 3) {
    clearSearchState(point)
    return
  }

  isDropdownOpen[point] = true
  window.clearTimeout(searchTimers[point])
  searchTimers[point] = window.setTimeout(async () => {
    const results = await runAddressSearch(point, normalized)
    isDropdownOpen[point] = results.length > 0
  }, 280)
}

const selectSearchResult = (point: RoutePoint, result: GeocodingResult): void => {
  setPointFromResult(point, result)
  searchState[point] = []
  isDropdownOpen[point] = false

  if (point === 'start') {
    activePoint.value = 'finish'
  }
}

const applyTypedAddress = async (point: RoutePoint): Promise<void> => {
  if (!isAddressSyncedWithMap[point]) {
    emit('updateField', point === 'start' ? 'startAddress' : 'finishAddress', draftAddress[point].trim())
    clearSearchState(point)
    return
  }

  const query = draftAddress[point].trim()

  if (query.length < 3) {
    return
  }

  isApplyingTypedAddress[point] = true

  try {
    const results = searchState[point].length > 0 ? searchState[point] : await runAddressSearch(point, query)

    if (results.length > 0) {
      selectSearchResult(point, results[0])
    }
  } finally {
    isApplyingTypedAddress[point] = false
  }
}

const toggleAddressSync = (point: RoutePoint, value: boolean): void => {
  isAddressSyncedWithMap[point] = value

  if (!value) {
    emit('updateField', point === 'start' ? 'startAddress' : 'finishAddress', draftAddress[point])
    clearSearchState(point)
    return
  }

  draftAddress[point] = point === 'start' ? props.startAddress : props.finishAddress
}

const resolveAddressForPoint = async (point: RoutePoint, latitude: number, longitude: number): Promise<void> => {
  reverseControllers[point]?.abort()

  emit('updateField', point === 'start' ? 'startLatitude' : 'finishLatitude', latitude.toFixed(6))
  emit('updateField', point === 'start' ? 'startLongitude' : 'finishLongitude', longitude.toFixed(6))

  if (!isAddressSyncedWithMap[point]) {
    return
  }

  const controller = new AbortController()
  reverseControllers[point] = controller
  isReverseLoading[point] = true

  try {
    const result = await reverseGeocode(latitude, longitude, props.locale, controller.signal)
    if (reverseControllers[point] !== controller) {
      return
    }

    setPointFromResult(point, result)
  } catch {
    if (controller.signal.aborted) {
      return
    }
  } finally {
    if (reverseControllers[point] === controller) {
      isReverseLoading[point] = false
    }
  }
}

const handleMapPick = async (point: RoutePoint, latitude: number, longitude: number): Promise<void> => {
  activePoint.value = point
  isDropdownOpen.start = false
  isDropdownOpen.finish = false
  await resolveAddressForPoint(point, latitude, longitude)

  if (point === 'start') {
    activePoint.value = 'finish'
  }
}

const handleDocumentPointerDown = (event: Event): void => {
  const target = event.target

  if (!(target instanceof globalThis.Node)) {
    return
  }

  if (rootRef.value?.contains(target)) {
    return
  }

  isDropdownOpen.start = false
  isDropdownOpen.finish = false
}

const getPointMeta = (point: RoutePoint): { address: string; coordinates: string } =>
  point === 'start'
    ? {
        address: props.startAddress,
        coordinates: startBindingLabel.value,
      }
    : {
        address: props.finishAddress,
        coordinates: finishBindingLabel.value,
      }

onMounted(() => {
  window.addEventListener('pointerdown', handleDocumentPointerDown)
})

watch(
  () => props.startAddress,
  (value) => {
    draftAddress.start = value
  },
)

watch(
  () => props.finishAddress,
  (value) => {
    draftAddress.finish = value
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', handleDocumentPointerDown)
  window.clearTimeout(searchTimers.start)
  window.clearTimeout(searchTimers.finish)
  searchControllers.start?.abort()
  searchControllers.finish?.abort()
  reverseControllers.start?.abort()
  reverseControllers.finish?.abort()
})
</script>

<template>
  <section ref="rootRef" class="trip-location-card trip-route-planner">
    <div class="trip-section-header">
      <div class="trip-card-title">
        <span>{{ messages.trips.routeTitle }}</span>
        <strong>{{ messages.dispatcherTrips.locationPickerTitle }}</strong>
      </div>
    </div>

    <p class="muted-copy">{{ messages.dispatcherTrips.locationPickerDescription }}</p>

    <div class="trip-route-inputs">
      <section
        class="trip-route-point-card"
        :class="{ active: activePoint === 'start' }"
        @click="focusPoint('start')"
      >
        <div class="trip-route-point-head">
          <span>{{ messages.trips.startPointLabel }}</span>
          <small>
            {{
              isAddressSyncedWithMap.start && isReverseLoading.start
                ? messages.dispatcherTrips.reverseGeocodingLoading
                : startBindingLabel
            }}
          </small>
        </div>

        <div class="trip-route-autocomplete">
          <BaseInput
            :model-value="draftAddress.start"
            :placeholder="messages.dispatcherTrips.startAddressPlaceholder"
            @update:model-value="handleAddressInput('start', $event)"
            @keydown.enter.prevent="applyTypedAddress('start')"
          />

          <div
            v-if="isAddressSyncedWithMap.start && isDropdownOpen.start && (searchState.start.length > 0 || isSearching.start)"
            class="trip-route-dropdown"
          >
            <div v-if="isSearching.start" class="trip-route-dropdown-state">
              {{ messages.common.loading }}
            </div>
            <button
              v-for="result in searchState.start"
              :key="`${result.latitude}:${result.longitude}:${result.address}`"
              type="button"
              class="trip-route-suggestion"
              @click="selectSearchResult('start', result)"
            >
              <strong>{{ result.address }}</strong>
            </button>
          </div>
        </div>

        <BaseCheckbox
          :model-value="isAddressSyncedWithMap.start"
          :label="messages.dispatcherTrips.syncWithMapLabel"
          @update:model-value="toggleAddressSync('start', $event)"
        />

        <div
          v-if="draftAddress.start.trim() && isAddressSyncedWithMap.start && !isStartResolved"
          class="trip-route-helper-row"
        >
          <p class="trip-route-helper">
            {{ messages.dispatcherTrips.locationNeedsConfirmation }}
          </p>
        </div>

      </section>

      <section
        class="trip-route-point-card"
        :class="{ active: activePoint === 'finish' }"
        @click="focusPoint('finish')"
      >
        <div class="trip-route-point-head">
          <span>{{ messages.trips.finishPointLabel }}</span>
          <small>
            {{
              isAddressSyncedWithMap.finish && isReverseLoading.finish
                ? messages.dispatcherTrips.reverseGeocodingLoading
                : finishBindingLabel
            }}
          </small>
        </div>

        <div class="trip-route-autocomplete">
          <BaseInput
            :model-value="draftAddress.finish"
            :placeholder="messages.dispatcherTrips.finishAddressPlaceholder"
            @update:model-value="handleAddressInput('finish', $event)"
            @keydown.enter.prevent="applyTypedAddress('finish')"
          />

          <div
            v-if="isAddressSyncedWithMap.finish && isDropdownOpen.finish && (searchState.finish.length > 0 || isSearching.finish)"
            class="trip-route-dropdown"
          >
            <div v-if="isSearching.finish" class="trip-route-dropdown-state">
              {{ messages.common.loading }}
            </div>
            <button
              v-for="result in searchState.finish"
              :key="`${result.latitude}:${result.longitude}:${result.address}`"
              type="button"
              class="trip-route-suggestion"
              @click="selectSearchResult('finish', result)"
            >
              <strong>{{ result.address }}</strong>
            </button>
          </div>
        </div>

        <BaseCheckbox
          :model-value="isAddressSyncedWithMap.finish"
          :label="messages.dispatcherTrips.syncWithMapLabel"
          @update:model-value="toggleAddressSync('finish', $event)"
        />

        <div
          v-if="draftAddress.finish.trim() && isAddressSyncedWithMap.finish && !isFinishResolved"
          class="trip-route-helper-row"
        >
          <p class="trip-route-helper">
            {{ messages.dispatcherTrips.locationNeedsConfirmation }}
          </p>
          <div class="trip-route-helper-actions">
            <button
              type="button"
              class="trip-route-helper-action"
              :disabled="isApplyingTypedAddress.finish"
              @click="applyTypedAddress('finish')"
            >
              {{
                isApplyingTypedAddress.finish
                  ? messages.common.loading
                  : messages.dispatcherTrips.applyTypedAddress
              }}
            </button>
          </div>
        </div>

      </section>
    </div>

    <p class="info-banner">
      {{
        activePoint === 'start'
          ? messages.dispatcherTrips.locationPickerHintStart
          : messages.dispatcherTrips.locationPickerHintFinish
      }}
    </p>

    <DispatcherTripLocationPickerMap
      :theme="theme"
      :active-point="activePoint"
      :start-latitude="parseCoordinate(startLatitude)"
      :start-longitude="parseCoordinate(startLongitude)"
      :finish-latitude="parseCoordinate(finishLatitude)"
      :finish-longitude="parseCoordinate(finishLongitude)"
      @pick="handleMapPick"
    />

    <div class="trip-route-summary-grid">
      <div class="trip-route-summary-card">
        <span>{{ messages.trips.startPointLabel }}</span>
        <strong>{{ getPointMeta('start').address || messages.dispatcherTrips.locationMissing }}</strong>
        <small>{{ getPointMeta('start').coordinates }}</small>
      </div>
      <div class="trip-route-summary-card">
        <span>{{ messages.trips.finishPointLabel }}</span>
        <strong>{{ getPointMeta('finish').address || messages.dispatcherTrips.locationMissing }}</strong>
        <small>{{ getPointMeta('finish').coordinates }}</small>
      </div>
    </div>
  </section>
</template>
