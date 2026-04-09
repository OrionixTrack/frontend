import type { Locale } from '@shared/i18n/translations'

export interface AcceptInvitationPayload {
  token: string
  name: string
  surname: string
  password: string
  language: Locale
}
