import type { TranslationDictionary } from '@shared/i18n/translations'
import type { UserRole } from '@shared/types'

export const getRouteTitle = (
  routeName: string | null | undefined,
  t: TranslationDictionary,
  role?: UserRole | null,
): string => {
  switch (routeName) {
    case 'login':
      return t.auth.signIn
    case 'register':
      return t.auth.registerTitle
    case 'check-email':
      return t.auth.checkEmailTitle
    case 'verify-email':
      return t.auth.verifyEmailTitle
    case 'resend-verification':
      return t.auth.resendVerificationTitle
    case 'forgot-password':
      return t.auth.forgotPasswordTitle
    case 'reset-password':
      return t.auth.resetPasswordTitle
    case 'accept-invitation':
      return t.auth.acceptInvitationTitle
    case 'dashboard':
      if (role === 'owner') return t.dashboard.workspaceOwner
      if (role === 'dispatcher') return t.dashboard.workspaceDispatcher
      return t.dashboard.workspaceDriver
    case 'dispatcher-profile':
      return t.dispatcherProfile.pageTitle
    case 'dispatcher-trips':
    case 'dispatcher-trip-create':
    case 'dispatcher-trip-details':
    case 'dispatcher-trip-edit':
      return t.dashboard.dispatcherTrips
    case 'dispatcher-channels':
      return t.channels.pageTitle
    case 'owner-settings':
      return t.ownerSettings.pageTitle
    case 'owner-invitations':
      return t.invitations.pageTitle
    case 'owner-employees':
      return t.employees.pageTitle
    case 'owner-vehicles':
      return t.vehicles.pageTitle
    case 'owner-trackers':
      return t.trackers.pageTitle
    case 'owner-channels':
      return t.channels.pageTitle
    case 'owner-trips':
    case 'owner-trip-details':
      return t.trips.pageTitle
    case 'public-tracking':
      return t.publicTracking.title
    case 'not-found':
      return t.errors.notFoundTitle
    default:
      return ''
  }
}
