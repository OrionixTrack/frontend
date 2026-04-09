<script setup lang="ts">
import { AuthScreen, useAuthView } from '@features/auth'

const {
  authError,
  isSubmitting,
  credentials,
  roleOptions,
  authHeading,
  authUi,
  locale,
  theme,
  setRole,
  setLocale,
  setTheme,
  setEmail,
  setPassword,
  handleLogin,
} = useAuthView()
</script>

<template>
  <AuthScreen
    :credentials="credentials"
    :role-options="roleOptions"
    :auth-heading="authHeading"
    :auth-error="authError"
    :is-submitting="isSubmitting"
    :locale="locale"
    :theme="theme"
    :ui="authUi"
    @update-role="setRole"
    @update-email="setEmail"
    @update-password="setPassword"
    @update-locale="setLocale"
    @update-theme="setTheme"
    @submit="handleLogin"
  />
</template>
