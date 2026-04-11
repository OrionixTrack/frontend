import { deleteJson, getJson, putJson } from '@core/api'

import type { EmployeeItem } from '../types/EmployeeItem'
import type { EmployeeListParams } from '../types/EmployeeListParams'
import type { EmployeeType } from '../types/EmployeeType'

export type EmployeeApiScope = 'owner' | 'dispatcher'

const ownerEmployeeEndpointByType: Record<EmployeeType, string> = {
  driver: '/owner/employees/drivers',
  dispatcher: '/owner/employees/dispatchers',
}

const getEmployeeDirectoryEndpoint = (
  type: EmployeeType,
  scope: EmployeeApiScope,
): string => {
  if (scope === 'dispatcher') {
    if (type === 'driver') {
      return '/dispatcher/drivers'
    }

    throw new Error(`Unsupported dispatcher employee directory type: ${type}`)
  }

  return ownerEmployeeEndpointByType[type]
}

export const getEmployees = (
  type: EmployeeType,
  params: EmployeeListParams,
  signal?: AbortSignal,
  scope: EmployeeApiScope = 'owner',
): Promise<EmployeeItem[]> =>
  getJson<EmployeeItem[]>(getEmployeeDirectoryEndpoint(type, scope), {
    query: params,
    signal,
  })

export const updateEmployee = (
  type: EmployeeType,
  employeeId: number,
  payload: Pick<EmployeeItem, 'name' | 'surname'>,
  signal?: AbortSignal,
): Promise<EmployeeItem> =>
  putJson<EmployeeItem>(`${ownerEmployeeEndpointByType[type]}/${employeeId}`, payload, { signal })

export const deleteEmployee = (
  type: EmployeeType,
  employeeId: number,
  signal?: AbortSignal,
): Promise<null> => deleteJson<null>(`${ownerEmployeeEndpointByType[type]}/${employeeId}`, { signal })
