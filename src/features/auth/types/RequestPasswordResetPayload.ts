import type { UserRole } from '@shared/types'

export interface RequestPasswordResetPayload {
  role: UserRole
  email: string
}
