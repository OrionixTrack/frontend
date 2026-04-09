import { getJson, postJson } from '@core/api'
import type { CreateInvitationPayload } from '@features/invitations/types/CreateInvitationPayload'
import type { GetInvitationsParams } from '@features/invitations/types/GetInvitationsParams'
import type { InvitationItem } from '@features/invitations/types/InvitationItem'

export const getInvitations = (
  params: GetInvitationsParams = {},
  signal?: AbortSignal,
): Promise<InvitationItem[]> =>
  getJson<InvitationItem[]>('/owner/invitations', {
    signal,
    query: {
      limit: params.limit,
      offset: params.offset,
      sortOrder: params.sortOrder,
      search: params.search?.trim() || undefined,
    },
  })

export const createInvitation = (
  payload: CreateInvitationPayload,
  signal?: AbortSignal,
): Promise<InvitationItem> =>
  postJson<InvitationItem>('/owner/invitations', payload, { signal })
