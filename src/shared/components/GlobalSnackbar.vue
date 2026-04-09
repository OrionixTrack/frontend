<script setup lang="ts">
import { computed } from 'vue'

import { useSnackbar } from '@shared/composables/useSnackbar'

const { snackbarState } = useSnackbar()

const snackbarClassName = computed(() => `snackbar snackbar-${snackbarState.value.tone}`)
</script>

<template>
  <transition name="snackbar-fade">
    <div
      v-if="snackbarState.visible && snackbarState.message"
      :class="snackbarClassName"
      aria-live="polite"
    >
      {{ snackbarState.message }}
    </div>
  </transition>
</template>
