import type { RouteLocationNormalized } from 'vue-router'

import { useSessionStore } from '@core/stores/session'
import type { UserRole } from '@shared/types'

export const applyRouteGuards = (to: RouteLocationNormalized) => {
  const { isAuthenticated, session } = useSessionStore()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && isAuthenticated.value) {
    return { name: 'dashboard' }
  }

  const allowedRoles = to.meta.roles as UserRole[] | undefined

  if (allowedRoles?.length && (!session.role || !allowedRoles.includes(session.role))) {
    return { name: 'dashboard' }
  }

  return true
}
