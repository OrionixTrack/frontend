import { postJson } from '@core/api'
import type { DispatcherAuthResponse, LoginCredentials, OwnerAuthResponse } from '@features/auth/types'

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
