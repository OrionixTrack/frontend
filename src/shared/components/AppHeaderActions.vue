<script setup lang="ts">
import LocaleSwitch from '@shared/components/LocaleSwitch.vue'
import ThemeSwitch from '@shared/components/ThemeSwitch.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale } from '@shared/i18n/translations'

defineProps<{
  locale: Locale
  theme: AppTheme
}>()

const emit = defineEmits<{
  updateLocale: [locale: Locale]
  updateTheme: [theme: AppTheme]
}>()
</script>

<template>
  <div class="header-actions">
    <ThemeSwitch :theme="theme" @change="emit('updateTheme', $event)" />
    <LocaleSwitch :locale="locale" compact @change="emit('updateLocale', $event)" />
  </div>
</template>
