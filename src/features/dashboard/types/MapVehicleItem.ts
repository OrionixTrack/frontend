import type { MapVehicleActiveTrip } from './MapVehicleActiveTrip'
import type { MapVehiclePosition } from './MapVehiclePosition'

export interface MapVehicleItem {
  vehicleId: number
  vehicleName: string
  licensePlate: string
  activeTrip?: MapVehicleActiveTrip | null
  position?: MapVehiclePosition | null
}
