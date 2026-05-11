import { router } from '@/router'
import { disconnectTrackingSocket } from '@shared/realtime/tracking.socket'

let isLogoutRedirectInFlight = false

export const logoutAndRedirect = async (logout: () => void): Promise<void> => {
  if (isLogoutRedirectInFlight) {
    return
  }

  isLogoutRedirectInFlight = true
  disconnectTrackingSocket()
  logout()

  try {
    if (router.currentRoute.value.name !== 'login') {
      await router.replace({ name: 'login' })
    }
  } finally {
    isLogoutRedirectInFlight = false
  }
}
