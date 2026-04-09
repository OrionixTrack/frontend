import type { Company } from './Company'

export interface DispatcherUser {
  id: number
  email: string
  name: string
  surname: string
  language: 'en' | 'uk'
  company: Company
}
