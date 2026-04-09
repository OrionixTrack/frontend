import { getJson, putJson } from '@core/api'
import type { OwnerUser } from '@shared/types'

export interface UpdateOwnerProfilePayload {
  full_name?: string
  language?: 'en' | 'uk'
}

export interface UpdateCompanyPayload {
  name: string
}

export const getOwnerProfile = (signal?: AbortSignal): Promise<OwnerUser> =>
  getJson<OwnerUser>('/owner/profile', { signal })

export const updateOwnerProfile = (
  payload: UpdateOwnerProfilePayload,
  signal?: AbortSignal,
): Promise<OwnerUser> =>
  putJson<OwnerUser>('/profile/owner', payload, { signal })

export const updateOwnerCompany = (
  payload: UpdateCompanyPayload,
  signal?: AbortSignal,
): Promise<OwnerUser> =>
  putJson<OwnerUser>('/owner/company', payload, { signal })
