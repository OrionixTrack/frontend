import type { DispatcherAuthResponse, OwnerAuthResponse } from '@features/auth/types'
import type { UserRole } from '@shared/types'

const isOwnerAuthResponse = (
  payload: OwnerAuthResponse | DispatcherAuthResponse,
): payload is OwnerAuthResponse => 'owner' in payload

export const normalizeAuthPayload = (
  role: UserRole,
  payload: OwnerAuthResponse | DispatcherAuthResponse,
): {
  accessToken: string
  role: UserRole
  user: OwnerAuthResponse['owner'] | DispatcherAuthResponse['dispatcher']
} => {
  if (role === 'owner' && isOwnerAuthResponse(payload)) {
    return {
      accessToken: payload.access_token,
      role,
      user: payload.owner,
    }
  }

  if (role === 'dispatcher' && !isOwnerAuthResponse(payload)) {
    return {
      accessToken: payload.access_token,
      role,
      user: payload.dispatcher,
    }
  }

  throw new Error('Unexpected authentication response.')
}

export const getStringQuery = (value: unknown): string => (typeof value === 'string' ? value : '')

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, ms))
