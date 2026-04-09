<script setup lang="ts">
import { OwnerSettingsScreen, useOwnerSettingsView } from '@features/owner-settings'

const {
  activeProfile,
  companyError,
  companySuccess,
  form,
  handleCompanySubmit,
  handleLogout,
  handleProfileSubmit,
  isLoading,
  isSavingCompany,
  isSavingProfile,
  locale,
  messages,
  pageError,
  profileError,
  profileSuccess,
  session,
  setCompanyName,
  setLocale,
  setProfileLanguage,
  setProfileName,
  setTheme,
  theme,
} = useOwnerSettingsView()
</script>

<template>
  <OwnerSettingsScreen
    :session="session"
    :active-profile="activeProfile"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :profile-name="form.profileName"
    :profile-language="form.profileLanguage"
    :company-name="form.companyName"
    :is-loading="isLoading"
    :is-saving-profile="isSavingProfile"
    :is-saving-company="isSavingCompany"
    :profile-error="profileError"
    :company-error="companyError"
    :profile-success="profileSuccess"
    :company-success="companySuccess"
    @logout="handleLogout"
    @update-theme="setTheme"
    @update-profile-name="setProfileName"
    @update-profile-language="setProfileLanguage"
    @update-company-name="setCompanyName"
    @submit-profile="handleProfileSubmit"
    @submit-company="handleCompanySubmit"
  />
  <p v-if="pageError" class="error-banner page-error-inline">{{ pageError }}</p>
</template>
