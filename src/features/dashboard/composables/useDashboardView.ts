import { useRouter } from 'vue-router'

import { useSessionStore } from '@core/stores/session'
import { useDashboard } from '@features/dashboard/composables/useDashboard'
import { useOwnerLiveMap } from '@features/dashboard/composables/useOwnerLiveMap'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'

export const useDashboardView = () => {
  const router = useRouter()
  const { session, logout, updateUser } = useSessionStore()
  const { theme, setTheme } = useTheme()
  const { locale, messages, setLocale } = useI18n()
  const { dashboardState, activeProfile, resetDashboardState } = useDashboard(
    session,
    () => messages.value,
    updateUser,
  )
  const { ownerLiveMap, resetOwnerLiveMap } = useOwnerLiveMap(
    session,
    () => messages.value,
    () => (activeProfile.value && 'full_name' in activeProfile.value ? activeProfile.value : null),
  )

  const handleLogout = async (): Promise<void> => {
    resetDashboardState()
    resetOwnerLiveMap()
    logout()
    await router.replace({ name: 'login' })
  }

  return {
    session,
    dashboardState,
    ownerLiveMap,
    activeProfile,
    locale,
    messages,
    theme,
    handleLogout,
    setLocale,
    setTheme,
  }
}
