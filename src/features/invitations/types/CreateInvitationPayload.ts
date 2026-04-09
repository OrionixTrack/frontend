import type { InvitationRole } from './InvitationRole'

export interface CreateInvitationPayload {
  email: string
  role: InvitationRole
}
