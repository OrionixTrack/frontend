import { logoutAndRedirect } from '@core/navigation/logout'
import { useSessionStore } from '@core/stores/session'
import { useDashboard } from '@features/dashboard/composables/useDashboard'
import { useLiveMap } from '@features/dashboard/composables/useLiveMap'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'

export const useDashboardView = () => {
  const { session, logout, updateUser } = useSessionStore()
  const { theme, setTheme } = useTheme()
  const { locale, messages, setLocale } = useI18n()
  const { dashboardState, activeProfile, resetDashboardState } = useDashboard(
    session,
    () => messages.value,
    updateUser,
  )
  const { liveMap, resetLiveMap } = useLiveMap(
    session,
    () => messages.value,
    () =>
      activeProfile.value && ('full_name' in activeProfile.value || 'surname' in activeProfile.value)
        ? activeProfile.value
        : null,
  )

  const handleLogout = async (): Promise<void> => {
    resetDashboardState()
    resetLiveMap()
    logoutAndRedirect(logout)
  }

  return {
    session,
    dashboardState,
    liveMap,
    activeProfile,
    locale,
    messages,
    theme,
    handleLogout,
    setLocale,
    setTheme,
  }
}
