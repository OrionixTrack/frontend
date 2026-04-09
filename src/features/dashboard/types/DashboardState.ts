import type { DispatcherUser } from '@shared/types'
import type { OwnerUser } from '@shared/types'

import type { StatItem } from './StatItem'
import type { TripResponse } from './TripResponse'

export interface DashboardState {
  isLoading: boolean
  error: string
  profile: OwnerUser | DispatcherUser | null
  stats: StatItem[]
  trips: TripResponse[]
}
