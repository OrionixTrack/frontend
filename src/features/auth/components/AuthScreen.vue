<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import type { AuthFormState, AuthLinkAction, AuthMode, AuthScreenUi } from '@features/auth/types'
import type { RoleOption } from '@features/auth/types/RoleOption'
import AppBrand from '@shared/components/AppBrand.vue'
import AppHeaderActions from '@shared/components/AppHeaderActions.vue'
import BaseButton from '@shared/components/BaseButton.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import LocaleSwitch from '@shared/components/LocaleSwitch.vue'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale } from '@shared/i18n/translations'
import type { UserRole } from '@shared/types'

const props = defineProps<{
  mode: AuthMode
  form: AuthFormState
  roleOptions: RoleOption[]
  authHeading: string
  authError: string
  authInfo: string
  authSuccess: string
  hasToken: boolean
  isPrimaryActionDisabled: boolean
  isSubmitDisabled: boolean
  isSubmitting: boolean
  helperLinks: AuthLinkAction[]
  locale: Locale
  theme: AppTheme
  ui: AuthScreenUi
  resendCooldownMessage: string
  showPrimaryAction: boolean
}>()

const emit = defineEmits<{
  updateRole: [role: UserRole]
  updateEmail: [email: string]
  updatePassword: [password: string]
  updateFullName: [fullName: string]
  updateCompanyName: [companyName: string]
  updateName: [name: string]
  updateSurname: [surname: string]
  updateNewPassword: [newPassword: string]
  submit: []
  updateLocale: [locale: Locale]
  updateTheme: [theme: AppTheme]
}>()

const showsRoleSwitch = computed(() => props.mode === 'login' || props.mode === 'forgot-password')
const showsLanguage = computed(() => props.mode === 'accept-invitation')
const showsEmail = computed(
  () =>
    props.mode === 'login' ||
    props.mode === 'register' ||
    props.mode === 'resend-verification' ||
    props.mode === 'forgot-password',
)
const showsPassword = computed(
  () => props.mode === 'login' || props.mode === 'register' || props.mode === 'accept-invitation',
)
const showsNewPassword = computed(() => props.mode === 'reset-password')
const showsFullName = computed(() => props.mode === 'register')
const showsCompanyName = computed(() => props.mode === 'register')
const showsInvitationNames = computed(() => props.mode === 'accept-invitation')
const showsForm = computed(() => props.mode !== 'verify-email' && props.mode !== 'check-email')
const showsTokenWarning = computed(
  () =>
    !props.hasToken &&
    (props.mode === 'verify-email' || props.mode === 'reset-password' || props.mode === 'accept-invitation'),
)

