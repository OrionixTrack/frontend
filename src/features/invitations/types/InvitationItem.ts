import type { InvitationRole } from './InvitationRole'
import type { InvitationStatus } from './InvitationStatus'

export interface InvitationItem {
  invitation_id: number
  email: string
  role: InvitationRole
  status: InvitationStatus
  expires_at: string
  created_at: string
  accepted_at: string | null
}
