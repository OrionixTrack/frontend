import type { TrackerTokenResponse } from '../types/TrackerTokenResponse'

export const getTrackerToken = (payload: TrackerTokenResponse | null | undefined): string =>
  payload?.device_secret_token ??
  payload?.secret_token ??
  payload?.secretToken ??
  payload?.tracker_token ??
  payload?.token ??
  ''
