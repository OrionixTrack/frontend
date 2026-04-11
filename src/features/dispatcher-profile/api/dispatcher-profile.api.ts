import { getJson, putJson } from '@core/api'
import type { DispatcherUser } from '@shared/types'

export const getDispatcherProfile = (signal?: AbortSignal): Promise<DispatcherUser> =>
  getJson<DispatcherUser>('/dispatcher/profile', { signal })

export const updateDispatcherProfile = (
  payload: {
    name: string
    surname: string
  },
  signal?: AbortSignal,
): Promise<void> =>
  putJson<void>('/profile/dispatcher', payload, { signal })
