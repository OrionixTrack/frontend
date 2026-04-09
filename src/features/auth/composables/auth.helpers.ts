import type { DispatcherAuthResponse, DriverAuthResponse, OwnerAuthResponse } from '@features/auth/types'
import type { UserRole } from '@shared/types'

const isOwnerAuthResponse = (
  payload: OwnerAuthResponse | DispatcherAuthResponse | DriverAuthResponse,
): payload is OwnerAuthResponse => 'owner' in payload

const isDriverAuthResponse = (
  payload: DispatcherAuthResponse | DriverAuthResponse,
): payload is DriverAuthResponse => 'driver' in payload

export const normalizeAuthPayload = (
  role: UserRole,
  payload: OwnerAuthResponse | DispatcherAuthResponse | DriverAuthResponse,
): {
  accessToken: string
  role: UserRole
  user: OwnerAuthResponse['owner'] | DispatcherAuthResponse['dispatcher'] | DriverAuthResponse['driver']
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
      user: (payload as DispatcherAuthResponse).dispatcher,
    }
  }

  if (role === 'driver' && !isOwnerAuthResponse(payload) && isDriverAuthResponse(payload)) {
    return {
      accessToken: payload.access_token,
      role,
      user: payload.driver,
    }
  }

  throw new Error('Unexpected authentication response.')
}

export const getStringQuery = (value: unknown): string => (typeof value === 'string' ? value : '')

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, ms))
