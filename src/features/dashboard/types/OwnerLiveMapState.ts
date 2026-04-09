import type { MapVehicleItem } from './MapVehicleItem'

export interface OwnerLiveMapState {
  isLoading: boolean
  error: string
  items: MapVehicleItem[]
  hasLoaded: boolean
}
