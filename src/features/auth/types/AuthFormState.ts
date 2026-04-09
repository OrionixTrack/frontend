import type { Locale } from '@shared/i18n/translations'
import type { UserRole } from '@shared/types'

export interface AuthFormState {
  role: UserRole
  email: string
  password: string
  fullName: string
  companyName: string
  name: string
  surname: string
  newPassword: string
  language: Locale
}
