import { getJson } from '@core/api'

import type { PublicTrackingResponse } from '../types/PublicTrackingResponse'

export const getPublicTracking = (
  token: string,
  signal?: AbortSignal,
): Promise<PublicTrackingResponse> =>
  getJson(`/public/tracking/${token}`, { auth: false, signal })
