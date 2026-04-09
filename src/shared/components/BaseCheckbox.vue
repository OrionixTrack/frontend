<script setup lang="ts">
defineProps<{
  modelValue?: boolean
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const handleChange = (event: Event): void => {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <label class="base-checkbox">
    <input
      class="base-checkbox-input"
      type="checkbox"
      :checked="modelValue"
      @change="handleChange"
    >
    <span class="base-checkbox-control" aria-hidden="true">
      <span class="base-checkbox-indicator" />
    </span>
    <span v-if="label" class="base-checkbox-label">{{ label }}</span>
    <slot v-else />
  </label>
</template>
