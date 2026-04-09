<script setup lang="ts">
import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import BaseButton from '@shared/components/BaseButton.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import LocaleSwitch from '@shared/components/LocaleSwitch.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { OwnerUser, SessionState } from '@shared/types'

defineProps<{
  session: Readonly<SessionState>
  activeProfile: OwnerUser | null
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
  profileName: string
  profileLanguage: Locale
  companyName: string
  isLoading: boolean
  isSavingProfile: boolean
  isSavingCompany: boolean
  profileError: string
  companyError: string
  profileSuccess: string
  companySuccess: string
}>()

const emit = defineEmits<{
  logout: []
  updateTheme: [theme: AppTheme]
  updateProfileName: [value: string]
  updateProfileLanguage: [value: Locale]
  updateCompanyName: [value: string]
  submitProfile: []
  submitCompany: []
}>()
</script>

<template>
  <WorkspaceShell
    :session="session"
    :active-profile="activeProfile"
    :is-loading="isLoading"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :title="messages.ownerSettings.pageTitle"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
    <section class="dashboard-grid settings-grid">
      <article class="panel settings-panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">{{ messages.common.profile }}</p>
            <h3>{{ messages.ownerSettings.profileTitle }}</h3>
          </div>
        </div>

        <form class="auth-form" @submit.prevent="emit('submitProfile')">
          <label class="field" for="owner-full-name">
            <span>{{ messages.ownerSettings.fullName }}</span>
            <BaseInput
              id="owner-full-name"
              :model-value="profileName"
              autocomplete="name"
              required
              @update:model-value="emit('updateProfileName', $event)"
            />
          </label>

          <div class="field">
            <span>{{ messages.ownerSettings.language }}</span>
            <LocaleSwitch :locale="profileLanguage" @change="emit('updateProfileLanguage', $event)" />
          </div>

          <p v-if="profileSuccess" class="success-banner">{{ profileSuccess }}</p>
          <p v-if="profileError" class="error-banner">{{ profileError }}</p>

          <div class="auth-actions">
            <BaseButton class="btn btn-primary auth-submit" type="submit" :disabled="isSavingProfile">
              {{ isSavingProfile ? messages.ownerSettings.saving : messages.ownerSettings.saveProfile }}
            </BaseButton>
          </div>
        </form>
      </article>

      <article class="panel settings-panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">{{ messages.common.company }}</p>
            <h3>{{ messages.ownerSettings.companyTitle }}</h3>
          </div>
        </div>

        <form class="auth-form" @submit.prevent="emit('submitCompany')">
          <label class="field" for="company-name">
            <span>{{ messages.ownerSettings.companyName }}</span>
            <BaseInput
              id="company-name"
              :model-value="companyName"
              autocomplete="organization"
              required
              @update:model-value="emit('updateCompanyName', $event)"
            />
          </label>

          <p class="muted-copy">{{ activeProfile?.email || messages.common.noValue }}</p>

          <p v-if="companySuccess" class="success-banner">{{ companySuccess }}</p>
          <p v-if="companyError" class="error-banner">{{ companyError }}</p>

          <div class="auth-actions">
            <BaseButton class="btn btn-primary auth-submit" type="submit" :disabled="isSavingCompany">
              {{ isSavingCompany ? messages.ownerSettings.saving : messages.ownerSettings.saveCompany }}
            </BaseButton>
          </div>
        </form>
      </article>
    </section>
  </WorkspaceShell>
</template>
