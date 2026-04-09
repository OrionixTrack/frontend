import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useSessionStore } from '@core/stores/session'
import { AUTH_ERROR_CODES, createAuthActions } from '@features/auth/composables/auth.actions'
import { getStringQuery } from '@features/auth/composables/auth.helpers'
import {
  AUTH_ROUTE_TO_MODE,
  createAuthUi,
  createHelperLinks,
  createResendCooldownMessage,
  createRoleOptions,
  getAuthHeading,
} from '@features/auth/composables/auth.presentation'
import { useResendCooldown } from '@features/auth/composables/useResendCooldown'
import type { AuthFormState, AuthMode } from '@features/auth/types'
import { useApiState } from '@shared/composables/useApiState'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'
import type { Locale } from '@shared/i18n/translations'
import type { UserRole } from '@shared/types'

export const useAuthView = () => {
  const route = useRoute()
  const router = useRouter()
  const sessionStore = useSessionStore()
  const { theme, setTheme } = useTheme()
  const { locale, messages, setLocale } = useI18n()
  const { isLoading: isSubmitting, error: authError, execute, resetError } = useApiState('')
  const { resendCooldownSeconds, startResendCooldown } = useResendCooldown()
  const authSuccess = ref('')
  const authInfo = ref('')
  const lastAutoVerificationToken = ref('')
  const unverifiedOwnerEmail = ref('')
  const form = ref<AuthFormState>({
    role: 'owner',
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    name: '',
    surname: '',
    newPassword: '',
    language: locale.value,
  })

  const mode = computed<AuthMode>(() => AUTH_ROUTE_TO_MODE[String(route.name)] || 'login')
  const token = computed(() => getStringQuery(route.query.token).trim())
  const hasToken = computed(() => token.value.length > 0)
  const redirectTarget = computed(() => getStringQuery(route.query.redirect))
  const resendTargetEmail = computed(() => unverifiedOwnerEmail.value || form.value.email.trim())

  const syncFormWithRoute = (): void => {
    const role = getStringQuery(route.query.role)
    const email = getStringQuery(route.query.email)
    const routeLocale = getStringQuery(route.query.language)

    if (role === 'owner' || role === 'dispatcher') {
      form.value.role = role
    }

    form.value.email = email || form.value.email

    if (email) {
      unverifiedOwnerEmail.value = email
    } else if (mode.value !== 'login') {
      unverifiedOwnerEmail.value = ''
    }

    if (routeLocale === 'uk' || routeLocale === 'en') {
      setLocale(routeLocale)
    }

    form.value.language = locale.value
    authSuccess.value = ''
    authInfo.value = ''
    resetError()
  }

  watch(
    () => route.fullPath,
    syncFormWithRoute,
    { immediate: true },
  )

  watch(locale, (value) => {
    form.value.language = value
  })

  const roleOptions = computed(() => createRoleOptions(messages.value))
  const authHeading = computed(() => getAuthHeading(messages.value, mode.value, form.value.role))
  const authUi = computed(() => createAuthUi(messages.value, mode.value, authHeading.value))
  const localizedAuthError = computed(() => {
    switch (authError.value) {
      case AUTH_ERROR_CODES.acceptInvitationExpired:
        return messages.value.auth.acceptInvitationExpired
      case AUTH_ERROR_CODES.acceptInvitationInvalid:
        return messages.value.auth.acceptInvitationInvalid
      case AUTH_ERROR_CODES.acceptInvitationUsed:
        return messages.value.auth.acceptInvitationUsed
      case AUTH_ERROR_CODES.emailNotVerified:
        return messages.value.auth.emailNotVerified
      case AUTH_ERROR_CODES.invalidCredentials:
        return messages.value.auth.invalidCredentials
      case AUTH_ERROR_CODES.signInError:
        return messages.value.auth.signInError
      case AUTH_ERROR_CODES.resendTooSoon:
        return messages.value.auth.resendTooSoon
      case AUTH_ERROR_CODES.verifyEmailError:
        return messages.value.auth.verifyEmailError
      case AUTH_ERROR_CODES.verifyEmailInvalid:
        return messages.value.auth.verifyEmailInvalid
      default:
        return authError.value
    }
  })
  const resendCooldownMessage = computed(() =>
    createResendCooldownMessage(messages.value, resendCooldownSeconds.value),
  )
  const hasAcceptInvitationErrorState = computed(
    () =>
      mode.value === 'accept-invitation' &&
      [
        AUTH_ERROR_CODES.acceptInvitationExpired,
        AUTH_ERROR_CODES.acceptInvitationInvalid,
        AUTH_ERROR_CODES.acceptInvitationUsed,
      ].includes(authError.value as (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES]),
  )
  const helperLinks = computed(() =>
    createHelperLinks({
      authError: localizedAuthError.value,
      messages: messages.value,
      mode: mode.value,
      resendTargetEmail: resendTargetEmail.value,
      role: form.value.role,
      unverifiedOwnerEmail: unverifiedOwnerEmail.value,
    }),
  )

  const { handleSubmit } = createAuthActions({
    authSuccess,
    authInfo,
    authUi,
    execute,
    form,
    hasToken,
    messages,
    mode,
    redirectTarget,
    resendCooldownSeconds,
    resendTargetEmail,
    router,
    sessionStore,
    startResendCooldown,
    token,
    unverifiedOwnerEmail,
  })

  watch(
    [mode, token],
    async ([currentMode, currentToken]) => {
      if (
        currentMode === 'verify-email' &&
        currentToken &&
        currentToken !== lastAutoVerificationToken.value
      ) {
        lastAutoVerificationToken.value = currentToken
        await handleSubmit()
      }
    },
    { immediate: true },
  )

  const setLocaleAndLanguage = (value: Locale): void => {
    setLocale(value)
    form.value.language = value
  }

  const showPrimaryAction = computed(() => mode.value === 'check-email' || mode.value === 'verify-email')
  const isSubmitDisabled = computed(() => {
    if (mode.value === 'resend-verification') {
      return isSubmitting.value || resendCooldownSeconds.value > 0
    }

    return isSubmitting.value
  })

  const isPrimaryActionDisabled = computed(() => {
    if (mode.value === 'check-email') {
      return isSubmitting.value || resendCooldownSeconds.value > 0 || !resendTargetEmail.value
    }

    if (mode.value === 'verify-email') {
      return true
    }

    return isSubmitting.value
  })

  return {
    authError: localizedAuthError,
    authInfo,
    authSuccess,
    authHeading,
    authUi,
    form,
    hasToken,
    helperLinks,
    hasAcceptInvitationErrorState,
    isPrimaryActionDisabled,
    isSubmitDisabled,
    isSubmitting,
    locale,
    mode,
    resendCooldownMessage,
    roleOptions,
    showPrimaryAction,
    theme,
    handleSubmit,
    setRole: (role: UserRole) => {
      form.value.role = role
    },
    setLocale: setLocaleAndLanguage,
    setTheme,
    setEmail: (email: string) => {
      form.value.email = email
    },
    setPassword: (password: string) => {
      form.value.password = password
    },
    setFullName: (fullName: string) => {
      form.value.fullName = fullName
    },
    setCompanyName: (companyName: string) => {
      form.value.companyName = companyName
    },
    setName: (name: string) => {
      form.value.name = name
    },
    setSurname: (surname: string) => {
      form.value.surname = surname
    },
    setNewPassword: (newPassword: string) => {
      form.value.newPassword = newPassword
    },
  }
}
