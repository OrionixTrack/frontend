<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import { createVehicleMarkerIcon } from '@shared/map/createVehicleMarkerIcon'

const props = defineProps<{
  startLatitude: number
  startLongitude: number
  finishLatitude: number
  finishLongitude: number
  theme: 'dark' | 'light'
  currentLatitude?: number | null
  currentLongitude?: number | null
  currentBearing?: number | null
  trackPolyline?: unknown | null
  liveTrackPoints?: Array<{ latitude: number; longitude: number }>
}>()

const mapElement = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let tileLayer: L.TileLayer | null = null
let resizeObserver: ResizeObserver | null = null

let startMarker: L.Marker | null = null
let finishMarker: L.Marker | null = null
let currentMarker: L.Marker | null = null
let routeLine: L.Polyline | null = null

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

const createMarkerIcon = (variant: 'start' | 'finish', label: string): L.DivIcon =>
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

const getLiveRoutePoints = (): Array<[number, number]> | null => {
  if (!Array.isArray(props.liveTrackPoints) || props.liveTrackPoints.length === 0) {
    return null
  }

  const points = props.liveTrackPoints
    .filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude))
    .map((point) => [point.latitude, point.longitude] as [number, number])

  return points.length > 0 ? points : null
}

const isSamePoint = (left: [number, number], right: [number, number]): boolean =>
  Math.abs(left[0] - right[0]) < 0.000001 && Math.abs(left[1] - right[1]) < 0.000001

const getDisplayRoutePoints = (): Array<[number, number]> | null => {
  const historicalPoints = getRoutePoints()
  const livePoints = getLiveRoutePoints()

  if (!historicalPoints?.length) {
    return livePoints && livePoints.length > 1 ? livePoints : null
  }

  if (!livePoints?.length) {
    return historicalPoints
  }

  const mergedPoints = [...historicalPoints]

  livePoints.forEach((point) => {
    const lastPoint = mergedPoints[mergedPoints.length - 1]

    if (!lastPoint || !isSamePoint(lastPoint, point)) {
      mergedPoints.push(point)
    }
  })

  return mergedPoints.length > 1 ? mergedPoints : null
}

const syncLayers = (): void => {
  if (!map) {
    return
  }

  // Start marker
  const startLatLng = L.latLng(props.startLatitude, props.startLongitude)
  if (!startMarker) {
    startMarker = L.marker(startLatLng, {
      icon: createMarkerIcon('start', 'A'),
      zIndexOffset: 300,
    })
      .bindTooltip('Start', { direction: 'top' })
      .addTo(map)
  } else {
    startMarker.setLatLng(startLatLng)
  }

  const finishLatLng = L.latLng(props.finishLatitude, props.finishLongitude)
  if (!finishMarker) {
    finishMarker = L.marker(finishLatLng, {
      icon: createMarkerIcon('finish', 'B'),
      zIndexOffset: 300,
    })
      .bindTooltip('Finish', { direction: 'top' })
      .addTo(map)
  } else {
    finishMarker.setLatLng(finishLatLng)
  }

  const routePoints = getDisplayRoutePoints()
  if (routePoints) {
    if (!routeLine) {
      routeLine = L.polyline(routePoints, {
        color: '#8ab4ff',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)
    } else {
      routeLine.setLatLngs(routePoints)
    }
  } else {
    routeLine?.remove()
    routeLine = null
  }

  // Current position marker
  if (
    props.currentLatitude !== null &&
    props.currentLatitude !== undefined &&
    props.currentLongitude !== null &&
    props.currentLongitude !== undefined
  ) {
    const currentLatLng = L.latLng(props.currentLatitude, props.currentLongitude)

    if (!currentMarker) {
      currentMarker = L.marker(currentLatLng, {
        icon: createVehicleMarkerIcon(props.currentBearing),
        zIndexOffset: 400,
      })
        .bindTooltip('Current', { direction: 'top' })
        .addTo(map)
    } else {
      currentMarker.setLatLng(currentLatLng)
      currentMarker.setIcon(createVehicleMarkerIcon(props.currentBearing))
    }
  } else {
    currentMarker?.remove()
    currentMarker = null
  }
}

const fitBounds = (): void => {
  if (!map) {
    return
  }

  const routePoints = getDisplayRoutePoints()
  const fallbackPoints: Array<[number, number]> = [
    [props.startLatitude, props.startLongitude],
    [props.finishLatitude, props.finishLongitude],
  ]

  const bounds = routePoints
    ? L.polyline(routePoints).getBounds()
    : L.latLngBounds(fallbackPoints)

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
  () => [
    props.startLatitude,
    props.startLongitude,
    props.finishLatitude,
    props.finishLongitude,
    props.currentLatitude,
    props.currentLongitude,
    props.currentBearing,
    props.trackPolyline,
    props.liveTrackPoints,
  ] as const,
  () => {
    syncLayers()
  },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  tileLayer?.remove()
  tileLayer = null
  startMarker?.remove()
  startMarker = null
  finishMarker?.remove()
  finishMarker = null
  currentMarker?.remove()
  currentMarker = null
  routeLine?.remove()
  routeLine = null
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="mapElement" class="trip-map" />
</template>
