import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useSessionStore } from '@core/stores/session'
import { loginRequest } from '@features/auth/api/auth.api'
import type { AuthScreenUi, DispatcherAuthResponse, LoginCredentials, OwnerAuthResponse } from '@features/auth/types'
import type { RoleOption } from '@features/auth/types/RoleOption'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import type { UserRole } from '@shared/types'

const isOwnerAuthResponse = (
  payload: OwnerAuthResponse | DispatcherAuthResponse,
): payload is OwnerAuthResponse => 'owner' in payload

const normalizeAuthPayload = (
  role: UserRole,
  payload: OwnerAuthResponse | DispatcherAuthResponse,
): {
  accessToken: string
  role: UserRole
  user: OwnerAuthResponse['owner'] | DispatcherAuthResponse['dispatcher']
} => {
  if (role === 'owner' && isOwnerAuthResponse(payload)) {
    const ownerPayload = payload

    return {
      accessToken: ownerPayload.access_token,
      role,
      user: ownerPayload.owner,
    }
  }

  if (role === 'dispatcher' && !isOwnerAuthResponse(payload)) {
    const dispatcherPayload = payload

    return {
      accessToken: dispatcherPayload.access_token,
      role,
      user: dispatcherPayload.dispatcher,
    }
  }

  throw new Error('Unexpected authentication response.')
}

export const useAuthView = () => {
  const router = useRouter()
  const { setSession } = useSessionStore()
  const { theme, setTheme } = useTheme()
  const { locale, messages, setLocale } = useI18n()
  const { isLoading: isSubmitting, error: authError, execute } = useApiState('')
  const credentials = ref<LoginCredentials>({
    role: 'owner' as UserRole,
    email: '',
    password: '',
  })

  const roleOptions = computed<RoleOption[]>(() => [
    {
      value: 'owner',
      label: messages.value.auth.roleOwner,
      description: messages.value.auth.ownerDescription,
    },
    {
      value: 'dispatcher',
      label: messages.value.auth.roleDispatcher,
      description: messages.value.auth.dispatcherDescription,
    },
  ])

  const authHeading = computed(() =>
    credentials.value.role === 'owner'
      ? messages.value.auth.signInOwner
      : messages.value.auth.signInDispatcher,
  )

  const authUi = computed<AuthScreenUi>(() => ({
    appName: messages.value.auth.appName,
    loginTitle: messages.value.auth.loginTitle,
    heroTitle: messages.value.auth.heroTitle,
    heroDescription: messages.value.auth.heroDescription,
    email: messages.value.auth.email,
    password: messages.value.auth.password,
    signIn: messages.value.auth.signIn,
    signingIn: messages.value.auth.signingIn,
  }))

  const handleLogin = async (): Promise<void> => {
    const controller = new AbortController()

    try {
      const payload = await execute(
        () => loginRequest(credentials.value, controller.signal),
        (error) => (error instanceof Error ? error.message : messages.value.auth.signInError),
      )

      setSession(normalizeAuthPayload(credentials.value.role, payload))
      setPassword('')
      await router.replace({ name: 'dashboard' })
    } catch {
      return
    }
  }

  const setEmail = (email: string): void => {
    credentials.value.email = email
  }

  const setPassword = (password: string): void => {
    credentials.value.password = password
  }

  const setRole = (role: UserRole): void => {
    credentials.value.role = role
  }

  return {
    authError,
    isSubmitting,
    credentials,
    roleOptions,
    authHeading,
    authUi,
    locale,
    theme,
    setRole,
    setLocale,
    setTheme,
    setEmail,
    setPassword,
    handleLogin,
  }
}
