import type { OwnerUser } from '@shared/types'

export interface OwnerAuthResponse {
  access_token: string
  owner: OwnerUser
}
