<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import WorkspaceShell from '@shared/components/WorkspaceShell.vue'
import BaseButton from '@shared/components/BaseButton.vue'
import BaseDialog from '@shared/components/BaseDialog.vue'
import BaseInput from '@shared/components/BaseInput.vue'
import { useSnackbar } from '@shared/composables/useSnackbar'
import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'
import type { OwnerUser, SessionState } from '@shared/types'

import type { EmployeeItem } from '../types/EmployeeItem'
import type { EmployeeSortBy } from '../types/EmployeeSortBy'
import type { EmployeeSortOrder } from '../types/EmployeeSortOrder'
import type { EmployeeType } from '../types/EmployeeType'

const props = defineProps<{
  session: Readonly<SessionState>
  activeProfile: OwnerUser | null
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
  employeeTypes: EmployeeType[]
  selectedEmployeeType: EmployeeType
  selectedEmployeeTypeLabel: string
  employees: EmployeeItem[]
  searchQuery: string
  sortBy: EmployeeSortBy
  sortOrder: EmployeeSortOrder
  pageError: string
  saveSuccess: string
  removeSuccess: string
  isLoading: boolean
  isInitialLoading: boolean
  hasNextPage: boolean
  isLoadingMore: boolean
  isEditDialogOpen: boolean
  isEditing: boolean
  editError: string
  editName: string
  editSurname: string
  isRemoveDialogOpen: boolean
  isRemoving: boolean
  removeError: string
  selectedEmployeeForRemove: EmployeeItem | null
}>()

const emit = defineEmits<{
  logout: []
  updateTheme: [theme: AppTheme]
  updateEmployeeType: [value: EmployeeType]
  updateSearchQuery: [value: string]
  updateSortBy: [value: EmployeeSortBy]
  updateSortOrder: [value: EmployeeSortOrder]
  loadMore: []
  openEditDialog: [employee: EmployeeItem]
  closeEditDialog: []
  updateEditName: [value: string]
  updateEditSurname: [value: string]
  submitEdit: []
  openRemoveDialog: [employee: EmployeeItem]
  closeRemoveDialog: []
  confirmRemove: []
}>()

const { showSnackbar } = useSnackbar()
const hasTriedEditSubmit = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
const normalizedEditName = computed(() => props.editName.trim())
const normalizedEditSurname = computed(() => props.editSurname.trim())
const hasEditValidationError = computed(
  () => !normalizedEditName.value || !normalizedEditSurname.value,
)
const shouldShowEditValidationError = computed(
  () => hasTriedEditSubmit.value && hasEditValidationError.value,
)
const emptyStateMessage = computed(() =>
  props.searchQuery.trim() ? props.messages.employees.emptySearch : props.messages.employees.empty,
)
const sortOptions: EmployeeSortBy[] = ['name', 'surname', 'email', 'register_date']

const formatDate = (value: string, locale: Locale): string =>
  new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const getEmployeeTypeLabel = (type: EmployeeType): string =>
  type === 'driver' ? props.messages.employees.driversTab : props.messages.employees.dispatchersTab

const getLanguageLabel = (value: string): string => {
  switch (value) {
    case 'uk':
      return props.locale === 'uk' ? 'Українська' : 'Ukrainian'
    case 'en':
      return props.locale === 'uk' ? 'Англійська' : 'English'
    default:
      return value.toUpperCase()
  }
}

const getSortLabel = (value: EmployeeSortBy): string => {
  switch (value) {
    case 'name':
      return props.messages.employees.sortName
    case 'surname':
      return props.messages.employees.sortSurname
    case 'email':
      return props.messages.employees.sortEmail
    default:
      return props.messages.employees.sortRegisterDate
  }
}

const handleEditSubmit = (): void => {
  hasTriedEditSubmit.value = true

  if (hasEditValidationError.value) {
    return
  }

  emit('submitEdit')
}

const handleCloseEditDialog = (): void => {
  hasTriedEditSubmit.value = false
  emit('closeEditDialog')
}

const disconnectObserver = (): void => {
  observer?.disconnect()
  observer = null
}

const connectObserver = (): void => {
  disconnectObserver()

  if (!loadMoreTrigger.value) {
    return
  }

  observer = new window.IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting) && props.hasNextPage && !props.isLoading) {
        emit('loadMore')
      }
    },
    {
      rootMargin: '240px 0px',
    },
  )

  observer?.observe(loadMoreTrigger.value)
}

