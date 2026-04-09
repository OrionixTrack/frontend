import type { DispatcherUser } from '@shared/types'

export interface DispatcherAuthResponse {
  access_token: string
  dispatcher: DispatcherUser
}
