<script setup lang="ts">
import { computed } from 'vue'

import AppBrand from '@shared/components/AppBrand.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'

import type { PublicTrackingState } from '../types/PublicTrackingState'
import PublicTrackingCanvas from './PublicTrackingCanvas.vue'

const props = defineProps<{
  state: Readonly<PublicTrackingState>
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
}>()

const statusPillClass = computed(() => {
  const status = props.state.trip?.status
  if (status === 'in_progress') return 'in-progress'
  return status ?? ''
})

const statusLabel = computed(() => {
  const status = props.state.trip?.status
  const m = props.messages.publicTracking

  if (status === 'planned') return m.statusPlanned
  if (status === 'in_progress') return m.statusInProgress
  if (status === 'completed') return m.statusCompleted
  if (status === 'cancelled') return m.statusCancelled
  return ''
})

const isTripActive = computed(
  () =>
    props.state.trip?.status === 'in_progress' || props.state.trip?.status === 'planned',
)

const isTripInProgress = computed(() => props.state.trip?.status === 'in_progress')

const isTripEnded = computed(
  () =>
    props.state.trip?.status === 'completed' || props.state.trip?.status === 'cancelled',
)

const visiblePosition = computed(() =>
  isTripActive.value ? props.state.currentPosition : null,
)

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat(props.locale === 'uk' ? 'uk-UA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
</script>

<template>
  <div v-if="state.isLoading || state.notFound || !state.trip" class="auth-shell">
    <section class="not-found-card">
      <AppBrand :eyebrow="messages.auth.appName" :title="''" />

      <div v-if="state.isLoading" class="public-tracking-loading">
        <span class="workspace-loader-spinner" aria-hidden="true" />
      </div>

      <template v-else-if="state.notFound">
        <h1>{{ messages.publicTracking.notFoundTitle }}</h1>
        <p class="muted-copy">{{ messages.publicTracking.notFoundDescription }}</p>
      </template>

      <template v-else>
        <p class="eyebrow">{{ state.channelName }}</p>
        <h1>{{ messages.publicTracking.noTripTitle }}</h1>
        <p class="muted-copy">{{ messages.publicTracking.noTripDescription }}</p>
      </template>
    </section>
  </div>

  <div v-else class="public-tracking-shell">
    <aside class="app-rail">
      <div class="rail-head">
        <AppBrand :eyebrow="messages.auth.appName" :title="''" />
      </div>

      <div class="rail-profile">
        <p class="section-kicker">{{ messages.publicTracking.channelLabel }}</p>
        <strong>{{ state.channelName }}</strong>
      </div>

      <div class="public-tracking-trip-info">
        <p class="section-kicker">{{ messages.publicTracking.tripLabel }}</p>
        <strong class="public-tracking-trip-name">{{ state.trip.name }}</strong>
        <div>
          <span class="status-pill" :class="statusPillClass">{{ statusLabel }}</span>
        </div>
      </div>

      <div class="public-tracking-info-list">
        <div class="public-tracking-info-row">
          <span class="section-kicker">{{ messages.publicTracking.destinationLabel }}</span>
          <strong>{{ state.trip.finishAddress }}</strong>
        </div>
        <div
          v-if="isTripInProgress && state.currentPosition?.speed != null"
          class="public-tracking-info-row"
        >
          <span class="section-kicker">{{ messages.publicTracking.speedLabel }}</span>
          <strong>{{ state.currentPosition.speed }} km/h</strong>
        </div>
        <div v-if="isTripInProgress && state.currentPosition" class="public-tracking-info-row">
          <span class="section-kicker">{{ messages.publicTracking.updatedAtLabel }}</span>
          <strong>{{ formatDateTime(state.currentPosition.datetime) }}</strong>
        </div>
      </div>
    </aside>

    <div class="public-tracking-map-stage">
      <PublicTrackingCanvas
        :position="visiblePosition"
        :trip="state.trip"
        :theme="theme"
      />
    </div>
  </div>
</template>
