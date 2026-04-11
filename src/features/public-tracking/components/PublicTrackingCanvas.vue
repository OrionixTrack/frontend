<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { ref } from 'vue'
import L from 'leaflet'

import type { AppTheme } from '@shared/composables/useTheme'
import { createVehicleMarkerIcon } from '@shared/map/createVehicleMarkerIcon'
import type { PublicTrackingPosition, PublicTrackingTrip } from '../types/PublicTrackingResponse'

const props = defineProps<{
  position: PublicTrackingPosition | null
  trip: PublicTrackingTrip
  theme: AppTheme
}>()

const mapElement = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let tileLayer: L.TileLayer | null = null
let vehicleMarker: L.Marker | null = null
let destinationMarker: L.Marker | null = null
let routeLine: L.Polyline | null = null
let resizeObserver: ResizeObserver | null = null
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


const createDestinationIcon = (): L.DivIcon =>
  L.divIcon({
    className: 'public-tracking-dest-icon-shell',
    html: `
      <span class="public-tracking-dest-icon">
        <svg viewBox="0 0 28 40" aria-hidden="true" width="28" height="40">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 9.75 14 26 14 26S28 23.75 28 14C28 6.27 21.73 0 14 0Z" fill="#ef4444" />
          <circle cx="14" cy="14" r="5.5" fill="#fff" />
        </svg>
      </span>
    `,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
  })

const fitBounds = (): void => {
  if (!map) {
    return
  }

  const bounds = L.latLngBounds([])
  bounds.extend([props.trip.finishLatitude, props.trip.finishLongitude])

  if (props.position) {
    bounds.extend([props.position.latitude, props.position.longitude])
  }

  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
    hasFittedBounds = true
  }
}

const syncLayers = (): void => {
  if (!map) {
    return
  }

  const destLatLng = L.latLng(props.trip.finishLatitude, props.trip.finishLongitude)

  if (!destinationMarker) {
    destinationMarker = L.marker(destLatLng, {
      icon: createDestinationIcon(),
      zIndexOffset: 100,
    })
      .bindTooltip(props.trip.finishAddress, { permanent: false })
      .addTo(map)
  } else {
    destinationMarker.setLatLng(destLatLng)
  }

  if (props.position) {
    const vehicleLatLng = L.latLng(props.position.latitude, props.position.longitude)

    if (!vehicleMarker) {
      vehicleMarker = L.marker(vehicleLatLng, {
        icon: createVehicleMarkerIcon(props.position.bearing),
        zIndexOffset: 300,
      }).addTo(map)
    } else {
      vehicleMarker.setLatLng(vehicleLatLng)
      vehicleMarker.setIcon(createVehicleMarkerIcon(props.position.bearing))
    }

    const routePoints: L.LatLngExpression[] = [
      [props.position.latitude, props.position.longitude],
      [props.trip.finishLatitude, props.trip.finishLongitude],
    ]

    if (!routeLine) {
      routeLine = L.polyline(routePoints, {
        color: '#7dd3fc',
        weight: 2,
        opacity: 0.55,
        dashArray: '6 6',
      }).addTo(map)
    } else {
      routeLine.setLatLngs(routePoints)
    }
  } else {
    vehicleMarker?.remove()
    vehicleMarker = null
    routeLine?.remove()
    routeLine = null
  }
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
  syncLayers()
  fitBounds()

  void nextTick(() => {
    map?.invalidateSize()
    syncLayers()
    fitBounds()
  })

  resizeObserver = new ResizeObserver(() => {
    if (!map) {
      return
    }

    map.invalidateSize()

    if (!hasFittedBounds) {
      fitBounds()
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
  () => [props.position, props.trip] as const,
  (current, previous) => {
    syncLayers()

    const hadPosition = Boolean(previous?.[0])
    const hasPosition = Boolean(current[0])

    if (!hasFittedBounds || (!hadPosition && hasPosition)) {
      fitBounds()
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  tileLayer?.remove()
  tileLayer = null
  vehicleMarker?.remove()
  vehicleMarker = null
  destinationMarker?.remove()
  destinationMarker = null
  routeLine?.remove()
  routeLine = null
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="mapElement" class="public-tracking-canvas" />
</template>
