import type { Locale } from '@shared/i18n/translations'

export interface RegisterOwnerPayload {
  full_name: string
  email: string
  password: string
  company_name: string
  language: Locale
}