const updateEmail = (value: string): void => emit('updateEmail', value.trim())
const updatePassword = (value: string): void => emit('updatePassword', value)
const updateFullName = (value: string): void => emit('updateFullName', value.trimStart())
const updateCompanyName = (value: string): void => emit('updateCompanyName', value.trimStart())
const updateName = (value: string): void => emit('updateName', value.trimStart())
const updateSurname = (value: string): void => emit('updateSurname', value.trimStart())
const updateNewPassword = (value: string): void => emit('updateNewPassword', value)
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
            <h2>{{ ui.cardTitle }}</h2>
          </div>

          <p class="auth-card-copy">{{ ui.cardDescription }}</p>

          <div v-if="showsRoleSwitch" class="role-switch role-switch-tabs">
            <BaseButton
              v-for="option in roleOptions"
              :key="option.value"
              class="role-option"
              :class="{ active: form.role === option.value }"
              @click="emit('updateRole', option.value)"
            >
              <strong>{{ option.label }}</strong>
            </BaseButton>
          </div>

          <form v-if="showsForm" class="auth-form" method="post" @submit.prevent="emit('submit')">
            <label v-if="showsFullName" class="field" for="auth-full-name">
              <span>{{ ui.fullName }}</span>
              <BaseInput
                id="auth-full-name"
                :model-value="form.fullName"
                autocomplete="name"
                required
                @update:model-value="updateFullName"
              />
            </label>

            <label v-if="showsCompanyName" class="field" for="auth-company-name">
              <span>{{ ui.companyName }}</span>
              <BaseInput
                id="auth-company-name"
                :model-value="form.companyName"
                autocomplete="organization"
                required
                @update:model-value="updateCompanyName"
              />
            </label>

            <label v-if="showsInvitationNames" class="field" for="auth-name">
              <span>{{ ui.firstName }}</span>
              <BaseInput
                id="auth-name"
                :model-value="form.name"
                autocomplete="given-name"
                required
                @update:model-value="updateName"
              />
            </label>

            <label v-if="showsInvitationNames" class="field" for="auth-surname">
              <span>{{ ui.lastName }}</span>
              <BaseInput
                id="auth-surname"
                :model-value="form.surname"
                autocomplete="family-name"
                required
                @update:model-value="updateSurname"
              />
            </label>

            <div v-if="showsLanguage" class="field">
              <span>{{ ui.selectedLanguage }}</span>
              <LocaleSwitch :locale="locale" @change="emit('updateLocale', $event)" />
            </div>

            <label v-if="showsEmail" class="field" for="auth-email">
              <span>{{ ui.email }}</span>
              <BaseInput
                id="auth-email"
                :model-value="form.email"
                name="username"
                autocomplete="username"
                type="email"
                inputmode="email"
                required
                @update:model-value="updateEmail"
              />
            </label>

            <label v-if="showsPassword" class="field" for="auth-password">
              <span>{{ ui.password }}</span>
              <BaseInput
                id="auth-password"
                :model-value="form.password"
                name="password"
                autocomplete="current-password"
                type="password"
                minlength="8"
                required
                @update:model-value="updatePassword"
              />
            </label>

            <label v-if="showsNewPassword" class="field" for="auth-new-password">
              <span>{{ ui.newPassword }}</span>
              <BaseInput
                id="auth-new-password"
                :model-value="form.newPassword"
                name="new-password"
                autocomplete="new-password"
                type="password"
                minlength="6"
                required
                @update:model-value="updateNewPassword"
              />
            </label>

            <p v-if="showsTokenWarning" class="error-banner">{{ ui.tokenRequired }}</p>
            <p v-if="authInfo" class="info-banner">{{ authInfo }}</p>
            <p v-if="authSuccess" class="success-banner">{{ authSuccess }}</p>
            <p v-if="authError" class="error-banner">{{ authError }}</p>
            <p v-if="resendCooldownMessage" class="info-banner">{{ resendCooldownMessage }}</p>

            <div class="auth-actions">
              <BaseButton class="btn btn-primary auth-submit" type="submit" :disabled="isSubmitDisabled || showsTokenWarning">
                {{ isSubmitting ? ui.submittingLabel : ui.submitLabel }}
              </BaseButton>
            </div>
          </form>

          <div v-else class="auth-form">
            <p v-if="authInfo" class="info-banner">{{ authInfo }}</p>
            <p v-if="authSuccess" class="success-banner">{{ authSuccess }}</p>
            <p v-if="authError" class="error-banner">{{ authError }}</p>
            <p v-if="showsTokenWarning" class="error-banner">{{ ui.tokenRequired }}</p>
            <p v-if="resendCooldownMessage" class="info-banner">{{ resendCooldownMessage }}</p>

            <div v-if="showPrimaryAction" class="auth-actions">
              <BaseButton class="btn btn-primary auth-submit" :disabled="isPrimaryActionDisabled" @click="emit('submit')">
                {{ isSubmitting ? ui.submittingLabel : ui.submitLabel }}
              </BaseButton>
            </div>
          </div>

          <div class="auth-links">
            <RouterLink
              v-for="link in helperLinks"
              :key="`${link.label}-${link.to.name}`"
              class="btn btn-secondary auth-link"
              :to="link.to"
            >
              {{ link.label }}
            </RouterLink>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
