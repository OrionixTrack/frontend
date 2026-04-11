import { API_BASE_URL, ApiError, createNetworkUnavailableError, createRequestTimeoutError, getRequestFailedMessage, postJson } from '@core/api'
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
  const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  }).catch((error: unknown) => {
    if (signal?.aborted) {
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createRequestTimeoutError()
    }

    throw createNetworkUnavailableError()
  })

  if (response.ok) {
    return
  }

  let message = getRequestFailedMessage()
  let retryAfter = 60

  try {
    const errorPayload = (await response.json()) as {
      message?: string | string[]
      error?: string
      retryAfter?: number
    }

    if (Array.isArray(errorPayload.message)) {
      message = errorPayload.message.join(', ')
    } else if (typeof errorPayload.message === 'string') {
      message = errorPayload.message
    } else if (typeof errorPayload.error === 'string') {
      message = errorPayload.error
    }

    if (typeof errorPayload.retryAfter === 'number') {
      retryAfter = errorPayload.retryAfter
    }
  } catch {}

  if (response.status === 429) {
    throw new ResendVerificationRateLimitError(message, retryAfter)
  }

  throw new ApiError(message, response.status)
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
