import type { DriverUser } from '@shared/types'

export interface DriverAuthResponse {
  access_token: string
  driver: DriverUser
}
