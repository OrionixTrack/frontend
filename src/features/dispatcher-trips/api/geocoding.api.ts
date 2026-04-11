import { getJson } from '@core/api'
import type { Locale } from '@shared/i18n/translations'

export interface GeocodingResult {
  address: string
  latitude: number
  longitude: number
}

export interface GeocodingSearchResponse {
  results: GeocodingResult[]
}

export const searchAddress = (
  query: string,
  locale: Locale,
  signal?: AbortSignal,
): Promise<GeocodingSearchResponse> =>
  getJson<GeocodingSearchResponse>('/map/geocoding/search', {
    query: {
      q: query,
      limit: 5,
      countrycodes: 'ua,pl',
      dedupe: true,
      acceptLanguage: locale,
    },
    signal,
  })

export const reverseGeocode = (
  latitude: number,
  longitude: number,
  locale: Locale,
  signal?: AbortSignal,
): Promise<GeocodingResult> =>
  getJson<GeocodingResult>('/map/geocoding/reverse', {
    query: {
      lat: latitude,
      lon: longitude,
      zoom: 18,
      acceptLanguage: locale,
    },
    signal,
  })
