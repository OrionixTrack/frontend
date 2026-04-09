import { useI18n } from '@shared/composables/useI18n'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError

const getLocalizedApiErrorMessage = (
  key: 'networkUnavailable' | 'requestFailed' | 'requestTimeout',
): string => useI18n().messages.value.errors[key]

export const getRequestFailedMessage = (): string => getLocalizedApiErrorMessage('requestFailed')

export const createNetworkUnavailableError = (): ApiError =>
  new ApiError(getLocalizedApiErrorMessage('networkUnavailable'), 0)

export const createRequestTimeoutError = (): ApiError =>
  new ApiError(getLocalizedApiErrorMessage('requestTimeout'), 0)

export const getSafeErrorMessage = (error: unknown, fallback: string): string => {
  if (isApiError(error) && error.status === 0) {
    return error.message
  }

  return fallback
}
