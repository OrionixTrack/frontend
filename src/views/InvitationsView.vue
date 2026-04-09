<script setup lang="ts">
import { InvitationsScreen, useInvitationsView } from '@features/invitations'

const {
  activeProfile,
  closeInviteDialog,
  createError,
  createSuccess,
  filters,
  form,
  handleInviteSubmit,
  handleLogout,
  hasMoreInvitations,
  invitations,
  isInviteDialogOpen,
  isInitialLoading,
  isLoading,
  isLoadingMore,
  isSubmitting,
  locale,
  loadMoreInvitations,
  messages,
  openInviteDialog,
  pageError,
  session,
  setSearch,
  setInvitationEmail,
  setInvitationRole,
  setSortOrder,
  setTheme,
  theme,
} = useInvitationsView()
</script>

<template>
  <InvitationsScreen
    :session="session"
    :active-profile="activeProfile"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :invitation-email="form.email"
    :invitation-role="form.role"
    :invitations="invitations"
    :is-invite-dialog-open="isInviteDialogOpen"
    :is-loading="isLoading"
    :is-submitting="isSubmitting"
    :page-error="pageError"
    :create-error="createError"
    :create-success="createSuccess"
    :has-more-invitations="hasMoreInvitations"
    :search-query="filters.search"
    :sort-order="filters.sortOrder"
    :is-initial-loading="isInitialLoading"
    :is-loading-more="isLoadingMore"
    @logout="handleLogout"
    @close-invite-dialog="closeInviteDialog"
    @load-more="loadMoreInvitations"
    @open-invite-dialog="openInviteDialog"
    @update-search-query="setSearch"
    @update-theme="setTheme"
    @update-invitation-email="setInvitationEmail"
    @update-invitation-role="setInvitationRole"
    @update-sort-order="setSortOrder"
    @submit-invitation="handleInviteSubmit"
  />
</template>
