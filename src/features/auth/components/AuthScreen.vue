<script setup lang="ts">
import type { AuthScreenUi } from '@features/auth/types/AuthScreenUi'
import type { RoleOption } from '@features/auth/types/RoleOption'
import AppBrand from '@shared/components/AppBrand.vue'
import AppHeaderActions from '@shared/components/AppHeaderActions.vue'
import BaseButton from '@shared/components/BaseButton.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale } from '@shared/i18n/translations'
import type { LoginCredentials } from '@features/auth/types'
import type { UserRole } from '@shared/types'

defineProps<{
  credentials: LoginCredentials
  roleOptions: RoleOption[]
  authHeading: string
  authError: string
  isSubmitting: boolean
  locale: Locale
  theme: AppTheme
  ui: AuthScreenUi
}>()

const emit = defineEmits<{
  updateRole: [role: UserRole]
  updateEmail: [email: string]
  updatePassword: [password: string]
  submit: []
  updateLocale: [locale: Locale]
  updateTheme: [theme: AppTheme]
}>()

const updateEmail = (value: string): void => emit('updateEmail', value.trim())
const updatePassword = (value: string): void => emit('updatePassword', value)
</script>

<template>
  <div class="auth-shell">
    <section class="auth-stage">
      <header class="auth-header">
        <AppBrand :eyebrow="ui.appName" :title="''" />
        <AppHeaderActions
          :locale="locale"
          :theme="theme"
          @update-locale="emit('updateLocale', $event)"
          @update-theme="emit('updateTheme', $event)"
        />
      </header>

      <div class="auth-layout">
        <section class="auth-copy">
          <p class="section-kicker">{{ authHeading }}</p>
          <h1>{{ ui.heroTitle }}</h1>
          <p class="hero-text">{{ ui.heroDescription }}</p>

          <div class="auth-copy-list">
            <div v-for="option in roleOptions" :key="option.value" class="auth-copy-item">
              <strong>{{ option.label }}</strong>
              <p>{{ option.description }}</p>
            </div>
          </div>
        </section>

        <section class="auth-card">
          <div class="auth-card-head">
            <h2>{{ authHeading }}</h2>
          </div>

          <p class="auth-card-copy">{{ ui.heroDescription }}</p>

          <div class="role-switch role-switch-tabs">
            <BaseButton
              v-for="option in roleOptions"
              :key="option.value"
              class="role-option"
              :class="{ active: credentials.role === option.value }"
              @click="emit('updateRole', option.value)"
            >
              <strong>{{ option.label }}</strong>
            </BaseButton>
          </div>

          <form class="auth-form" method="post" @submit.prevent="emit('submit')">
            <label class="field" for="login-email">
              <span>{{ ui.email }}</span>
              <BaseInput
                id="login-email"
                :model-value="credentials.email"
                name="username"
                autocomplete="username"
                type="email"
                inputmode="email"
                required
                @update:model-value="updateEmail"
              />
            </label>

            <label class="field" for="login-password">
              <span>{{ ui.password }}</span>
              <BaseInput
                id="login-password"
                :model-value="credentials.password"
                name="password"
                autocomplete="current-password"
                type="password"
                minlength="8"
                required
                @update:model-value="updatePassword"
              />
            </label>

            <p v-if="authError" class="error-banner">{{ authError }}</p>

            <div class="auth-actions">
              <BaseButton class="btn btn-primary auth-submit" type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? ui.signingIn : ui.signIn }}
              </BaseButton>
            </div>
          </form>
        </section>
      </div>
    </section>
  </div>
</template>
