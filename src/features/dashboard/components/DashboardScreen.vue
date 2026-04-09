<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import type { DashboardState } from '@features/dashboard/types'
import {
  getRoleLabel,
  getRoleNavigation,
  getTripStatusLabel,
  getUserAvatarLetter,
  getUserDisplayName,
} from '@features/dashboard/presenters'
import AppBrand from '@shared/components/AppBrand.vue'
import AppHeaderActions from '@shared/components/AppHeaderActions.vue'
import BaseButton from '@shared/components/BaseButton.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { SessionState } from '@shared/types'
import type { NavigationItem } from '@features/dashboard/presenters'

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
  updateLocale: [locale: Locale]
  updateTheme: [theme: AppTheme]
}>()

const route = useRoute()
const isMobileMenuOpen = ref(false)
const hasRouteName = (item: NavigationItem): item is NavigationItem & { routeName: string } =>
  item.routeName !== null
const roleLabel = computed(() => getRoleLabel(props.locale, props.session.role))
const userDisplayName = computed(() => getUserDisplayName(props.session.role, props.activeProfile))
const navigationGroups = computed(() => getRoleNavigation(props.locale, props.session.role))
const navigationGroupsByAvailability = computed(() =>
  navigationGroups.value.map((group) => ({
    ...group,
    availableItems: group.items.filter(hasRouteName),
    pendingItems: group.items.filter((item) => !item.routeName),
  })),
)
const userAvatarLetter = computed(() => getUserAvatarLetter(userDisplayName.value))
const workspaceTitle = computed(() =>
  props.session.role === 'owner'
    ? props.messages.dashboard.workspaceOwner
    : props.messages.dashboard.workspaceDispatcher,
)

const leadMetric = computed(() => props.dashboardState.stats[0] ?? null)
const supportingMetrics = computed(() => props.dashboardState.stats.slice(1))

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false
  },
)
</script>

<template>
  <div class="app-shell">
    <aside class="app-rail">
      <div class="rail-head">
        <AppBrand :eyebrow="messages.auth.appName" :title="roleLabel" />
        <BaseButton
          class="btn btn-secondary mobile-menu-toggle"
          type="button"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="dashboard-navigation"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          {{ messages.common.menu }}
        </BaseButton>
      </div>

      <div class="rail-profile">
        <p class="section-kicker">{{ messages.common.profile }}</p>
        <strong>{{ userDisplayName }}</strong>
        <span>{{ activeProfile?.company?.name || messages.common.noValue }}</span>
      </div>

      <div
        id="dashboard-navigation"
        class="rail-nav"
        :class="{ 'is-mobile-open': isMobileMenuOpen }"
      >
        <section v-for="group in navigationGroupsByAvailability" :key="group.title" class="nav-group">
          <p v-if="group.title" class="section-kicker">{{ group.title }}</p>
          <div class="nav-panel">
            <RouterLink
              v-for="item in group.availableItems"
              :key="item.id"
              class="nav-link"
              :class="{ active: route.name === item.routeName, inactive: route.name !== item.routeName }"
              :to="{ name: item.routeName }"
            >
              {{ item.label }}
            </RouterLink>
            <BaseButton
              v-for="item in group.pendingItems"
              :key="item.id"
              class="nav-link inactive"
              disabled
            >
              {{ item.label }}
            </BaseButton>
          </div>
        </section>
      </div>

      <div class="rail-footer">
        <AppHeaderActions
          :locale="locale"
          :theme="theme"
          @update-locale="emit('updateLocale', $event)"
          @update-theme="emit('updateTheme', $event)"
        />
        <BaseButton class="btn btn-secondary sidebar-logout" @click="emit('logout')">
          {{ messages.common.signOut }}
        </BaseButton>
      </div>
    </aside>

    <main class="dashboard-stage">
      <header class="dashboard-topbar">
        <div class="dashboard-title">
          <p class="eyebrow">{{ roleLabel }}</p>
          <h2>{{ workspaceTitle }}</h2>
        </div>

        <div class="dashboard-actions">
          <div class="dashboard-chip">{{ roleLabel }}</div>
          <div class="dashboard-avatar">{{ userAvatarLetter }}</div>
        </div>
      </header>

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
    </main>
  </div>
</template>
