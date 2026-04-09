<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { getRoleLabel, getRoleNavigation, getUserDisplayName } from '@features/dashboard/presenters'
import AppBrand from '@shared/components/AppBrand.vue'
import BaseButton from '@shared/components/BaseButton.vue'
import ThemeSwitch from '@shared/components/ThemeSwitch.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { NavigationItem } from '@features/dashboard/presenters'
import type { SessionState } from '@shared/types'

const props = defineProps<{
  session: Readonly<SessionState>
  activeProfile: SessionState['user']
  isLoading?: boolean
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
  title: string
}>()

const emit = defineEmits<{
  logout: []
  updateTheme: [theme: AppTheme]
}>()

const route = useRoute()
const isMobileMenuOpen = ref(false)
const hasRouteName = (item: NavigationItem): item is NavigationItem & { routeName: string } =>
  item.routeName !== null
const roleLabel = computed(() => getRoleLabel(props.locale, props.session.role))
const userDisplayName = computed(() => getUserDisplayName(props.session.role, props.activeProfile))
const brandTitle = computed(() => (props.session.role === 'owner' ? '' : roleLabel.value))
const showTopbar = computed(
  () => !(props.session.role === 'owner' && props.title === props.messages.dashboard.workspaceOwner),
)
const navigationGroups = computed(() => getRoleNavigation(props.locale, props.session.role))
const navigationGroupsByAvailability = computed(() =>
  navigationGroups.value.map((group) => ({
    ...group,
    availableItems: group.items.filter(hasRouteName),
    pendingItems: group.items.filter((item) => !item.routeName),
  })),
)
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
        <AppBrand :eyebrow="messages.auth.appName" :title="brandTitle" />
        <BaseButton
          class="btn btn-secondary mobile-menu-toggle"
          type="button"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="workspace-navigation"
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
        id="workspace-navigation"
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
        <div class="header-actions workspace-actions">
          <ThemeSwitch :theme="theme" @change="emit('updateTheme', $event)" />
        </div>
        <BaseButton class="btn btn-secondary sidebar-logout" @click="emit('logout')">
          {{ messages.common.signOut }}
        </BaseButton>
      </div>
    </aside>

    <main class="dashboard-stage">
      <header v-if="showTopbar" class="dashboard-topbar">
        <div class="dashboard-title">
          <p class="eyebrow">{{ roleLabel }}</p>
          <h2>{{ title }}</h2>
        </div>
      </header>

      <div class="workspace-content">
        <slot />

        <div v-if="isLoading" class="workspace-loader-overlay" aria-live="polite" aria-busy="true">
          <div class="workspace-loader">
            <span class="workspace-loader-spinner" aria-hidden="true" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
