import { useRouter } from 'vue-router'

import { useSessionStore } from '@core/stores/session'
import { useDashboard } from '@features/dashboard/composables/useDashboard'
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

  const handleLogout = async (): Promise<void> => {
    resetDashboardState()
    logout()
    await router.replace({ name: 'login' })
  }

  return {
    session,
    dashboardState,
    activeProfile,
    locale,
    messages,
    theme,
    handleLogout,
    setLocale,
    setTheme,
  }
}
