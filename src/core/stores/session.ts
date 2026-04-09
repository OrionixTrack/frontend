import { computed, reactive, readonly, type ComputedRef } from 'vue'

import type { DispatcherUser, DriverUser, OwnerUser, SessionState, UserRole } from '@shared/types'

type SessionUser = OwnerUser | DispatcherUser | DriverUser
const STORAGE_KEY = 'orionixtrack.session'

interface PersistedSession {
  accessToken: string
  role: UserRole
  user: SessionUser
}

interface SessionStore {
  session: Readonly<SessionState>
  isAuthenticated: ComputedRef<boolean>
  restore: () => void
  logout: () => void
  updateUser: (user: SessionUser) => void
  setSession: (payload: {
    accessToken: string
    role: UserRole
    user: SessionUser
  }) => void
  getAccessToken: () => string | null
}

const createSessionStore = (): SessionStore => {
  const state = reactive<SessionState>({
    accessToken: null,
    role: null,
    user: null,
    initialized: false,
  })

  const persistSession = (): void => {
    if (!state.accessToken || !state.role || !state.user) {
      sessionStorage.removeItem(STORAGE_KEY)
      return
    }

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: state.accessToken,
        role: state.role,
        user: state.user,
      } satisfies PersistedSession),
    )
  }

  const setSession = ({
    accessToken,
    role,
    user,
  }: {
    accessToken: string
    role: UserRole
    user: SessionUser
  }): void => {
    state.accessToken = accessToken
    state.role = role
    state.user = user
    persistSession()
  }

  const updateUser = (user: SessionUser): void => {
    state.user = user
    persistSession()
  }

  const logout = (): void => {
    state.accessToken = null
    state.role = null
    state.user = null
    persistSession()
  }

  const restore = (): void => {
    if (state.initialized) {
      return
    }

    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<PersistedSession>

        if (
          typeof parsed.accessToken === 'string' &&
          (parsed.role === 'owner' || parsed.role === 'dispatcher' || parsed.role === 'driver') &&
          parsed.user
        ) {
          state.accessToken = parsed.accessToken
          state.role = parsed.role
          state.user = parsed.user
        }
      } catch {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }

    state.initialized = true
  }

  return {
    session: readonly(state) as Readonly<SessionState>,
    isAuthenticated: computed(() => Boolean(state.accessToken && state.role && state.user)),
    restore,
    logout,
    updateUser,
    setSession,
    getAccessToken: () => state.accessToken,
  }
}

const sessionStore = createSessionStore()

export const useSessionStore = (): SessionStore => sessionStore
