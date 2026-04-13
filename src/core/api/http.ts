import { useSessionStore } from '@core/stores/session'
import { router } from '@/router'

import {
  ApiError,
  createNetworkUnavailableError,
  createRequestTimeoutError,
  getRequestFailedMessage,
} from './errors'

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

const defaultBaseUrl = 'http://localhost:3000'
const defaultTimeoutMs = 15_000

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
)

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ErrorResponsePayload {
  message?: string | string[]
  error?: string
  retryAfter?: number
}

interface RequestErrorContext {
  response: Response
  payload: ErrorResponsePayload | null
}

const buildHeaders = (token?: string | null): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

const parseErrorPayload = async (response: Response): Promise<ErrorResponsePayload | null> => {
  try {
    return (await response.json()) as ErrorResponsePayload
  } catch {
    return null
  }
}

const getErrorMessage = (payload: ErrorResponsePayload | null): string | null => {
  if (Array.isArray(payload?.message)) {
    return payload.message.join(', ')
  }

  if (typeof payload?.message === 'string') {
    return payload.message
  }

  if (typeof payload?.error === 'string') {
    return payload.error
  }

  return null
}

const buildUrl = (path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const url = new URL(`${API_BASE_URL}${path}`)

  if (!query) {
    return url.toString()
  }

  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

const createTimeoutSignal = (
  timeoutMs: number,
  signal?: AbortSignal,
): { signal: AbortSignal; cleanup: () => void } => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  return {
    signal: controller.signal,
    cleanup: () => window.clearTimeout(timeoutId),
  }
}

const handleUnauthorizedResponse = (): void => {
  const { isAuthenticated, logout } = useSessionStore()

  if (!isAuthenticated.value) {
    return
  }

  logout()

  if (router.currentRoute.value.name !== 'login') {
    void router.replace({ name: 'login' })
  }
}

const requestJson = async <TResponse>(
  path: string,
  options: {
    method?: HttpMethod
    body?: unknown
    query?: Record<string, string | number | boolean | null | undefined>
    timeoutMs?: number
    signal?: AbortSignal
    auth?: boolean
    mapErrorResponse?: (context: RequestErrorContext) => Error | null
  } = {},
): Promise<TResponse> => {
  const {
    method = 'GET',
    body,
    query,
    timeoutMs = defaultTimeoutMs,
    signal,
    auth = true,
    mapErrorResponse,
  } = options
  const { getAccessToken } = useSessionStore()
  const { signal: timeoutSignal, cleanup } = createTimeoutSignal(timeoutMs, signal)
  let response: Response

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: buildHeaders(auth ? getAccessToken() : null),
      body: body ? JSON.stringify(body) : undefined,
      signal: timeoutSignal,
    })
  } catch (error) {
    if (signal?.aborted) {
      throw error
    }

    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createRequestTimeoutError()
    }

    if (error instanceof TypeError) {
      throw createNetworkUnavailableError()
    }

    throw createNetworkUnavailableError()
  } finally {
    cleanup()
  }

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorizedResponse()
    }

    const payload = await parseErrorPayload(response)
    const mappedError = mapErrorResponse?.({ response, payload })

    if (mappedError) {
      throw mappedError
    }

    const message = getErrorMessage(payload) || getRequestFailedMessage()
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return null as TResponse
  }

  const text = await response.text()

  if (!text) {
    return null as TResponse
  }

  try {
    return JSON.parse(text) as TResponse
  } catch {
    return text as TResponse
  }
}

export const request = <TResponse>(
  path: string,
  options?: Parameters<typeof requestJson<TResponse>>[1],
): Promise<TResponse> => requestJson<TResponse>(path, options)

export const getJson = <TResponse>(
  path: string,
  options?: Omit<Parameters<typeof requestJson<TResponse>>[1], 'method' | 'body'>,
): Promise<TResponse> => requestJson<TResponse>(path, options)

export const postJson = <TResponse>(
  path: string,
  body: unknown,
  options?: Omit<Parameters<typeof requestJson<TResponse>>[1], 'method' | 'body'>,
): Promise<TResponse> =>
  requestJson<TResponse>(path, {
    method: 'POST',
    body,
    ...options,
  })

export const putJson = <TResponse>(
  path: string,
  body: unknown,
  options?: Omit<Parameters<typeof requestJson<TResponse>>[1], 'method' | 'body'>,
): Promise<TResponse> =>
  requestJson<TResponse>(path, {
    method: 'PUT',
    body,
    ...options,
  })

export const patchJson = <TResponse>(
  path: string,
  body: unknown,
  options?: Omit<Parameters<typeof requestJson<TResponse>>[1], 'method' | 'body'>,
): Promise<TResponse> =>
  requestJson<TResponse>(path, {
    method: 'PATCH',
    body,
    ...options,
  })

export const deleteJson = <TResponse>(
  path: string,
  options?: Omit<Parameters<typeof requestJson<TResponse>>[1], 'method' | 'body'>,
): Promise<TResponse> =>
  requestJson<TResponse>(path, {
    method: 'DELETE',
    ...options,
  })
