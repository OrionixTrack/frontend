import type { OwnerStatsResponse, StatItem, TripResponse } from '@features/dashboard/types'
import type {
  DispatcherUser,
  DriverUser,
  OwnerUser,
  UserRole,
} from '@shared/types'
import {
  getRoleLabel as getLocalizedRoleLabel,
  type Locale,
  type TranslationDictionary,
  translations,
} from '@shared/i18n/translations'

export interface NavigationItem {
  id: string
  label: string
  routeName: string | null
}

export interface NavigationGroup {
  title: string
  items: NavigationItem[]
}

export const formatOwnerStats = (
  payload: OwnerStatsResponse | null,
  t: TranslationDictionary,
): StatItem[] => [
  { label: t.dashboard.drivers, value: String(payload?.driversCount ?? 0), tone: 'info' },
  {
    label: t.dashboard.dispatchers,
    value: String(payload?.dispatchersCount ?? 0),
    tone: 'neutral',
  },
  { label: t.dashboard.vehicles, value: String(payload?.vehiclesCount ?? 0), tone: 'success' },
  { label: t.dashboard.trackers, value: String(payload?.trackersCount ?? 0), tone: 'warning' },
]

export const formatDispatcherStats = (
  trips: TripResponse[],
  t: TranslationDictionary,
): StatItem[] => {
  const safeTrips = Array.isArray(trips) ? trips : []

  return [
    {
      label: t.dashboard.plannedTrips,
      value: String(safeTrips.filter((trip) => trip.status === 'planned').length),
      tone: 'neutral',
    },
    {
      label: t.dashboard.inProgress,
      value: String(safeTrips.filter((trip) => trip.status === 'in_progress').length),
      tone: 'info',
    },
    {
      label: t.dashboard.completed,
      value: String(safeTrips.filter((trip) => trip.status === 'completed').length),
      tone: 'success',
    },
    {
      label: t.dashboard.cancelled,
      value: String(safeTrips.filter((trip) => trip.status === 'cancelled').length),
      tone: 'warning',
    },
  ]
}

const isOwnerUser = (profile: OwnerUser | DispatcherUser | DriverUser): profile is OwnerUser =>
  'full_name' in profile

const isEmployeeUser = (profile: OwnerUser | DispatcherUser | DriverUser): profile is DispatcherUser | DriverUser =>
  'name' in profile && 'surname' in profile

export const getRoleLabel = (locale: Locale, role: UserRole | null): string =>
  role ? getLocalizedRoleLabel(locale, role) : ''

export const getUserDisplayName = (
  role: UserRole | null,
  profile: OwnerUser | DispatcherUser | DriverUser | null,
): string => {
  if (!profile) {
    return ''
  }

  if (role === 'owner' && isOwnerUser(profile)) {
    return profile.full_name
  }

  if (isEmployeeUser(profile)) {
    return `${profile.name} ${profile.surname}`.trim()
  }

  return ''
}

export const getRoleNavigation = (
  locale: Locale,
  role: UserRole | null,
): NavigationGroup[] => {
  const t = translations[locale]

  return role === 'owner'
    ? [
        {
          title: '',
          items: [
            { id: 'overview', label: t.common.overview, routeName: 'dashboard' },
            { id: 'company', label: t.dashboard.ownerCompany, routeName: 'owner-settings' },
            { id: 'invitations', label: t.invitations.pageTitle, routeName: 'owner-invitations' },
            { id: 'employees', label: t.dashboard.ownerEmployees, routeName: 'owner-employees' },
            { id: 'fleet', label: t.dashboard.ownerFleet, routeName: 'owner-vehicles' },
            { id: 'trackers', label: t.dashboard.ownerTrackers, routeName: 'owner-trackers' },
            { id: 'channels', label: t.dashboard.ownerChannels, routeName: 'owner-channels' },
            { id: 'trips', label: t.dashboard.ownerTrips, routeName: 'owner-trips' },
          ],
        },
      ]
    : [
        {
          title: '',
          items: [
            { id: 'overview', label: t.common.overview, routeName: 'dashboard' },
            ...(role === 'dispatcher'
              ? [
                  { id: 'profile', label: t.common.profile, routeName: 'dispatcher-profile' },
                  { id: 'trips', label: t.dashboard.dispatcherTrips, routeName: 'dispatcher-trips' },
                  { id: 'assignments', label: t.dashboard.dispatcherAssignments, routeName: null },
                  { id: 'channels', label: t.dashboard.dispatcherChannels, routeName: null },
                  { id: 'map', label: t.dashboard.dispatcherMap, routeName: null },
                ]
              : [{ id: 'trips', label: t.dashboard.driverTrips, routeName: null }]),
          ],
        },
      ]
}

export const getTripStatusLabel = (
  messages: TranslationDictionary,
  status: TripResponse['status'],
): string => {
  switch (status) {
    case 'planned':
      return messages.dashboard.plannedTrips
    case 'in_progress':
      return messages.dashboard.inProgress
    case 'completed':
      return messages.dashboard.completed
    case 'cancelled':
      return messages.dashboard.cancelled
  }
}
