import type { ComputedRef } from 'vue'

import type { AuthLinkAction, AuthMode, AuthScreenUi, RoleOption } from '@features/auth/types'
import type { TranslationDictionary } from '@shared/i18n/translations'
import type { UserRole } from '@shared/types'

export const AUTH_ROUTE_TO_MODE: Record<string, AuthMode> = {
  login: 'login',
  register: 'register',
  'check-email': 'check-email',
  'verify-email': 'verify-email',
  'resend-verification': 'resend-verification',
  'forgot-password': 'forgot-password',
  'reset-password': 'reset-password',
  'accept-invitation': 'accept-invitation',
}

export const createRoleOptions = (
  messages: TranslationDictionary,
): RoleOption[] => [
  {
    value: 'owner',
    label: messages.auth.roleOwner,
    description: messages.auth.ownerDescription,
  },
  {
    value: 'dispatcher',
    label: messages.auth.roleDispatcher,
    description: messages.auth.dispatcherDescription,
  },
]

export const getAuthHeading = (
  messages: TranslationDictionary,
  mode: AuthMode,
  role: UserRole,
): string => {
  switch (mode) {
    case 'register':
      return messages.auth.registerTitle
    case 'check-email':
      return messages.auth.checkEmailTitle
    case 'verify-email':
      return messages.auth.verifyEmailTitle
    case 'resend-verification':
      return messages.auth.resendVerificationTitle
    case 'forgot-password':
      return messages.auth.forgotPasswordTitle
    case 'reset-password':
      return messages.auth.resetPasswordTitle
    case 'accept-invitation':
      return messages.auth.acceptInvitationTitle
    default:
      return role === 'owner' ? messages.auth.signInOwner : messages.auth.signInDispatcher
  }
}

export const createAuthUi = (
  messages: TranslationDictionary,
  mode: AuthMode,
  authHeading: string,
): AuthScreenUi => {
  const common = {
    appName: messages.auth.appName,
    heroTitle: messages.auth.heroTitle,
    heroDescription: messages.auth.heroDescription,
    email: messages.auth.email,
    password: messages.auth.password,
    newPassword: messages.auth.newPassword,
    fullName: messages.auth.fullName,
    companyName: messages.auth.companyName,
    firstName: messages.auth.firstName,
    lastName: messages.auth.lastName,
    selectedLanguage: messages.auth.selectedLanguage,
    tokenRequired: messages.auth.tokenRequired,
  }

  switch (mode) {
    case 'register':
      return {
        ...common,
        sectionKicker: messages.auth.createOwnerAccount,
        cardTitle: messages.auth.registerTitle,
        cardDescription: messages.auth.registerDescription,
        submitLabel: messages.auth.createOwnerAccount,
        submittingLabel: messages.auth.creatingOwnerAccount,
        successMessage: messages.auth.registerSuccess,
      }
    case 'check-email':
      return {
        ...common,
        sectionKicker: messages.auth.checkEmailTitle,
        cardTitle: messages.auth.checkEmailTitle,
        cardDescription: messages.auth.checkEmailDescription,
        submitLabel: messages.auth.checkEmailAction,
        submittingLabel: messages.auth.resendingVerification,
        successMessage: messages.auth.resendVerificationSuccess,
      }
    case 'verify-email':
      return {
        ...common,
        sectionKicker: messages.auth.verifyEmailTitle,
        cardTitle: messages.auth.verifyEmailTitle,
        cardDescription: messages.auth.verifyEmailDescription,
        submitLabel: messages.auth.verifyEmailAction,
        submittingLabel: messages.auth.verifyingEmail,
        successMessage: messages.auth.verifyEmailSuccess,
      }
    case 'resend-verification':
      return {
        ...common,
        sectionKicker: messages.auth.resendVerificationTitle,
        cardTitle: messages.auth.resendVerificationTitle,
        cardDescription: messages.auth.resendVerificationDescription,
        submitLabel: messages.auth.resendVerificationAction,
        submittingLabel: messages.auth.resendingVerification,
        successMessage: messages.auth.resendVerificationSuccess,
      }
    case 'forgot-password':
      return {
        ...common,
        sectionKicker: messages.auth.forgotPasswordTitle,
        cardTitle: messages.auth.forgotPasswordTitle,
        cardDescription: messages.auth.forgotPasswordDescription,
        submitLabel: messages.auth.forgotPasswordAction,
        submittingLabel: messages.auth.sendingResetLink,
        successMessage: messages.auth.forgotPasswordSuccess,
      }
    case 'reset-password':
      return {
        ...common,
        sectionKicker: messages.auth.resetPasswordTitle,
        cardTitle: messages.auth.resetPasswordTitle,
        cardDescription: messages.auth.resetPasswordDescription,
        submitLabel: messages.auth.resetPasswordAction,
        submittingLabel: messages.auth.resettingPassword,
        successMessage: messages.auth.resetPasswordSuccess,
      }
    case 'accept-invitation':
      return {
        ...common,
        sectionKicker: messages.auth.acceptInvitationTitle,
        cardTitle: messages.auth.acceptInvitationTitle,
        cardDescription: messages.auth.acceptInvitationDescription,
        submitLabel: messages.auth.acceptInvitationAction,
        submittingLabel: messages.auth.acceptingInvitation,
        successMessage: messages.auth.acceptInvitationSuccess,
      }
    default:
      return {
        ...common,
        sectionKicker: authHeading,
        cardTitle: authHeading,
        cardDescription: messages.auth.heroDescription,
        submitLabel: messages.auth.signIn,
        submittingLabel: messages.auth.signingIn,
        successMessage: '',
      }
  }
}

