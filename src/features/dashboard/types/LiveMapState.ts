import type { MapVehicleItem } from './MapVehicleItem'

export interface LiveMapState {
  isLoading: boolean
  error: string
  items: MapVehicleItem[]
  hasLoaded: boolean
}
