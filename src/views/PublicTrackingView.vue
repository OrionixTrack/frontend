<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import PublicTrackingScreen from '@features/public-tracking/components/PublicTrackingScreen.vue'
import { usePublicTrackingView } from '@features/public-tracking/composables/usePublicTrackingView'

const route = useRoute()
const token = route.params.token as string

const { locale, messages } = useI18n()
const { theme, ensureApplied } = useTheme()
const { state } = usePublicTrackingView(token)

onMounted(() => {
  ensureApplied()
})
</script>

<template>
  <PublicTrackingScreen
    :state="state"
    :locale="locale"
    :messages="messages"
    :theme="theme"
  />
</template>
