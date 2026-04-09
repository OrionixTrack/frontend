<script setup lang="ts">
import { computed } from 'vue'

import type { OwnerLiveMapState } from '@features/dashboard/types'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'

import OwnerLiveMapCanvas from './OwnerLiveMapCanvas.vue'

const props = defineProps<{
  liveMapState: Readonly<OwnerLiveMapState>
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
}>()

const hasPositions = computed(() => props.liveMapState.items.some((item) => item.position))
</script>

<template>
  <article class="panel panel-live-map">
    <div class="panel-header">
      <div>
        <p class="section-kicker">{{ messages.dashboard.liveMapKicker }}</p>
        <h3>{{ messages.dashboard.liveMapTitle }}</h3>
      </div>
    </div>

    <p v-if="liveMapState.error" class="error-banner">{{ liveMapState.error }}</p>

    <div class="owner-live-map-layout">
      <div class="owner-live-map-stage">
        <div v-if="liveMapState.isLoading && !liveMapState.hasLoaded" class="trip-detail-empty owner-live-map-empty">
          <p class="muted-copy">{{ messages.common.loading }}</p>
        </div>
        <div v-else-if="!hasPositions" class="trip-detail-empty owner-live-map-empty">
          <p class="muted-copy">{{ messages.dashboard.liveMapEmpty }}</p>
        </div>
        <OwnerLiveMapCanvas
          v-else
          :items="liveMapState.items"
          :locale="locale"
          :messages="messages"
          :theme="theme"
        />
      </div>
    </div>
  </article>
</template>
