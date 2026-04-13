import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { createStatusRule, getSafeErrorMessage, mapApiErrorMessage } from '@core/api'
import { useSessionStore } from '@core/stores/session'
import { deleteEmployee, getEmployees, updateEmployee } from '@features/employees/api/employees.api'
import type { EmployeeItem } from '@features/employees/types/EmployeeItem'
import type { EmployeeSortBy } from '@features/employees/types/EmployeeSortBy'
import type { EmployeeSortOrder } from '@features/employees/types/EmployeeSortOrder'
import type { EmployeeType } from '@features/employees/types/EmployeeType'
import {
  applyPaginatedItems,
  createPaginatedDirectoryState,
  type PaginatedDirectoryState,
  resetPaginatedDirectory,
  useDebouncedSearch,
  useDirectoryRouteSync,
} from '@shared/composables/paginatedDirectory'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import type { OwnerUser } from '@shared/types'

const DEFAULT_LIMIT = 20
type EmployeeFilters = ReturnType<typeof createEmployeeFilters>
type EmployeeDirectoryState = PaginatedDirectoryState<EmployeeItem, EmployeeFilters>

const createEmployeeFilters = () => ({
  limit: DEFAULT_LIMIT,
  offset: 0,
  search: '',
  sortBy: 'register_date' as EmployeeSortBy,
  sortOrder: 'DESC' as EmployeeSortOrder,
})

