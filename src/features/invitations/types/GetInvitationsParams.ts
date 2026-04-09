import type { InvitationSortOrder } from './InvitationSortOrder'

export interface GetInvitationsParams {
  limit?: number
  offset?: number
  sortOrder?: InvitationSortOrder
  search?: string
}
