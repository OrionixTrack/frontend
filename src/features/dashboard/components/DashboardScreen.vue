<script setup lang="ts">
import { computed } from 'vue'

import type { DashboardState } from '@features/dashboard/types'
import type { LiveMapState } from '@features/dashboard/types'
import {
  getRoleLabel,
  getTripStatusLabel,
  getUserDisplayName,
} from '@features/dashboard/presenters'
import LiveMapPanel from './LiveMapPanel.vue'
import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { SessionState } from '@shared/types'

const props = defineProps<{
  session: Readonly<SessionState>
  dashboardState: Readonly<DashboardState>
  liveMap: Readonly<LiveMapState>
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
    : props.session.role === 'dispatcher'
      ? props.messages.dashboard.workspaceDispatcher
      : props.messages.dashboard.workspaceDriver,
)

const leadMetric = computed(() => props.dashboardState.stats[0] ?? null)
const supportingMetrics = computed(() => props.dashboardState.stats.slice(1))
const ownerStats = computed(() => (props.session.role === 'owner' ? props.dashboardState.stats : []))
</script>

<template>
  <WorkspaceShell
    :session="session"
    :active-profile="activeProfile"
    :is-loading="dashboardState.isLoading"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :title="workspaceTitle"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
      <section class="dashboard-grid">
        <article v-if="session.role === 'owner'" class="dashboard-hero panel dashboard-hero-owner">
          <div class="dashboard-hero-top">
            <div class="dashboard-hero-copy">
              <p class="section-kicker">{{ messages.common.overview }}</p>
              <h3>{{ activeProfile?.company?.name || messages.common.noValue }}</h3>
            </div>
          </div>

          <div class="dashboard-overview-stats">
            <div
              v-for="stat in ownerStats"
              :key="stat.label"
              class="info-list-item hero-meta-card hero-meta-stat"
            >
              <span>{{ stat.label }}</span>
              <strong>{{ stat.value }}</strong>
            </div>
          </div>
        </article>

        <article v-if="leadMetric && session.role === 'driver'" class="dashboard-feature panel">
          <span>{{ leadMetric.label }}</span>
          <strong>{{ leadMetric.value }}</strong>
          <p>{{ messages.common.availableNow }}</p>
        </article>

        <template v-if="session.role === 'driver'">
          <article
            v-for="stat in supportingMetrics"
            :key="stat.label"
            class="metric-card"
            :class="`metric-${stat.tone}`"
          >
            <p>{{ stat.label }}</p>
            <strong>{{ stat.value }}</strong>
          </article>
        </template>

        <article v-if="session.role === 'driver'" class="panel panel-trips">
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

        <LiveMapPanel
          v-if="session.role === 'owner' || session.role === 'dispatcher'"
          :live-map-state="liveMap"
          :locale="locale"
          :messages="messages"
          :theme="theme"
        />
      </section>

      <p v-if="dashboardState.error" class="error-banner page-error">{{ dashboardState.error }}</p>
  </WorkspaceShell>
</template>
