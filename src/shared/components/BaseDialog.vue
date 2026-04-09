<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    closeOnOverlay?: boolean
  }>(),
  {
    closeOnOverlay: true,
  },
)

const emit = defineEmits<{
  close: []
}>()

const handleOverlayClick = (): void => {
  emit('close')
}
</script>

<template>
  <Transition name="dialog-fade">
    <div
      v-if="open"
      class="modal-overlay"
      @click.self="closeOnOverlay ? handleOverlayClick() : undefined"
    >
      <section class="modal-card">
        <slot />
      </section>
    </div>
  </Transition>
</template>