interface HelperLinksArgs {
  authError: string
  messages: TranslationDictionary
  mode: AuthMode
  resendTargetEmail: string
  role: UserRole
  unverifiedOwnerEmail: string
}

export const createHelperLinks = ({
  authError,
  messages,
  mode,
  resendTargetEmail,
  role,
  unverifiedOwnerEmail,
}: HelperLinksArgs): AuthLinkAction[] => {
  const verifyResendLink =
    authError && mode === 'verify-email'
      ? resendTargetEmail
        ? {
            label: messages.auth.resendVerificationForEmail,
            to: { name: 'check-email', query: { email: resendTargetEmail } },
          }
        : {
            label: messages.auth.resendVerificationForEmail,
            to: { name: 'resend-verification' },
          }
      : null

  switch (mode) {
    case 'register':
      return [
        { label: messages.auth.backToLogin, to: { name: 'login' } },
        {
          label: messages.auth.forgotPasswordLink,
          to: { name: 'forgot-password', query: { role: 'owner' } },
        },
      ]
    case 'check-email':
      return [{ label: messages.auth.backToLogin, to: { name: 'login' } }]
    case 'verify-email':
      return [
        ...(verifyResendLink ? [verifyResendLink] : []),
        { label: messages.auth.backToLogin, to: { name: 'login' } },
      ]
    case 'resend-verification':
      return [{ label: messages.auth.backToLogin, to: { name: 'login' } }]
    case 'forgot-password':
    case 'reset-password':
    case 'accept-invitation':
      return [{ label: messages.auth.backToLogin, to: { name: 'login' } }]
    default:
      return [
        { label: messages.auth.registerLink, to: { name: 'register' } },
        {
          label: messages.auth.forgotPasswordLink,
          to: { name: 'forgot-password', query: { role } },
        },
        ...(role === 'owner' && unverifiedOwnerEmail
          ? [
              {
                label: messages.auth.resendVerificationForEmail,
                to: { name: 'check-email', query: { email: unverifiedOwnerEmail } },
              },
            ]
          : []),
      ]
  }
}

export const createResendCooldownMessage = (
  messages: TranslationDictionary,
  seconds: number,
): string => {
  if (seconds <= 0) {
    return ''
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const formattedTime =
    minutes > 0
      ? `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
      : `0:${String(remainingSeconds).padStart(2, '0')}`

  return messages.auth.resendAvailableIn.replace('{time}', formattedTime)
}
