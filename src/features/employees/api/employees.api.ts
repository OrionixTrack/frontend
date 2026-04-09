import { deleteJson, getJson, putJson } from '@core/api'

import type { EmployeeItem } from '../types/EmployeeItem'
import type { EmployeeListParams } from '../types/EmployeeListParams'
import type { EmployeeType } from '../types/EmployeeType'

const employeeEndpointByType: Record<EmployeeType, string> = {
  driver: '/owner/employees/drivers',
  dispatcher: '/owner/employees/dispatchers',
}

export const getEmployees = (
  type: EmployeeType,
  params: EmployeeListParams,
  signal?: AbortSignal,
): Promise<EmployeeItem[]> =>
  getJson<EmployeeItem[]>(employeeEndpointByType[type], {
    query: params,
    signal,
  })

export const updateEmployee = (
  type: EmployeeType,
  employeeId: number,
  payload: Pick<EmployeeItem, 'name' | 'surname'>,
  signal?: AbortSignal,
): Promise<EmployeeItem> =>
  putJson<EmployeeItem>(`${employeeEndpointByType[type]}/${employeeId}`, payload, { signal })

export const deleteEmployee = (
  type: EmployeeType,
  employeeId: number,
  signal?: AbortSignal,
): Promise<null> => deleteJson<null>(`${employeeEndpointByType[type]}/${employeeId}`, { signal })
