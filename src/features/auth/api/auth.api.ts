import { ApiError, postJson } from '@core/api'
import type {
  AcceptInvitationPayload,
  DispatcherAuthResponse,
  DriverAuthResponse,
  LoginCredentials,
  OwnerAuthResponse,
  RegisterOwnerPayload,
  RegisterOwnerResponse,
  RequestPasswordResetPayload,
  ResendVerificationPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from '@features/auth/types'

export class ResendVerificationRateLimitError extends Error {
  readonly retryAfter: number

  constructor(message: string, retryAfter: number) {
    super(message)
    this.name = 'ResendVerificationRateLimitError'
    this.retryAfter = retryAfter
  }
}

export const loginRequest = async ({
  role,
  email,
  password,
}: LoginCredentials, signal?: AbortSignal): Promise<OwnerAuthResponse | DispatcherAuthResponse> => {
  const endpoint = role === 'owner' ? '/auth/owner/login' : '/auth/dispatcher/login'

  return postJson<OwnerAuthResponse | DispatcherAuthResponse>(
    endpoint,
    {
      email,
      password,
    },
    {
      auth: false,
      signal,
    },
  )
}

export const registerOwnerRequest = async (
  payload: RegisterOwnerPayload,
  signal?: AbortSignal,
): Promise<RegisterOwnerResponse> =>
  postJson<RegisterOwnerResponse>('/auth/owner/register', payload, {
    auth: false,
    signal,
  })

export const verifyEmailRequest = async (
  payload: VerifyEmailPayload,
  signal?: AbortSignal,
): Promise<OwnerAuthResponse> =>
  postJson<OwnerAuthResponse>('/auth/verify-email', payload, {
    auth: false,
    signal,
  })

export const resendVerificationRequest = async (
  payload: ResendVerificationPayload,
  signal?: AbortSignal,
): Promise<void> => {
  await postJson<void>('/auth/resend-verification', payload, {
    auth: false,
    signal,
    mapErrorResponse: ({
      response,
      payload: errorPayload,
    }: {
      response: Response
      payload: {
        message?: string | string[]
        error?: string
        retryAfter?: number
      } | null
    }) => {
      if (response.status !== 429) {
        return null
      }

      const message = (() => {
        if (Array.isArray(errorPayload?.message)) {
          return errorPayload.message.join(', ')
        }

        if (typeof errorPayload?.message === 'string') {
          return errorPayload.message
        }

        if (typeof errorPayload?.error === 'string') {
          return errorPayload.error
        }

        return 'Too many requests'
      })()

      return new ResendVerificationRateLimitError(
        message,
        typeof errorPayload?.retryAfter === 'number' ? errorPayload.retryAfter : 60,
      )
    },
  }).catch((error: unknown) => {
    if (error instanceof ResendVerificationRateLimitError || error instanceof ApiError) {
      throw error
    }

    throw error
  })
}

export const requestPasswordReset = async (
  payload: RequestPasswordResetPayload,
  signal?: AbortSignal,
): Promise<void> => {
  const endpoint =
    payload.role === 'owner' ? '/auth/owner/forgot-password' : '/auth/dispatcher/forgot-password'

  return postJson<void>(
    endpoint,
    {
      email: payload.email,
    },
    {
      auth: false,
      signal,
    },
  )
}

export const resetPasswordRequest = async (
  payload: ResetPasswordPayload,
  signal?: AbortSignal,
): Promise<void> =>
  postJson<void>('/auth/reset-password', payload, {
    auth: false,
    signal,
  })

export const acceptInvitationRequest = async (
  payload: AcceptInvitationPayload,
  signal?: AbortSignal,
): Promise<DriverAuthResponse | DispatcherAuthResponse> =>
  postJson<DriverAuthResponse | DispatcherAuthResponse>('/auth/accept-invitation', payload, {
    auth: false,
    signal,
  })
