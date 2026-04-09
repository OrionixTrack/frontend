import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { getSafeErrorMessage } from '@core/api'
import { useSessionStore } from '@core/stores/session'
import { getOwnerProfile, updateOwnerCompany, updateOwnerProfile } from '@features/owner-settings/api/owner-settings.api'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import type { Locale } from '@shared/i18n/translations'
import type { OwnerUser } from '@shared/types'

export const useOwnerSettingsView = () => {
  const router = useRouter()
  const { session, logout, updateUser } = useSessionStore()
  const { theme, setTheme } = useTheme()
  const { locale, messages, setLocale } = useI18n()
  const {
    isLoading,
    error: pageError,
    execute: executePage,
  } = useApiState('')
  const {
    isLoading: isSavingProfile,
    error: profileError,
    execute: executeProfile,
    resetError: resetProfileError,
  } = useApiState('')
  const {
    isLoading: isSavingCompany,
    error: companyError,
    execute: executeCompany,
    resetError: resetCompanyError,
  } = useApiState('')
  const activeProfile = ref<OwnerUser | null>((session.user as OwnerUser | null) ?? null)
  const profileSuccess = ref('')
  const companySuccess = ref('')
  const form = reactive({
    profileName: '',
    profileLanguage: locale.value,
    companyName: '',
  })

  const syncForm = (profile: OwnerUser | null): void => {
    form.profileName = profile?.full_name ?? ''
    form.profileLanguage = (profile?.language ?? locale.value) as Locale
    form.companyName = profile?.company?.name ?? ''
  }

  const loadProfile = async (signal?: AbortSignal): Promise<void> => {
    try {
      const profile = await executePage(
        () => getOwnerProfile(signal),
        (error) => getSafeErrorMessage(error, messages.value.ownerSettings.loadError),
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
      if (!token) {
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

  watch(locale, (value) => {
    if (!activeProfile.value || activeProfile.value.language === form.profileLanguage) {
      form.profileLanguage = value
    }
  })

  const handleLogout = async (): Promise<void> => {
    logout()
    await router.replace({ name: 'login' })
  }

  const applyUpdatedProfile = (profile: OwnerUser): void => {
    activeProfile.value = profile
    updateUser(profile)
    syncForm(profile)
  }

  const handleProfileSubmit = async (): Promise<void> => {
    profileSuccess.value = ''
    companySuccess.value = ''
    resetProfileError()

    try {
      await executeProfile(
        () =>
          updateOwnerProfile({
            full_name: form.profileName.trim(),
            language: form.profileLanguage,
          }),
        (error) => getSafeErrorMessage(error, messages.value.ownerSettings.saveError),
      )

      const profile = await getOwnerProfile()
      applyUpdatedProfile(profile)

      if (profile.language !== locale.value) {
        setLocale(profile.language)
      }

      profileSuccess.value = messages.value.ownerSettings.profileSaved
    } catch {
      return
    }
  }

  const handleCompanySubmit = async (): Promise<void> => {
    companySuccess.value = ''
    profileSuccess.value = ''
    resetCompanyError()

    try {
      await executeCompany(
        () =>
          updateOwnerCompany({
            name: form.companyName.trim(),
          }),
        (error) => getSafeErrorMessage(error, messages.value.ownerSettings.saveError),
      )

      const profile = await getOwnerProfile()
      applyUpdatedProfile(profile)
      companySuccess.value = messages.value.ownerSettings.companySaved
    } catch {
      return
    }
  }

  return {
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
    setCompanyName: (value: string) => {
      form.companyName = value
    },
    setLocale,
    setProfileLanguage: (value: Locale) => {
      form.profileLanguage = value
    },
    setProfileName: (value: string) => {
      form.profileName = value
    },
    setTheme,
    theme,
  }
}
