import { disconnectTrackingSocket } from '@shared/realtime/tracking.socket'

let isLogoutRedirectInFlight = false

export const logoutAndRedirect = (logout: () => void): void => {
  if (isLogoutRedirectInFlight) {
    return
  }

  isLogoutRedirectInFlight = true
  disconnectTrackingSocket()
  logout()
  window.setTimeout(() => {
    window.location.replace('/login')
  }, 0)
}
