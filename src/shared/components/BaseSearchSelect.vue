<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import BaseInput from './BaseInput.vue'

interface SearchSelectOption {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  selectedLabel: string
  searchQuery: string
  placeholder?: string
  emptyLabel: string
  loadingLabel: string
  options: SearchSelectOption[]
  isLoading?: boolean
  hasNextPage?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:searchQuery': [value: string]
  loadMore: []
  open: []
  close: []
}>()

const rootRef = ref<HTMLElement | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const isOpen = ref(false)
let observer: IntersectionObserver | null = null

const displayValue = computed(() => (isOpen.value ? props.searchQuery : props.selectedLabel))
const showEmptyState = computed(
  () => !props.isLoading && !props.options.length,
)
const shouldShowEmptyOption = computed(
  () => !props.searchQuery.trim() || props.emptyLabel.toLowerCase().includes(props.searchQuery.trim().toLowerCase()),
)

const disconnectObserver = (): void => {
  observer?.disconnect()
  observer = null
}

const connectObserver = (): void => {
  disconnectObserver()

  if (!isOpen.value || !loadMoreTrigger.value || !props.hasNextPage) {
    return
  }

  observer = new window.IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting) && props.hasNextPage && !props.isLoading) {
        emit('loadMore')
      }
    },
    {
      rootMargin: '160px 0px',
    },
  )

  observer?.observe(loadMoreTrigger.value)
}

const openDropdown = (): void => {
  if (isOpen.value) {
    return
  }

  isOpen.value = true
  emit('open')
}

const closeDropdown = (): void => {
  if (!isOpen.value) {
    return
  }

  isOpen.value = false
  emit('close')
}

const handleInput = (value: string): void => {
  if (!isOpen.value) {
    openDropdown()
  }

  emit('update:searchQuery', value)
}

const handleOptionSelect = (value: string): void => {
  emit('update:modelValue', value)
  closeDropdown()
}

const handleDocumentPointerDown = (event: Event): void => {
  const target = event.target

  if (!(target instanceof Node)) {
    return
  }

  if (rootRef.value?.contains(target)) {
    return
  }

  closeDropdown()
}

onMounted(() => {
  window.addEventListener('pointerdown', handleDocumentPointerDown)
})

onBeforeUnmount(() => {
  disconnectObserver()
  window.removeEventListener('pointerdown', handleDocumentPointerDown)
})

watch([isOpen, loadMoreTrigger, () => props.hasNextPage, () => props.isLoading], connectObserver)
</script>

<template>
  <div ref="rootRef" class="search-select">
    <div class="search-select-input-wrap">
      <BaseInput
        :model-value="displayValue"
        :placeholder="placeholder"
        @update:model-value="handleInput"
        @focus="openDropdown"
      />
      <span class="search-select-arrow" aria-hidden="true">
        <svg viewBox="0 0 14 9" fill="none">
          <path
            d="M1 1.5L7 7.5L13 1.5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </div>

    <div v-if="isOpen" class="search-select-dropdown">
      <button
        v-if="shouldShowEmptyOption"
        type="button"
        class="search-select-option"
        :class="{ active: modelValue === '' }"
        @click="handleOptionSelect('')"
      >
        <span>{{ emptyLabel }}</span>
        <span v-if="modelValue === ''" class="search-select-check" aria-hidden="true">✓</span>
      </button>

      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="search-select-option"
        :class="{ active: modelValue === option.value }"
        @click="handleOptionSelect(option.value)"
      >
        <span>{{ option.label }}</span>
        <span v-if="modelValue === option.value" class="search-select-check" aria-hidden="true">✓</span>
      </button>

      <div v-if="showEmptyState" class="search-select-empty">
        {{ emptyLabel }}
      </div>

      <div ref="loadMoreTrigger" class="search-select-footer">
        <span v-if="isLoading" class="muted-copy">{{ loadingLabel }}</span>
        <span v-else-if="hasNextPage" class="muted-copy" />
      </div>
    </div>
  </div>
</template>
