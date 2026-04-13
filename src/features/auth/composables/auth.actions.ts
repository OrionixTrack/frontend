import type { ComputedRef, Ref } from 'vue'
import type { Router } from 'vue-router'

import {
  createStatusRule,
  getSafeErrorMessage,
  hasApiErrorMessage,
  isApiError,
  mapApiErrorMessage,
} from '@core/api'
import { useSessionStore } from '@core/stores/session'
import {
  ResendVerificationRateLimitError,
  acceptInvitationRequest,
  loginRequest,
  registerOwnerRequest,
  requestPasswordReset,
  resendVerificationRequest,
  resetPasswordRequest,
  verifyEmailRequest,
} from '@features/auth/api/auth.api'
import { normalizeAuthPayload, wait } from '@features/auth/composables/auth.helpers'
import type {
  AuthFormState,
  AuthMode,
  AuthScreenUi,
  DispatcherAuthResponse,
  DriverAuthResponse,
  OwnerAuthResponse,
} from '@features/auth/types'
import type { TranslationDictionary } from '@shared/i18n/translations'

export const AUTH_ERROR_CODES = {
  acceptInvitationExpired: 'auth.acceptInvitationExpired',
  acceptInvitationInvalid: 'auth.acceptInvitationInvalid',
  acceptInvitationUsed: 'auth.acceptInvitationUsed',
  emailNotVerified: 'auth.emailNotVerified',
  invalidCredentials: 'auth.invalidCredentials',
  signInError: 'auth.signInError',
  resendTooSoon: 'auth.resendTooSoon',
  verifyEmailError: 'auth.verifyEmailError',
  verifyEmailInvalid: 'auth.verifyEmailInvalid',
} as const

interface ApiStateExecutor {
  <TResult>(
    operation: () => Promise<TResult>,
    mapError: (error: unknown) => string,
  ): Promise<TResult>
}

interface CreateAuthActionsArgs {
  authSuccess: Ref<string>
  authInfo: Ref<string>
  authUi: ComputedRef<AuthScreenUi>
  execute: ApiStateExecutor
  form: Ref<AuthFormState>
  hasToken: ComputedRef<boolean>
  messages: ComputedRef<TranslationDictionary>
  mode: ComputedRef<AuthMode>
  redirectTarget: ComputedRef<string>
  resendCooldownSeconds: Ref<number>
  resendTargetEmail: ComputedRef<string>
  router: Router
  sessionStore: ReturnType<typeof useSessionStore>
  startResendCooldown: (seconds: number) => void
  token: ComputedRef<string>
  unverifiedOwnerEmail: Ref<string>
}

