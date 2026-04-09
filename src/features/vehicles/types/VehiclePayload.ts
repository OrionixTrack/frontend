export interface VehiclePayload {
  name: string
  license_plate: string
  is_active: boolean
  brand?: string
  model?: string
  production_year?: number
  capacity?: number
}
