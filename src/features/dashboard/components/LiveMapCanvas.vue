<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'

import type { AppTheme } from '@shared/composables/useTheme'
import type { Locale, TranslationDictionary } from '@shared/i18n/translations'

import type { MapVehicleItem } from '../types/MapVehicleItem'

const props = defineProps<{
  items: MapVehicleItem[]
  locale: Locale
  messages: TranslationDictionary
  theme: AppTheme
}>()

const mapElement = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let resizeObserver: ResizeObserver | null = null
let tileLayer: L.TileLayer | null = null
const markerMap = new Map<number, L.Marker>()
const routeLineMap = new Map<number, L.Polyline>()
let hasFittedBounds = false

const getTileLayerConfig = (): { url: string; subdomains: string } =>
  props.theme === 'dark'
    ? {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        subdomains: 'abcd',
      }
    : {
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        subdomains: 'abcd',
      }

const syncTileLayer = (): void => {
  if (!map) {
    return
  }

  const config = getTileLayerConfig()
  tileLayer?.remove()
  tileLayer = L.tileLayer(config.url, {
    maxZoom: 19,
    subdomains: config.subdomains,
  }).addTo(map)
}

const createVehicleIcon = (bearing?: number | null): L.DivIcon =>
  L.divIcon({
    className: 'live-map-vehicle-icon-shell',
    html: `
      <span class="live-map-vehicle-icon" style="transform: rotate(${bearing ?? 0}deg);">
        <svg viewBox="0 0 32 32" aria-hidden="true" class="live-map-vehicle-icon-glyph">
          <defs>
            <radialGradient id="live-map-vehicle-icon-gradient" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stop-color="#93c5fd" />
              <stop offset="62%" stop-color="#3b82f6" />
              <stop offset="100%" stop-color="#1d4ed8" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="14" class="live-map-vehicle-icon-disc" />
          <path d="M16 6L24.8 24.5L16 20.6L7.2 24.5L16 6Z" class="live-map-vehicle-icon-arrow" />
          <path d="M16 10.8L20.2 19.3L16 17.5L11.8 19.3L16 10.8Z" class="live-map-vehicle-icon-arrow-cutout" />
        </svg>
      </span>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat(props.locale === 'uk' ? 'uk-UA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const getPopupHtml = (item: MapVehicleItem): string => `
  <div class="live-map-popup">
    <strong>${item.vehicleName}</strong>
    <span>${item.licensePlate}</span>
    <span>${item.activeTrip?.name ?? props.messages.dashboard.liveMapNoActiveTrip}</span>
    <span>${props.messages.dashboard.liveMapUpdatedAt}: ${item.position ? formatDateTime(item.position.datetime) : '—'}</span>
  </div>
`

const fitToVisibleData = (): void => {
  if (!map) {
    return
  }

  const positionedItems = props.items.filter((item) => item.position)

  if (!positionedItems.length) {
    map.setView([50.4501, 30.5234], 6)
    hasFittedBounds = false
    return
  }

  const bounds = L.latLngBounds([])

  positionedItems.forEach((item) => {
    const position = item.position

    if (!position) {
      return
    }

    bounds.extend([position.latitude, position.longitude])

    if (item.activeTrip) {
      bounds.extend([item.activeTrip.finishLatitude, item.activeTrip.finishLongitude])
    }
  })

  if (bounds.isValid()) {
    map.fitBounds(bounds, {
      padding: [36, 36],
      maxZoom: 13,
    })
    hasFittedBounds = true
  }
}

const syncVehicleLayers = (): void => {
  if (!map) {
    return
  }

  if (!markersLayer) {
    markersLayer = L.layerGroup().addTo(map)
  }

  const layer = markersLayer

  const visibleVehicleIds = new Set<number>()

  props.items.forEach((item) => {
    if (!item.position) {
      const existingMarker = markerMap.get(item.vehicleId)
      existingMarker?.remove()
      markerMap.delete(item.vehicleId)

      const existingLine = routeLineMap.get(item.vehicleId)
      existingLine?.remove()
      routeLineMap.delete(item.vehicleId)
      return
    }

    visibleVehicleIds.add(item.vehicleId)

    const markerLatLng = L.latLng(item.position.latitude, item.position.longitude)
    const existingMarker = markerMap.get(item.vehicleId)

    if (existingMarker) {
      existingMarker.setLatLng(markerLatLng)
      existingMarker.setIcon(createVehicleIcon(item.position.bearing))
      existingMarker.setZIndexOffset(item.activeTrip ? 300 : 200)
      existingMarker.setPopupContent(getPopupHtml(item))
    } else {
      const marker = L.marker(markerLatLng, {
        icon: createVehicleIcon(item.position.bearing),
        zIndexOffset: item.activeTrip ? 300 : 200,
      })

      marker.bindPopup(getPopupHtml(item))
      marker.addTo(layer)
      markerMap.set(item.vehicleId, marker)
    }

    const existingLine = routeLineMap.get(item.vehicleId)

    if (item.activeTrip) {
      const routePoints: L.LatLngExpression[] = [
        [item.position.latitude, item.position.longitude],
        [item.activeTrip.finishLatitude, item.activeTrip.finishLongitude],
      ]

      if (existingLine) {
        existingLine.setLatLngs(routePoints)
        existingLine.setStyle({
          color: item.activeTrip.status === 'in_progress' ? '#7dd3fc' : '#94a3b8',
        })
      } else {
        const line = L.polyline(routePoints, {
          color: item.activeTrip.status === 'in_progress' ? '#7dd3fc' : '#94a3b8',
          weight: 2,
          opacity: 0.55,
          dashArray: '6 6',
        })

        line.addTo(layer)
        routeLineMap.set(item.vehicleId, line)
      }
    } else if (existingLine) {
      existingLine.remove()
      routeLineMap.delete(item.vehicleId)
    }
  })

  Array.from(markerMap.keys()).forEach((vehicleId) => {
    if (visibleVehicleIds.has(vehicleId)) {
      return
    }

    markerMap.get(vehicleId)?.remove()
    markerMap.delete(vehicleId)
    routeLineMap.get(vehicleId)?.remove()
    routeLineMap.delete(vehicleId)
  })
}

onMounted(() => {
  if (!mapElement.value) {
    return
  }

  map = L.map(mapElement.value, {
    zoomControl: false,
    attributionControl: false,
  })

  syncTileLayer()
  syncVehicleLayers()
  fitToVisibleData()

  void nextTick(() => {
    map?.invalidateSize()
    syncVehicleLayers()
    fitToVisibleData()
  })

  resizeObserver = new ResizeObserver(() => {
    if (!map) {
      return
    }

    map.invalidateSize()

    if (!hasFittedBounds) {
      fitToVisibleData()
    }
  })

  resizeObserver.observe(mapElement.value)
})

watch(
  () => props.theme,
  () => {
    syncTileLayer()
  },
)

watch(
  () => props.items,
  (currentItems, previousItems) => {
    syncVehicleLayers()

    const previousVisibleCount = previousItems?.filter((item) => item.position).length ?? 0
    const currentVisibleCount = currentItems.filter((item) => item.position).length
    const previousIds = new Set((previousItems ?? []).map((item) => item.vehicleId))
    const currentIds = new Set(currentItems.map((item) => item.vehicleId))
    const hasCollectionChanged =
      previousVisibleCount !== currentVisibleCount ||
      previousIds.size !== currentIds.size ||
      Array.from(currentIds).some((id) => !previousIds.has(id))

    if (!hasFittedBounds || hasCollectionChanged) {
      fitToVisibleData()
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  tileLayer?.remove()
  tileLayer = null
  markerMap.forEach((marker) => marker.remove())
  markerMap.clear()
  routeLineMap.forEach((line) => line.remove())
  routeLineMap.clear()
  markersLayer?.clearLayers()
  markersLayer = null
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="mapElement" class="owner-live-map-canvas" />
</template>
