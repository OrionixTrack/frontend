<script setup lang="ts">
import logoUrl from '@/assets/logo.svg'

defineProps<{
  eyebrow: string
  title: string
}>()
</script>

<template>
  <div class="brand">
    <img :src="logoUrl" alt="OrionixTrack logo" class="brand-logo" />
    <div>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 v-if="title">{{ title }}</h1>
    </div>
  </div>
</template>
