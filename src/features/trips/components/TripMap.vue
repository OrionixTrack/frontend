<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'

const props = defineProps<{
  startLatitude: number
  startLongitude: number
  finishLatitude: number
  finishLongitude: number
  theme: 'dark' | 'light'
  currentLatitude?: number | null
  currentLongitude?: number | null
  trackPolyline?: unknown | null
}>()

const mapElement = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let layerGroup: L.LayerGroup | null = null
let resizeObserver: ResizeObserver | null = null
let tileLayer: L.TileLayer | null = null

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

const createMarkerIcon = (variant: 'start' | 'finish' | 'current', label: string): L.DivIcon =>
  L.divIcon({
    className: 'trip-map-marker-shell',
    html: `<span class="trip-map-marker trip-map-marker-${variant}">${label}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })

const decodePolyline = (encoded: string): Array<[number, number]> => {
  let index = 0
  let latitude = 0
  let longitude = 0
  const coordinates: Array<[number, number]> = []

  while (index < encoded.length) {
    let shift = 0
    let result = 0
    let byte = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLatitude = result & 1 ? ~(result >> 1) : result >> 1
    latitude += deltaLatitude

    shift = 0
    result = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLongitude = result & 1 ? ~(result >> 1) : result >> 1
    longitude += deltaLongitude

    coordinates.push([latitude / 1e5, longitude / 1e5])
  }

  return coordinates
}

const getRoutePoints = (): Array<[number, number]> | null => {
  if (typeof props.trackPolyline === 'string' && props.trackPolyline.trim()) {
    try {
      const decoded = decodePolyline(props.trackPolyline)

      if (decoded.length > 1) {
        return decoded
      }
    } catch {
      return null
    }
  }

  return null
}

const renderMap = (): void => {
  if (!map) {
    return
  }

  layerGroup?.clearLayers()
  layerGroup = L.layerGroup().addTo(map)

  const routePoints = getRoutePoints()
  const fallbackPoints: Array<[number, number]> = [
    [props.startLatitude, props.startLongitude],
    [props.finishLatitude, props.finishLongitude],
  ]

  const routeLine = routePoints
    ? L.polyline(routePoints, {
        color: '#8ab4ff',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup)
    : null

  L.marker([props.startLatitude, props.startLongitude], {
    icon: createMarkerIcon('start', 'A'),
    zIndexOffset: 300,
  })
    .bindTooltip('Start', { direction: 'top' })
    .addTo(layerGroup)

  L.marker([props.finishLatitude, props.finishLongitude], {
    icon: createMarkerIcon('finish', 'B'),
    zIndexOffset: 300,
  })
    .bindTooltip('Finish', { direction: 'top' })
    .addTo(layerGroup)

  if (
    props.currentLatitude !== null &&
    props.currentLatitude !== undefined &&
    props.currentLongitude !== null &&
    props.currentLongitude !== undefined
  ) {
    L.marker([props.currentLatitude, props.currentLongitude], {
      icon: createMarkerIcon('current', '●'),
      zIndexOffset: 400,
    })
      .bindTooltip('Current', { direction: 'top' })
      .addTo(layerGroup)
  }

  const bounds = routeLine ? routeLine.getBounds() : L.latLngBounds(fallbackPoints)
  fallbackPoints.forEach((point) => bounds.extend(point))

  if (
    props.currentLatitude !== null &&
    props.currentLatitude !== undefined &&
    props.currentLongitude !== null &&
    props.currentLongitude !== undefined
  ) {
    bounds.extend([props.currentLatitude, props.currentLongitude])
  }

  if (bounds.isValid()) {
    map.fitBounds(bounds, {
      padding: [44, 44],
      maxZoom: 14,
    })
    return
  }

  map.setView([props.startLatitude, props.startLongitude], 12)
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

  renderMap()

  void nextTick(() => {
    map?.invalidateSize()
    renderMap()
  })

  resizeObserver = new ResizeObserver(() => {
    if (!map) {
      return
    }

    map.invalidateSize()
    renderMap()
  })

  resizeObserver.observe(mapElement.value)
})

watch(
  () => [
    props.startLatitude,
    props.startLongitude,
    props.finishLatitude,
    props.finishLongitude,
    props.currentLatitude,
    props.currentLongitude,
    props.trackPolyline,
    props.theme,
  ] as const,
  () => {
    syncTileLayer()
    renderMap()
  },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  tileLayer?.remove()
  tileLayer = null
  layerGroup?.clearLayers()
  layerGroup = null
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="mapElement" class="trip-map" />
</template>
