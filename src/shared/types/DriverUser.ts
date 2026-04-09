import type { Company } from './Company'

export interface DriverUser {
  id: number
  email: string
  name: string
  surname: string
  language: 'en' | 'uk'
  company: Company
}
