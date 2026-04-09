<script setup lang="ts">
import BaseButton from '@shared/components/BaseButton.vue'
import type { Locale } from '@shared/i18n/translations'

defineProps<{
  label?: string
  locale: Locale
  compact?: boolean
}>()

const emit = defineEmits<{
  change: [locale: Locale]
}>()
</script>

<template>
  <div class="locale-switch">
    <span v-if="!compact" class="mini-label">{{ label }}</span>
    <div class="locale-actions">
      <BaseButton
        class="locale-button"
        :class="{ active: locale === 'uk' }"
        @click="emit('change', 'uk')"
      >
        UA
      </BaseButton>
      <BaseButton
        class="locale-button"
        :class="{ active: locale === 'en' }"
        @click="emit('change', 'en')"
      >
        EN
      </BaseButton>
    </div>
  </div>
</template>
