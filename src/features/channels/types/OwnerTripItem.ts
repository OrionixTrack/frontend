export interface OwnerTripItem {
  id: number
  name: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  finishAddress?: string
}
