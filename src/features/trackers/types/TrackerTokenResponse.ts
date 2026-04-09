import type { TrackerItem } from '@features/vehicles/types/TrackerItem'

export interface TrackerTokenResponse extends TrackerItem {
  device_secret_token?: string
}
