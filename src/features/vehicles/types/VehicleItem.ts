export interface VehicleItem {
  id: number
  name: string
  license_plate: string
  is_active: boolean
  brand: string | null
  model: string | null
  production_year: number | null
  capacity: number | null
  tracker_id: number | null
}
