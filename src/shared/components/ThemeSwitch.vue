<script setup lang="ts">
import BaseButton from '@shared/components/BaseButton.vue'
import type { AppTheme } from '@shared/composables/useTheme'

defineProps<{
  theme: AppTheme
}>()

const emit = defineEmits<{
  change: [theme: AppTheme]
}>()
</script>

<template>
  <div class="theme-switch">
    <BaseButton
      class="theme-button"
      :class="{ active: theme === 'light' }"
      aria-label="Switch to light theme"
      @click="emit('change', 'light')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" class="theme-icon">
        <circle cx="12" cy="12" r="4.5" fill="currentColor" />
        <path
          d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1 5.3 5.3"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-width="1.8"
        />
      </svg>
    </BaseButton>
    <BaseButton
      class="theme-button"
      :class="{ active: theme === 'dark' }"
      aria-label="Switch to dark theme"
      @click="emit('change', 'dark')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" class="theme-icon">
        <path
          d="M14.8 3.2A8.9 8.9 0 1 0 20.8 18 7.8 7.8 0 1 1 14.8 3.2Z"
          fill="currentColor"
        />
      </svg>
    </BaseButton>
  </div>
</template>
