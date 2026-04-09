import type { Company } from './Company'

export interface OwnerUser {
  id: number
  email: string
  full_name: string
  language: 'en' | 'uk'
  company: Company
}
