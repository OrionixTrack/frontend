<script setup lang="ts">
import { DispatcherProfileScreen, useDispatcherProfileView } from '@features/dispatcher-profile'

const {
  activeProfile,
  form,
  handleLogout,
  handleSubmit,
  isLoading,
  isSaving,
  locale,
  messages,
  pageError,
  saveError,
  saveSuccess,
  session,
  setName,
  setSurname,
  setTheme,
  theme,
} = useDispatcherProfileView()
</script>

<template>
  <DispatcherProfileScreen
    :session="session"
    :active-profile="activeProfile"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :name="form.name"
    :surname="form.surname"
    :is-loading="isLoading"
    :is-saving="isSaving"
    :page-error="pageError"
    :save-error="saveError"
    :save-success="saveSuccess"
    @logout="handleLogout"
    @update-theme="setTheme"
    @update-name="setName"
    @update-surname="setSurname"
    @submit="handleSubmit"
  />
  <p v-if="pageError" class="error-banner page-error-inline">{{ pageError }}</p>
</template>
