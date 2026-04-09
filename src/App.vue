<script setup lang="ts">
import { RouterView } from 'vue-router'

import GlobalSnackbar from '@shared/components/GlobalSnackbar.vue'
</script>

<template>
  <RouterView />
  <GlobalSnackbar />
</template>
