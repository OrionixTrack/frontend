<script setup lang="ts">
import { watch } from 'vue'

import BaseButton from '@shared/components/BaseButton.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import { useSnackbar } from '@shared/composables/useSnackbar'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { DispatcherUser, SessionState } from '@shared/types'

const props = defineProps<{
  session: Readonly<SessionState>
  activeProfile: DispatcherUser | null
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
  name: string
  surname: string
  isLoading: boolean
  isSaving: boolean
  pageError: string
  saveError: string
  saveSuccess: string
}>()

const emit = defineEmits<{
  logout: []
  updateTheme: [theme: AppTheme]
  updateName: [value: string]
  updateSurname: [value: string]
  submit: []
}>()

const { showSnackbar } = useSnackbar()

watch(
  () => props.saveSuccess,
  (value) => {
    if (value) {
      showSnackbar(value, { tone: 'success' })
    }
  },
)
</script>

<template>
  <WorkspaceShell
    :session="session"
    :active-profile="activeProfile"
    :is-loading="isLoading"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :title="messages.dispatcherProfile.pageTitle"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
    <section class="dashboard-grid settings-grid">
      <article class="panel settings-panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">{{ messages.common.profile }}</p>
            <h3>{{ messages.dispatcherProfile.title }}</h3>
          </div>
        </div>

        <form class="auth-form" @submit.prevent="emit('submit')">
          <label class="field" for="dispatcher-name">
            <span>{{ messages.dispatcherProfile.name }}</span>
            <BaseInput
              id="dispatcher-name"
              :model-value="name"
              autocomplete="given-name"
              required
              @update:model-value="emit('updateName', $event)"
            />
          </label>

          <label class="field" for="dispatcher-surname">
            <span>{{ messages.dispatcherProfile.surname }}</span>
            <BaseInput
              id="dispatcher-surname"
              :model-value="surname"
              autocomplete="family-name"
              required
              @update:model-value="emit('updateSurname', $event)"
            />
          </label>

          <p v-if="saveError" class="error-banner">{{ saveError }}</p>

          <div class="auth-actions">
            <BaseButton class="btn btn-primary auth-submit" type="submit" :disabled="isSaving">
              {{ isSaving ? messages.dispatcherProfile.saving : messages.dispatcherProfile.save }}
            </BaseButton>
          </div>
        </form>
      </article>
    </section>
  </WorkspaceShell>
</template>