const handleSortByChange = (event: Event): void => {
  const target = event.target

  if (!(target instanceof window.HTMLSelectElement)) {
    return
  }

  emit('updateSortBy', target.value as EmployeeSortBy)
}

onMounted(connectObserver)
onBeforeUnmount(disconnectObserver)
watch([loadMoreTrigger, () => props.hasNextPage, () => props.isLoading], connectObserver)
watch(
  () => props.saveSuccess,
  (value) => {
    if (value) {
      showSnackbar(value, { tone: 'success' })
    }
  },
)
watch(
  () => props.removeSuccess,
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
    :is-loading="isInitialLoading"
    :locale="locale"
    :messages="messages"
    :theme="theme"
    :title="messages.employees.pageTitle"
    @logout="emit('logout')"
    @update-theme="emit('updateTheme', $event)"
  >
    <BaseDialog
      :open="isEditDialogOpen"
      @close="handleCloseEditDialog"
    >
      <div class="panel-header modal-header">
        <div>
          <p class="section-kicker">
            {{ messages.employees.pageTitle }}
          </p>
          <h3>{{ messages.employees.editTitle }}</h3>
        </div>
        <BaseButton
          class="dialog-close"
          :aria-label="messages.common.close"
          @click="handleCloseEditDialog"
        >
          ×
        </BaseButton>
      </div>

      <p class="muted-copy">
        {{ messages.employees.editDescription.replace('{type}', selectedEmployeeTypeLabel.toLowerCase()) }}
      </p>

      <form
        class="auth-form"
        @submit.prevent="handleEditSubmit"
      >
        <label
          class="field"
          for="employee-edit-name"
        >
          <span>{{ messages.employees.columnName }}</span>
          <BaseInput
            id="employee-edit-name"
            :model-value="editName"
            required
            @update:model-value="emit('updateEditName', $event)"
          />
        </label>

        <label
          class="field"
          for="employee-edit-surname"
        >
          <span>{{ messages.employees.columnSurname }}</span>
          <BaseInput
            id="employee-edit-surname"
            :model-value="editSurname"
            required
            @update:model-value="emit('updateEditSurname', $event)"
          />
        </label>

        <p
          v-if="shouldShowEditValidationError"
          class="error-banner"
        >
          {{ messages.employees.validationError }}
        </p>
        <p
          v-if="editError"
          class="error-banner"
        >
          {{ editError }}
        </p>

        <div class="auth-actions modal-actions">
          <BaseButton
            class="btn btn-secondary"
            :disabled="isEditing"
            @click="handleCloseEditDialog"
          >
            {{ messages.common.cancel }}
          </BaseButton>
          <BaseButton
            class="btn btn-primary auth-submit"
            type="submit"
            :disabled="isEditing"
          >
            {{ isEditing ? messages.employees.saving : messages.employees.saveChanges }}
          </BaseButton>
        </div>
      </form>
    </BaseDialog>

    <BaseDialog
      :open="isRemoveDialogOpen"
      @close="emit('closeRemoveDialog')"
    >
      <div class="panel-header modal-header">
        <div>
          <p class="section-kicker">
            {{ messages.employees.pageTitle }}
          </p>
          <h3>{{ messages.employees.removeTitle }}</h3>
        </div>
        <BaseButton
          class="dialog-close"
          :aria-label="messages.common.close"
          @click="emit('closeRemoveDialog')"
        >
          ×
        </BaseButton>
      </div>

      <p class="muted-copy">
        {{
          selectedEmployeeType === 'driver'
            ? messages.employees.removeDriverDescription
            : messages.employees.removeDispatcherDescription
        }}
      </p>
      <p
        v-if="selectedEmployeeForRemove"
        class="info-banner"
      >
        {{ selectedEmployeeForRemove.name }} {{ selectedEmployeeForRemove.surname }}
      </p>
      <p
        v-if="removeError"
        class="error-banner"
      >
        {{ removeError }}
      </p>

      <div class="auth-actions modal-actions">
        <BaseButton
          class="btn btn-secondary"
          :disabled="isRemoving"
          @click="emit('closeRemoveDialog')"
        >
          {{ messages.common.cancel }}
        </BaseButton>
        <BaseButton
          class="btn btn-danger auth-submit"
          :disabled="isRemoving"
          @click="emit('confirmRemove')"
        >
          {{ isRemoving ? messages.employees.removing : messages.employees.confirmRemove }}
        </BaseButton>
      </div>
    </BaseDialog>

    <section class="dashboard-grid invitations-layout">
      <article class="panel settings-panel invitations-panel">
        <div class="panel-header">
          <div>
            <p class="section-kicker">
              {{ messages.employees.pageTitle }}
            </p>
            <h3>{{ messages.employees.listTitle }}</h3>
          </div>
          <RouterLink
            class="btn btn-primary"
            :to="{ name: 'owner-invitations' }"
          >
            {{ messages.employees.inviteCta }}
          </RouterLink>
        </div>

        <p class="muted-copy page-description">
          {{ messages.employees.description }}
        </p>
        <p
          v-if="pageError"
          class="error-banner"
        >
          {{ pageError }}
        </p>

        <div class="field">
          <span>{{ messages.employees.typeLabel }}</span>
          <div class="role-switch role-switch-tabs">
            <BaseButton
              v-for="type in employeeTypes"
              :key="type"
              class="role-option"
              :class="{ active: selectedEmployeeType === type }"
              @click="emit('updateEmployeeType', type)"
            >
              {{ getEmployeeTypeLabel(type) }}
            </BaseButton>
          </div>
        </div>

        <div class="table-toolbar employees-toolbar">
          <label
            class="field table-search"
            for="employee-search"
          >
            <span>{{ messages.employees.searchLabel }}</span>
            <BaseInput
              id="employee-search"
              :model-value="searchQuery"
              :placeholder="messages.employees.searchPlaceholder"
              @update:model-value="emit('updateSearchQuery', $event)"
            />
          </label>

          <label
            class="field"
            for="employee-sort-by"
          >
            <span>{{ messages.employees.sortByLabel }}</span>
            <select
              id="employee-sort-by"
              :value="sortBy"
              @change="handleSortByChange"
            >
              <option
                v-for="option in sortOptions"
                :key="option"
                :value="option"
              >
                {{ getSortLabel(option) }}
              </option>
            </select>
          </label>

          <div class="field">
            <span>{{ messages.employees.sortOrderLabel }}</span>
            <div class="role-switch role-switch-tabs compact-switch">
              <BaseButton
                class="role-option"
                :class="{ active: sortOrder === 'DESC' }"
                @click="emit('updateSortOrder', 'DESC')"
              >
                {{ messages.employees.newestFirst }}
              </BaseButton>
              <BaseButton
                class="role-option"
                :class="{ active: sortOrder === 'ASC' }"
                @click="emit('updateSortOrder', 'ASC')"
              >
                {{ messages.employees.oldestFirst }}
              </BaseButton>
            </div>
          </div>
        </div>

        <div
          v-if="!employees.length"
          class="employee-empty-state"
        >
          <p class="muted-copy">
            {{ emptyStateMessage }}
          </p>
          <RouterLink
            class="btn btn-secondary"
            :to="{ name: 'owner-invitations' }"
          >
            {{ messages.employees.inviteCta }}
          </RouterLink>
        </div>

        <div
          v-else
          class="table-wrap"
        >
          <table class="data-table employee-table">
            <thead>
              <tr>
                <th>{{ messages.employees.columnName }}</th>
                <th>{{ messages.employees.columnSurname }}</th>
                <th>{{ messages.employees.columnEmail }}</th>
                <th>{{ messages.employees.columnLanguage }}</th>
                <th>{{ messages.employees.columnRegisterDate }}</th>
                <th>{{ messages.employees.columnActions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="employee in employees"
                :key="employee.id"
              >
                <td>{{ employee.name }}</td>
                <td>{{ employee.surname }}</td>
                <td class="table-email">
                  {{ employee.email }}
                </td>
                <td>{{ getLanguageLabel(employee.language) }}</td>
                <td>{{ formatDate(employee.register_date, locale) }}</td>
                <td>
                  <div class="employee-actions">
                    <BaseButton
                      class="btn btn-secondary employee-action-button"
                      @click="emit('openEditDialog', employee)"
                    >
                      {{ messages.employees.editAction }}
                    </BaseButton>
                    <BaseButton
                      class="btn btn-secondary employee-action-button"
                      @click="emit('openRemoveDialog', employee)"
                    >
                      {{ messages.employees.removeAction }}
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          ref="loadMoreTrigger"
          class="table-load-more"
        >
          <span
            v-if="isLoadingMore"
            class="muted-copy"
          >
            {{ messages.common.loading }}
          </span>
          <span
            v-else-if="hasNextPage"
            class="muted-copy"
          />
        </div>
      </article>
    </section>
  </WorkspaceShell>
</template>
