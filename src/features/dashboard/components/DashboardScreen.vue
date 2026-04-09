<script setup lang="ts">
import { computed } from 'vue'

import type { DashboardState } from '@features/dashboard/types'
import {
  getRoleLabel,
  getTripStatusLabel,
  getUserDisplayName,
} from '@features/dashboard/presenters'
import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { SessionState } from '@shared/types'

const props = defineProps<{
  session: Readonly<SessionState>
  dashboardState: Readonly<DashboardState>
  activeProfile: SessionState['user']
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
}>()

const emit = defineEmits<{
  logout: []
  updateTheme: [theme: AppTheme]
}>()

const roleLabel = computed(() => getRoleLabel(props.locale, props.session.role))
const userDisplayName = computed(() => getUserDisplayName(props.session.role, props.activeProfile))
const workspaceTitle = computed(() =>
  props.session.role === 'owner'
    ? props.messages.dashboard.workspaceOwner
    : props.messages.dashboard.workspaceDispatcher,
)

const leadMetric = computed(() => props.dashboardState.stats[0] ?? null)
const supportingMetrics = computed(() => props.dashboardState.stats.slice(1))
</script>

<template>
  <WorkspaceShell
    :session="session"
    :active-profile="activeProfile"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :title="workspaceTitle"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
      <div v-if="dashboardState.isLoading" class="panel">
        {{ messages.common.loading }}
      </div>

      <section class="dashboard-grid">
        <article class="dashboard-hero panel">
          <div class="dashboard-hero-copy">
            <p class="section-kicker">{{ messages.common.overview }}</p>
            <h3>{{ userDisplayName }}</h3>
            <p class="hero-text">{{ activeProfile?.company?.name || messages.common.noValue }}</p>
          </div>

          <div class="info-list info-list-cards">
            <div class="info-list-item hero-meta-card">
              <span>{{ messages.common.company }}</span>
              <strong>{{ activeProfile?.company?.name || messages.common.noValue }}</strong>
            </div>
            <div class="info-list-item hero-meta-card">
              <span>{{ messages.common.profile }}</span>
              <strong>{{ roleLabel }}</strong>
            </div>
          </div>
        </article>

        <article v-if="leadMetric" class="dashboard-feature panel">
          <span>{{ leadMetric.label }}</span>
          <strong>{{ leadMetric.value }}</strong>
          <p>{{ messages.common.availableNow }}</p>
        </article>

        <article
          v-for="stat in supportingMetrics"
          :key="stat.label"
          class="metric-card"
          :class="`metric-${stat.tone}`"
        >
          <p>{{ stat.label }}</p>
          <strong>{{ stat.value }}</strong>
        </article>

        <article
          v-if="session.role === 'dispatcher'"
          class="panel panel-trips"
        >
          <div class="panel-header">
            <div>
              <p class="section-kicker">{{ messages.dashboard.roleViewTitle }}</p>
              <h3>{{ messages.dashboard.latestTrips }}</h3>
            </div>
          </div>

          <div class="endpoint-list">
            <div v-if="!dashboardState.trips.length" class="endpoint-row empty-row">
              {{ messages.dashboard.noTrips }}
            </div>
            <div v-for="trip in dashboardState.trips" :key="trip.id" class="endpoint-row">
              <div class="trip-line">
                <strong>{{ trip.name }}</strong>
                <span class="status-pill" :class="trip.status.replace('_', '-')">
                  {{ getTripStatusLabel(messages, trip.status) }}
                </span>
              </div>
              <span class="muted-copy">
                {{ trip.finishAddress || messages.dashboard.noDestination }}
              </span>
            </div>
          </div>
        </article>
      </section>

      <p v-if="dashboardState.error" class="error-banner page-error">{{ dashboardState.error }}</p>
  </WorkspaceShell>
</template>
