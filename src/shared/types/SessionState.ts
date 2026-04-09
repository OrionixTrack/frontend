import type { DriverUser } from './DriverUser'
import type { DispatcherUser } from './DispatcherUser'
import type { OwnerUser } from './OwnerUser'
import type { UserRole } from './UserRole'

export interface SessionState {
  accessToken: string | null
  role: UserRole | null
  user: OwnerUser | DispatcherUser | DriverUser | null
  initialized: boolean
}
