let isLogoutRedirectInFlight = false

export const logoutAndRedirect = (logout: () => void): void => {
  if (isLogoutRedirectInFlight) {
    return
  }

  isLogoutRedirectInFlight = true
  logout()
  window.location.replace('/login')
}
