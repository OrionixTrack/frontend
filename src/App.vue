<script setup lang="ts">
import { watchEffect } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import { useSessionStore } from '@core/stores/session'
import { useI18n } from '@shared/composables/useI18n'
import GlobalSnackbar from '@shared/components/GlobalSnackbar.vue'
import { getRouteTitle } from '@/router/titles'

const route = useRoute()
const { messages } = useI18n()
const { session } = useSessionStore()

watchEffect(() => {
  const appName = messages.value.auth.appName
  const pageTitle = getRouteTitle(route.name as string, messages.value, session.role)
  document.title = pageTitle ? `${pageTitle} – ${appName}` : appName
})
</script>

<template>
  <RouterView />
  <GlobalSnackbar />
</template>
