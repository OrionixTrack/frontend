import type { EmployeeSortBy } from './EmployeeSortBy'
import type { EmployeeSortOrder } from './EmployeeSortOrder'

export interface EmployeeListParams {
  limit?: number
  offset?: number
  sortOrder?: EmployeeSortOrder
  search?: string
  sortBy?: EmployeeSortBy
}
