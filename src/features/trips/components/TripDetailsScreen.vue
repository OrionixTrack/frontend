<script setup lang="ts">
import { computed, useSlots } from 'vue'

import BaseButton from '@shared/components/BaseButton.vue'
import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { SessionState } from '@shared/types'

import TripMetricChart from './TripMetricChart.vue'
import TripMap from './TripMap.vue'
import type { LiveTrackPoint } from '../live/trips.live'
import type { OwnerTripItem } from '../types/OwnerTripItem'
import type { OwnerTripStats } from '../types/OwnerTripStats'

const props = defineProps<{
  session: Readonly<SessionState>
  activeProfile: SessionState['user']
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
  selectedTrip: OwnerTripItem | null
  liveTrackPoints: LiveTrackPoint[]
  detailError: string
  isDetailLoading: boolean
  detailTab: 'overview' | 'stats'
  selectedTripStats: OwnerTripStats | null
  statsError: string
  isStatsLoading: boolean
}>()

const emit = defineEmits<{
  logout: []
  updateTheme: [theme: AppTheme]
  closeTripDetails: []
  updateDetailTab: [value: 'overview' | 'stats']
}>()
const slots = useSlots()
const hasHeaderActions = computed(() => Boolean(slots['header-actions']))

interface ChartPoint {
  label: string
  value: number
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

const formatMetric = (value?: number | null, suffix = ''): string =>
  value === null || value === undefined ? '—' : `${Number(value).toFixed(1)}${suffix}`

const formatPerson = (person?: OwnerTripItem['driver'] | OwnerTripItem['createdByDispatcher'] | null): string =>
  person ? `${person.name} ${person.surname}`.trim() : props.messages.trips.noPersonAssigned

const formatVehicle = (vehicle?: OwnerTripItem['vehicle'] | null): string => {
  if (!vehicle) {
    return props.messages.trips.noVehicleAssigned
  }

  const details = [vehicle.brand, vehicle.model].filter(Boolean).join(' ')
  return `${vehicle.name}${details ? ` · ${details}` : ''}${vehicle.licensePlate ? ` · ${vehicle.licensePlate}` : ''}`
}

const formatCoordinate = (latitude?: number | null, longitude?: number | null): string => {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return '—'
  }

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
}

const normalizeChartPoints = (metric: 'temperature' | 'humidity' | 'speed'): ChartPoint[] => {
  const source =
    metric === 'temperature'
      ? props.selectedTripStats?.temperatureChart
      : metric === 'humidity'
        ? props.selectedTripStats?.humidityChart
        : props.selectedTripStats?.speedChart

  if (!Array.isArray(source) || !source.length) {
    const aggregate = props.selectedTripStats?.[metric]
    const fallbackPoints: ChartPoint[] = []

    if (typeof aggregate?.min === 'number' && Number.isFinite(aggregate.min)) {
      fallbackPoints.push({ label: props.messages.trips.minLabel, value: aggregate.min })
    }

    if (typeof aggregate?.avg === 'number' && Number.isFinite(aggregate.avg)) {
      fallbackPoints.push({ label: props.messages.trips.avgLabel, value: aggregate.avg })
    }

    if (typeof aggregate?.max === 'number' && Number.isFinite(aggregate.max)) {
      fallbackPoints.push({ label: props.messages.trips.maxLabel, value: aggregate.max })
    }

    return fallbackPoints
  }

  return source
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        return null
      }

      const labelCandidate = entry.datetime
      const numericCandidate = Number.isFinite(entry.value) ? entry.value : null

      if (numericCandidate === null) {
        return null
      }

      const formattedLabel = labelCandidate
        ? new Intl.DateTimeFormat(props.locale === 'uk' ? 'uk-UA' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(labelCandidate))
        : String(index + 1)

      return {
        label: formattedLabel,
        value: numericCandidate,
      }
    })
    .filter((item): item is ChartPoint => item !== null)
}

