<script setup lang="ts">
import { DashboardScreen, useDashboardView } from '@features/dashboard'

const {
  session,
  dashboardState,
  activeProfile,
  locale,
  messages,
  theme,
  handleLogout,
  setTheme,
} = useDashboardView()
</script>

<template>
  <DashboardScreen
    :session="session"
    :dashboard-state="dashboardState"
    :active-profile="activeProfile"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    @logout="handleLogout"
    @update-theme="setTheme"
  />
</template>
