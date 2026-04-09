<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useSessionStore } from '@core/stores/session'
import { useI18n } from '@shared/composables/useI18n'

const { isAuthenticated } = useSessionStore()
const { messages } = useI18n()

const target = computed(() => (isAuthenticated.value ? '/dashboard' : '/login'))
</script>

<template>
  <main class="not-found-shell">
    <section class="not-found-card">
      <p class="eyebrow">{{ messages.auth.appName }}</p>
      <h1>{{ messages.errors.notFoundTitle }}</h1>
      <p class="hero-text">{{ messages.errors.notFoundDescription }}</p>
      <RouterLink class="btn btn-primary" :to="target">
        {{ isAuthenticated ? messages.common.overview : messages.auth.signIn }}
      </RouterLink>
    </section>
  </main>
</template>