export const createAuthActions = ({
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
}: CreateAuthActionsArgs) => {
  const handleVerificationError = (error: unknown): string => {
    if (isApiError(error) && error.status === 400) {
      return AUTH_ERROR_CODES.verifyEmailInvalid
    }

    return getSafeErrorMessage(error, AUTH_ERROR_CODES.verifyEmailError)
  }

  const handleResendError = (error: unknown): string => {
    if (error instanceof ResendVerificationRateLimitError) {
      startResendCooldown(error.retryAfter)
      return AUTH_ERROR_CODES.resendTooSoon
    }

    return getSafeErrorMessage(error, AUTH_ERROR_CODES.verifyEmailError)
  }

  const resendVerification = async (email: string, signal: AbortSignal): Promise<void> => {
    await execute(
      () => resendVerificationRequest({ email }, signal),
      handleResendError,
    )
    unverifiedOwnerEmail.value = email
    authSuccess.value = authUi.value.successMessage
  }

  const submitCurrentMode = async (): Promise<void> => {
    authSuccess.value = ''
    authInfo.value = ''
    const controller = new AbortController()

    switch (mode.value) {
      case 'register': {
        const payload = await execute(
          () =>
            registerOwnerRequest(
              {
                full_name: form.value.fullName.trim(),
                email: form.value.email.trim(),
                password: form.value.password,
                company_name: form.value.companyName.trim(),
                language: form.value.language,
              },
              controller.signal,
            ),
          (error) => getSafeErrorMessage(error, AUTH_ERROR_CODES.signInError),
        )

        unverifiedOwnerEmail.value = payload.email
        form.value.password = ''
        await router.replace({
          name: 'check-email',
          query: {
            email: payload.email,
            language: payload.language,
          },
        })
        return
      }
      case 'check-email': {
        if (!resendTargetEmail.value || resendCooldownSeconds.value > 0) {
          return
        }

        await resendVerification(resendTargetEmail.value, controller.signal)
        return
      }
      case 'verify-email': {
        if (!hasToken.value) {
          throw new Error(authUi.value.tokenRequired)
        }

        authInfo.value = messages.value.auth.verifyEmailLoading

        const payload = await execute(
          () => verifyEmailRequest({ token: token.value }, controller.signal),
          handleVerificationError,
        )

        authInfo.value = ''
        authSuccess.value = messages.value.auth.verifyEmailSuccess
        sessionStore.setSession({
          accessToken: payload.access_token,
          role: 'owner',
          user: payload.owner,
        })
        form.value.password = ''
        form.value.newPassword = ''
        await wait(700)
        await router.replace({ name: 'dashboard' })
        return
      }
      case 'resend-verification': {
        if (resendCooldownSeconds.value > 0) {
          return
        }

        await resendVerification(form.value.email.trim(), controller.signal)
        return
      }
      case 'forgot-password': {
        await execute(
          () =>
            requestPasswordReset(
              {
                role: form.value.role,
                email: form.value.email.trim(),
              },
              controller.signal,
            ),
          (error) => getSafeErrorMessage(error, AUTH_ERROR_CODES.signInError),
        )
        authSuccess.value = authUi.value.successMessage
        return
      }
      case 'reset-password': {
        if (!hasToken.value) {
          throw new Error(authUi.value.tokenRequired)
        }

        await execute(
          () =>
            resetPasswordRequest(
              {
                token: token.value,
                new_password: form.value.newPassword,
              },
              controller.signal,
            ),
          (error) => getSafeErrorMessage(error, AUTH_ERROR_CODES.signInError),
        )
        form.value.password = ''
        form.value.newPassword = ''
        authSuccess.value = authUi.value.successMessage
        return
      }
      case 'accept-invitation': {
        if (!hasToken.value) {
          throw new Error(authUi.value.tokenRequired)
        }

        const payload = await execute(
          () =>
            acceptInvitationRequest(
              {
                token: token.value,
                name: form.value.name.trim(),
                surname: form.value.surname.trim(),
                password: form.value.password,
                language: form.value.language,
              },
              controller.signal,
            ),
          (error) =>
            mapApiErrorMessage(error, AUTH_ERROR_CODES.signInError, [
              createStatusRule(
                400,
                AUTH_ERROR_CODES.acceptInvitationExpired,
                (apiError) => hasApiErrorMessage(apiError, [/expired/i]),
              ),
              createStatusRule(
                400,
                AUTH_ERROR_CODES.acceptInvitationUsed,
                (apiError) => hasApiErrorMessage(apiError, [/no longer valid/i, /already/i]),
              ),
              createStatusRule(400, AUTH_ERROR_CODES.acceptInvitationInvalid),
            ]),
        )
        form.value.password = ''
        const normalizedPayload =
          'dispatcher' in payload
            ? normalizeAuthPayload('dispatcher', payload)
            : normalizeAuthPayload('driver', payload as DriverAuthResponse)
        sessionStore.setSession(normalizedPayload)
        authSuccess.value = authUi.value.successMessage
        await wait(700)
        await router.replace({ name: 'dashboard' })
        return
      }
      default: {
        let payload: OwnerAuthResponse | DispatcherAuthResponse

        try {
          payload = await execute(
            () =>
              loginRequest(
                {
                  role: form.value.role,
                  email: form.value.email.trim(),
                  password: form.value.password,
                },
                controller.signal,
              ),
            (error) => {
              if (form.value.role === 'owner' && isApiError(error) && error.status === 403) {
                return AUTH_ERROR_CODES.emailNotVerified
              }

              if (isApiError(error) && error.status === 401) {
                return AUTH_ERROR_CODES.invalidCredentials
              }

              return getSafeErrorMessage(error, AUTH_ERROR_CODES.signInError)
            },
          )
        } catch (error) {
          if (form.value.role === 'owner' && isApiError(error) && error.status === 403) {
            unverifiedOwnerEmail.value = form.value.email.trim()
          }

          throw error
        }

        sessionStore.setSession(normalizeAuthPayload(form.value.role, payload))
        unverifiedOwnerEmail.value = ''
        form.value.password = ''
        form.value.newPassword = ''
        await router.replace(redirectTarget.value || { name: 'dashboard' })
      }
    }
  }

  const handleSubmit = async (): Promise<void> => {
    try {
      await submitCurrentMode()
    } catch (error) {
      authInfo.value = ''

      if (error instanceof Error && error.message === authUi.value.tokenRequired) {
        authSuccess.value = ''
      }
    }
  }

  return {
    handleSubmit,
  }
}