const hasRouteTrack = computed(
  () => Boolean(props.selectedTrip?.trackPolyline) || props.liveTrackPoints.length > 1,
)

const routeStatusTone = computed(() => (hasRouteTrack.value ? 'completed' : 'cancelled'))

const isHistoricalTelemetry = computed(() =>
  props.selectedTrip?.status === 'completed' || props.selectedTrip?.status === 'cancelled',
)

const telemetrySectionTitle = computed(() =>
  isHistoricalTelemetry.value ? props.messages.trips.latestTelemetryTitle : props.messages.trips.telemetryTitle,
)

const telemetrySectionDescription = computed(() =>
  isHistoricalTelemetry.value ? props.messages.trips.latestTelemetryDescription : props.messages.trips.telemetryDescription,
)

const temperatureChart = computed(() => normalizeChartPoints('temperature'))
const humidityChart = computed(() => normalizeChartPoints('humidity'))
const speedChart = computed(() => normalizeChartPoints('speed'))
</script>

<template>
  <WorkspaceShell
    :session="session"
    :active-profile="activeProfile"
    :is-loading="isDetailLoading"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :title="selectedTrip?.name || messages.trips.detailTitle"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
    <section class="dashboard-grid invitations-layout">
      <article class="panel invitations-panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">{{ messages.trips.detailTitle }}</p>
            <h3>{{ selectedTrip?.name || messages.trips.noTripSelected }}</h3>
          </div>
          <div class="panel-header-actions">
            <div v-if="hasHeaderActions && selectedTrip" class="trip-header-actions-group">
              <slot name="header-actions" :trip="selectedTrip" />
            </div>
            <div class="trip-header-nav-group">
              <BaseButton class="btn btn-secondary employee-action-button trip-back-button" @click="emit('closeTripDetails')">
                {{ messages.trips.closeDetails }}
              </BaseButton>
            </div>
          </div>
        </div>

        <p v-if="detailError" class="error-banner">{{ detailError }}</p>
        <p v-else-if="!selectedTrip" class="muted-copy">{{ messages.trips.selectTripPrompt }}</p>

        <template v-else>
          <div class="role-switch role-switch-tabs compact-switch trip-detail-tabs">
            <BaseButton class="role-option" :class="{ active: detailTab === 'overview' }" @click="emit('updateDetailTab', 'overview')">
              {{ messages.trips.overviewTabLabel }}
            </BaseButton>
            <BaseButton class="role-option" :class="{ active: detailTab === 'stats' }" @click="emit('updateDetailTab', 'stats')">
              {{ messages.trips.statsTabLabel }}
            </BaseButton>
          </div>

          <div v-if="detailTab === 'overview'" class="trip-detail-stack">
            <div class="trip-info-grid trip-info-grid-wide">
              <div class="trip-info-card">
                <span>{{ messages.trips.plannedStartLabel }}</span>
                <strong>{{ formatDateTime(selectedTrip.plannedStart) }}</strong>
              </div>
              <div class="trip-info-card">
                <span>{{ messages.trips.actualStartLabel }}</span>
                <strong>{{ formatDateTime(selectedTrip.actualStart) }}</strong>
              </div>
              <div class="trip-info-card">
                <span>{{ messages.trips.endLabel }}</span>
                <strong>{{ formatDateTime(selectedTrip.end) }}</strong>
              </div>
              <div class="trip-info-card">
                <span>{{ messages.trips.contactLabel }}</span>
                <strong>{{ selectedTrip.contactInfo || messages.common.noValue }}</strong>
              </div>
            </div>

            <div class="trip-route-card">
              <div class="trip-section-header">
                <div>
                  <h4>{{ messages.trips.routeTitle }}</h4>
                  <p class="muted-copy">{{ messages.trips.routeDescription }}</p>
                </div>
                <span class="status-pill" :class="routeStatusTone">
                  {{ hasRouteTrack ? messages.trips.routeTrackAvailable : messages.trips.routeTrackUnavailable }}
                </span>
              </div>

              <TripMap
                :start-latitude="selectedTrip.startLatitude"
                :start-longitude="selectedTrip.startLongitude"
                :finish-latitude="selectedTrip.finishLatitude"
                :finish-longitude="selectedTrip.finishLongitude"
                :theme="theme"
                :current-latitude="selectedTrip.currentTelemetry?.latitude"
                :current-longitude="selectedTrip.currentTelemetry?.longitude"
                :current-bearing="selectedTrip.currentTelemetry?.bearing"
                :track-polyline="selectedTrip.trackPolyline"
                :live-track-points="liveTrackPoints"
              />

              <div class="trip-route-points">
                <div class="trip-route-point">
                  <span>{{ messages.trips.startPointLabel }}</span>
                  <strong>{{ selectedTrip.startAddress }}</strong>
                  <small>{{ formatCoordinate(selectedTrip.startLatitude, selectedTrip.startLongitude) }}</small>
                </div>
                <div class="trip-route-point">
                  <span>{{ messages.trips.currentPointLabel }}</span>
                  <strong>{{ selectedTrip.currentTelemetry ? formatCoordinate(selectedTrip.currentTelemetry.latitude, selectedTrip.currentTelemetry.longitude) : messages.trips.noTelemetry }}</strong>
                  <small>{{ selectedTrip.currentTelemetry ? formatDateTime(selectedTrip.currentTelemetry.datetime) : '—' }}</small>
                </div>
                <div class="trip-route-point">
                  <span>{{ messages.trips.finishPointLabel }}</span>
                  <strong>{{ selectedTrip.finishAddress }}</strong>
                  <small>{{ formatCoordinate(selectedTrip.finishLatitude, selectedTrip.finishLongitude) }}</small>
                </div>
              </div>
            </div>

            <div class="trip-info-grid trip-info-grid-wide">
              <div class="trip-info-card">
                <span>{{ messages.trips.driverLabel }}</span>
                <strong>{{ formatPerson(selectedTrip.driver) }}</strong>
              </div>
              <div class="trip-info-card">
                <span>{{ messages.trips.vehicleLabel }}</span>
                <strong>{{ formatVehicle(selectedTrip.vehicle) }}</strong>
              </div>
              <div class="trip-info-card">
                <span>{{ messages.trips.dispatcherLabel }}</span>
                <strong>{{ formatPerson(selectedTrip.createdByDispatcher) }}</strong>
              </div>
              <div class="trip-info-card">
                <span>{{ messages.trips.descriptionLabel }}</span>
                <strong>{{ selectedTrip.description || messages.trips.noDescription }}</strong>
              </div>
            </div>

            <div class="trip-route-card">
              <div class="trip-section-header">
                <div>
                  <h4>{{ telemetrySectionTitle }}</h4>
                  <p class="muted-copy">{{ telemetrySectionDescription }}</p>
                </div>
              </div>

              <div v-if="selectedTrip.currentTelemetry" class="trip-info-grid trip-info-grid-wide">
                <div class="trip-info-card">
                  <span>{{ messages.trips.speedLabel }}</span>
                  <strong>{{ formatMetric(selectedTrip.currentTelemetry.speed, ' km/h') }}</strong>
                </div>
                <div class="trip-info-card">
                  <span>{{ messages.trips.temperatureLabel }}</span>
                  <strong>{{ formatMetric(selectedTrip.currentTelemetry.temperature, '°C') }}</strong>
                </div>
                <div class="trip-info-card">
                  <span>{{ messages.trips.humidityLabel }}</span>
                  <strong>{{ formatMetric(selectedTrip.currentTelemetry.humidity, '%') }}</strong>
                </div>
                <div class="trip-info-card">
                  <span>{{ messages.trips.telemetryTimeLabel }}</span>
                  <strong>{{ formatDateTime(selectedTrip.currentTelemetry.datetime) }}</strong>
                </div>
              </div>
              <p v-else class="muted-copy">{{ messages.trips.noTelemetry }}</p>
            </div>
          </div>

          <div v-else class="trip-detail-stack">
            <p v-if="statsError" class="error-banner">{{ statsError }}</p>
            <p v-else-if="isStatsLoading" class="muted-copy">{{ messages.common.loading }}</p>

            <template v-else-if="selectedTripStats">
              <div class="trip-stats-grid">
                <section class="trip-stat-panel">
                  <div class="trip-section-header">
                    <div>
                      <h4>{{ messages.trips.temperatureLabel }}</h4>
                    </div>
                  </div>
                  <div class="trip-metric-grid">
                    <div class="trip-info-card">
                      <span>{{ messages.trips.minLabel }}</span>
                      <strong>{{ formatMetric(selectedTripStats.temperature?.min, '°C') }}</strong>
                    </div>
                    <div class="trip-info-card">
                      <span>{{ messages.trips.avgLabel }}</span>
                      <strong>{{ formatMetric(selectedTripStats.temperature?.avg, '°C') }}</strong>
                    </div>
                    <div class="trip-info-card">
                      <span>{{ messages.trips.maxLabel }}</span>
                      <strong>{{ formatMetric(selectedTripStats.temperature?.max, '°C') }}</strong>
                    </div>
                  </div>
                  <TripMetricChart
                    v-if="temperatureChart.length"
                    :points="temperatureChart"
                    color="#7dd3fc"
                    area-color="rgba(56, 189, 248, 0.18)"
                    suffix="°C"
                  />
                </section>

                <section class="trip-stat-panel">
                  <div class="trip-section-header">
                    <div>
                      <h4>{{ messages.trips.humidityLabel }}</h4>
                    </div>
                  </div>
                  <div class="trip-metric-grid">
                    <div class="trip-info-card">
                      <span>{{ messages.trips.minLabel }}</span>
                      <strong>{{ formatMetric(selectedTripStats.humidity?.min, '%') }}</strong>
                    </div>
                    <div class="trip-info-card">
                      <span>{{ messages.trips.avgLabel }}</span>
                      <strong>{{ formatMetric(selectedTripStats.humidity?.avg, '%') }}</strong>
                    </div>
                    <div class="trip-info-card">
                      <span>{{ messages.trips.maxLabel }}</span>
                      <strong>{{ formatMetric(selectedTripStats.humidity?.max, '%') }}</strong>
                    </div>
                  </div>
                  <TripMetricChart
                    v-if="humidityChart.length"
                    :points="humidityChart"
                    color="#fbbf24"
                    area-color="rgba(251, 191, 36, 0.18)"
                    suffix="%"
                  />
                </section>

                <section class="trip-stat-panel">
                  <div class="trip-section-header">
                    <div>
                      <h4>{{ messages.trips.speedLabel }}</h4>
                    </div>
                  </div>
                  <div class="trip-metric-grid">
                    <div class="trip-info-card">
                      <span>{{ messages.trips.minLabel }}</span>
                      <strong>{{ formatMetric(selectedTripStats.speed?.min, ' km/h') }}</strong>
                    </div>
                    <div class="trip-info-card">
                      <span>{{ messages.trips.avgLabel }}</span>
                      <strong>{{ formatMetric(selectedTripStats.speed?.avg, ' km/h') }}</strong>
                    </div>
                    <div class="trip-info-card">
                      <span>{{ messages.trips.maxLabel }}</span>
                      <strong>{{ formatMetric(selectedTripStats.speed?.max, ' km/h') }}</strong>
                    </div>
                  </div>
                  <TripMetricChart
                    v-if="speedChart.length"
                    :points="speedChart"
                    color="#86efac"
                    area-color="rgba(34, 197, 94, 0.18)"
                    suffix=" km/h"
                  />
                </section>
              </div>
            </template>

            <p v-else class="muted-copy">{{ messages.trips.noStats }}</p>
          </div>
        </template>
      </article>
    </section>
  </WorkspaceShell>
</template>