export const useEmployeesView = () => {
  const route = useRoute()
  const router = useRouter()
  const { session, logout } = useSessionStore()
  const { theme, setTheme } = useTheme()
  const { locale, messages } = useI18n()
  const { isLoading, error: pageError, execute: executePage, resetError: resetPageError } = useApiState('')
  const { isLoading: isEditing, error: editError, execute: executeEdit, resetError: resetEditError } = useApiState('')
  const { isLoading: isRemoving, error: removeError, execute: executeRemove, resetError: resetRemoveError } =
    useApiState('')

  const activeProfile = ref<OwnerUser | null>((session.user as OwnerUser | null) ?? null)
  const selectedEmployeeType = ref<EmployeeType>('driver')
  const saveSuccess = ref('')
  const removeSuccess = ref('')
  const editForm = reactive({
    name: '',
    surname: '',
  })
  const isEditDialogOpen = ref(false)
  const isRemoveDialogOpen = ref(false)
  const selectedEmployeeForEdit = ref<EmployeeItem | null>(null)
  const selectedEmployeeForRemove = ref<EmployeeItem | null>(null)
  const directories = reactive({
    driver: createPaginatedDirectoryState<EmployeeItem, EmployeeFilters>(createEmployeeFilters),
    dispatcher: createPaginatedDirectoryState<EmployeeItem, EmployeeFilters>(createEmployeeFilters),
  }) as Record<EmployeeType, EmployeeDirectoryState>

  const employeeTypes: EmployeeType[] = ['driver', 'dispatcher']
  const currentDirectory = computed(() => directories[selectedEmployeeType.value])
  const filters = computed(() => currentDirectory.value.filters)
  const items = computed(() => currentDirectory.value.items)
  const isInitialLoading = computed(() => isLoading.value && !currentDirectory.value.hasLoaded)
  const hasNextPage = computed(() => currentDirectory.value.hasNextPage)
  const selectedEmployeeTypeLabel = computed(() =>
    selectedEmployeeType.value === 'driver'
      ? messages.value.employees.driversTab
      : messages.value.employees.dispatchersTab,
  )
  const normalizeEmployeeType = (value: unknown): EmployeeType =>
    value === 'dispatcher' ? 'dispatcher' : 'driver'

  const normalizeSortBy = (value: unknown): EmployeeSortBy => {
    switch (value) {
      case 'name':
      case 'surname':
      case 'email':
      case 'register_date':
        return value
      default:
        return 'register_date'
    }
  }

  const normalizeSortOrder = (value: unknown): EmployeeSortOrder =>
    value === 'ASC' ? 'ASC' : 'DESC'

  const applyQueryState = (): void => {
    const nextType = normalizeEmployeeType(route.query.type)
    const nextDirectory = directories[nextType]

    selectedEmployeeType.value = nextType
    nextDirectory.filters.search = typeof route.query.search === 'string' ? route.query.search : ''
    nextDirectory.filters.sortBy = normalizeSortBy(route.query.sortBy)
    nextDirectory.filters.sortOrder = normalizeSortOrder(route.query.sortOrder)
    nextDirectory.filters.offset = 0
    nextDirectory.appliedSearch = nextDirectory.filters.search.trim()
  }

  useDirectoryRouteSync({
    route,
    router,
    applyRouteState: applyQueryState,
    buildRouteQuery: () => ({
      ...route.query,
      type: selectedEmployeeType.value === 'driver' ? undefined : selectedEmployeeType.value,
      search: currentDirectory.value.filters.search.trim() || undefined,
      sortBy: currentDirectory.value.filters.sortBy === 'register_date'
        ? undefined
        : currentDirectory.value.filters.sortBy,
      sortOrder: currentDirectory.value.filters.sortOrder === 'DESC'
        ? undefined
        : currentDirectory.value.filters.sortOrder,
    }),
    watchSources: () => [
      selectedEmployeeType.value,
      currentDirectory.value.filters.search,
      currentDirectory.value.filters.sortBy,
      currentDirectory.value.filters.sortOrder,
    ] as const,
  })

  const resetFeedback = (): void => {
    saveSuccess.value = ''
    removeSuccess.value = ''
  }

  const loadEmployees = async (signal?: AbortSignal): Promise<void> => {
    try {
      const directory = currentDirectory.value
      const employeeType = selectedEmployeeType.value
      const employeeItems = await executePage(
        () =>
          getEmployees(
            employeeType,
            {
              limit: directory.filters.limit,
              offset: directory.filters.offset,
              sortOrder: directory.filters.sortOrder,
              sortBy: directory.filters.sortBy,
              search: directory.appliedSearch,
            },
            signal,
          ),
        (error) => getSafeErrorMessage(error, messages.value.employees.loadError),
      )

      applyPaginatedItems(directory, Array.isArray(employeeItems) ? employeeItems : [])
    } catch {
      return
    }
  }

  watch(
    () =>
      [
        session.accessToken,
        selectedEmployeeType.value,
        currentDirectory.value.filters.limit,
        currentDirectory.value.filters.offset,
        currentDirectory.value.filters.sortBy,
        currentDirectory.value.filters.sortOrder,
        currentDirectory.value.appliedSearch,
      ] as const,
    async (token, _previous, onCleanup) => {
      if (!token[0]) {
        resetPaginatedDirectory(directories.driver, createEmployeeFilters)
        resetPaginatedDirectory(directories.dispatcher, createEmployeeFilters)
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadEmployees(controller.signal)
    },
    { immediate: true },
  )

  useDebouncedSearch(
    () => currentDirectory.value.filters.search,
    () => {
      currentDirectory.value.filters.offset = 0
      currentDirectory.value.appliedSearch = currentDirectory.value.filters.search.trim()
    },
  )

  const handleLogout = async (): Promise<void> => {
    logout()
    await router.replace({ name: 'login' })
  }

  const setEmployeeType = (value: EmployeeType): void => {
    resetFeedback()
    resetPageError()
    closeEditDialog()
    closeRemoveDialog()
    selectedEmployeeType.value = value
  }

  const openEditDialog = (employee: EmployeeItem): void => {
    resetFeedback()
    resetEditError()
    selectedEmployeeForEdit.value = employee
    editForm.name = employee.name
    editForm.surname = employee.surname
    isEditDialogOpen.value = true
  }

  const closeEditDialog = (): void => {
    resetEditError()
    selectedEmployeeForEdit.value = null
    editForm.name = ''
    editForm.surname = ''
    isEditDialogOpen.value = false
  }

  const openRemoveDialog = (employee: EmployeeItem): void => {
    resetFeedback()
    resetRemoveError()
    selectedEmployeeForRemove.value = employee
    isRemoveDialogOpen.value = true
  }

  const closeRemoveDialog = (): void => {
    resetRemoveError()
    selectedEmployeeForRemove.value = null
    isRemoveDialogOpen.value = false
  }

  const handleEditSubmit = async (): Promise<void> => {
    if (!selectedEmployeeForEdit.value) {
      return
    }

    try {
      const updatedEmployee = await executeEdit(
        () =>
          updateEmployee(selectedEmployeeType.value, selectedEmployeeForEdit.value!.id, {
            name: editForm.name.trim(),
            surname: editForm.surname.trim(),
          }),
        (error) => getSafeErrorMessage(error, messages.value.employees.updateError),
      )

      currentDirectory.value.items = currentDirectory.value.items.map((employee) =>
        employee.id === updatedEmployee.id ? updatedEmployee : employee,
      )
      saveSuccess.value = messages.value.employees.updateSuccess
      closeEditDialog()
    } catch {
      return
    }
  }

  const handleRemoveConfirm = async (): Promise<void> => {
    if (!selectedEmployeeForRemove.value) {
      return
    }

    const employeeId = selectedEmployeeForRemove.value.id

    try {
      await executeRemove(
        () => deleteEmployee(selectedEmployeeType.value, employeeId),
        (error) =>
          mapApiErrorMessage(error, messages.value.employees.removeError, [
            createStatusRule(
              409,
              messages.value.employees.driverRemoveConflict,
              () => selectedEmployeeType.value === 'driver',
            ),
          ]),
      )

      currentDirectory.value.items = currentDirectory.value.items.filter((employee) => employee.id !== employeeId)

      if (!currentDirectory.value.items.length && currentDirectory.value.filters.offset > 0) {
        currentDirectory.value.filters.offset = Math.max(
          0,
          currentDirectory.value.filters.offset - currentDirectory.value.filters.limit,
        )
      } else {
        currentDirectory.value.hasNextPage = currentDirectory.value.items.length >= currentDirectory.value.filters.limit
      }

      removeSuccess.value = messages.value.employees.removeSuccess
      closeRemoveDialog()
    } catch {
      return
    }
  }

  return {
    activeProfile,
    closeEditDialog,
    closeRemoveDialog,
    editError,
    editForm,
    employeeTypes,
    filters,
    hasNextPage,
    handleEditSubmit,
    handleLogout,
    handleRemoveConfirm,
    isEditDialogOpen,
    isEditing,
    isInitialLoading,
    isLoading,
    isLoadingMore: computed(() => isLoading.value && currentDirectory.value.items.length > 0),
    isRemoveDialogOpen,
    isRemoving,
    items,
    loadMoreEmployees: () => {
      if (!currentDirectory.value.hasNextPage || isLoading.value) {
        return
      }

      resetFeedback()
      currentDirectory.value.filters.offset += currentDirectory.value.filters.limit
    },
    locale,
    messages,
    openEditDialog,
    openRemoveDialog,
    pageError,
    removeError,
    removeSuccess,
    saveSuccess,
    selectedEmployeeForEdit,
    selectedEmployeeForRemove,
    selectedEmployeeType,
    selectedEmployeeTypeLabel,
    session,
    setEditName: (value: string) => {
      resetEditError()
      editForm.name = value
    },
    setEditSurname: (value: string) => {
      resetEditError()
      editForm.surname = value
    },
    setEmployeeType,
    setSearch: (value: string) => {
      resetFeedback()
      currentDirectory.value.filters.search = value
    },
    setSortBy: (value: EmployeeSortBy) => {
      resetFeedback()
      currentDirectory.value.filters.offset = 0
      currentDirectory.value.filters.sortBy = value
    },
    setSortOrder: (value: EmployeeSortOrder) => {
      resetFeedback()
      currentDirectory.value.filters.offset = 0
      currentDirectory.value.filters.sortOrder = value
    },
    setTheme,
    theme,
  }
}
