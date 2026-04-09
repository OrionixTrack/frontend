import type { UserRole } from '@shared/types'

export interface LoginCredentials {
  role: UserRole
  email: string
  password: string
}
