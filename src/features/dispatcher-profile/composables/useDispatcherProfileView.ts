import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { getSafeErrorMessage } from '@core/api'
import { useSessionStore } from '@core/stores/session'
import { getDispatcherProfile, updateDispatcherProfile } from '@features/dispatcher-profile/api/dispatcher-profile.api'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import type { DispatcherUser } from '@shared/types'

export const useDispatcherProfileView = () => {
  const router = useRouter()
  const { session, logout, updateUser } = useSessionStore()
  const { theme, setTheme } = useTheme()
  const { locale, messages } = useI18n()
  const { isLoading, error: pageError, execute: executePage } = useApiState('')
  const {
    isLoading: isSaving,
    error: saveError,
    execute: executeSave,
    resetError: resetSaveError,
  } = useApiState('')

  const activeProfile = ref<DispatcherUser | null>((session.user as DispatcherUser | null) ?? null)
  const saveSuccess = ref('')
  const form = reactive({
    name: '',
    surname: '',
  })

  const syncForm = (profile: DispatcherUser | null): void => {
    form.name = profile?.name ?? ''
    form.surname = profile?.surname ?? ''
  }

  const loadProfile = async (signal?: AbortSignal): Promise<void> => {
    try {
      const profile = await executePage(
        () => getDispatcherProfile(signal),
        (error) => getSafeErrorMessage(error, messages.value.dispatcherProfile.loadError),
      )

      activeProfile.value = profile
      updateUser(profile)
      syncForm(profile)
    } catch {
      return
    }
  }

  watch(
    () => session.accessToken,
    async (token, _previous, onCleanup) => {
      if (!token || session.role !== 'dispatcher') {
        activeProfile.value = null
        syncForm(null)
        return
      }

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      await loadProfile(controller.signal)
    },
    { immediate: true },
  )

  const handleLogout = async (): Promise<void> => {
    logout()
    await router.replace({ name: 'login' })
  }

  const handleSubmit = async (): Promise<void> => {
    saveSuccess.value = ''
    resetSaveError()

    try {
      await executeSave(
        () =>
          updateDispatcherProfile({
            name: form.name.trim(),
            surname: form.surname.trim(),
          }),
        (error) => getSafeErrorMessage(error, messages.value.dispatcherProfile.saveError),
      )

      const profile = await getDispatcherProfile()
      activeProfile.value = profile
      updateUser(profile)
      syncForm(profile)
      saveSuccess.value = messages.value.dispatcherProfile.saveSuccess
    } catch {
      return
    }
  }

  return {
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
    setName: (value: string) => {
      form.name = value
    },
    setSurname: (value: string) => {
      form.surname = value
    },
    setTheme,
    theme,
  }
}
