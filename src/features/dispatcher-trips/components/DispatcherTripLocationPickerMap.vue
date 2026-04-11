<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'

const props = defineProps<{
  theme: 'dark' | 'light'
  activePoint: 'start' | 'finish'
  startLatitude: number | null
  startLongitude: number | null
  finishLatitude: number | null
  finishLongitude: number | null
}>()

const emit = defineEmits<{
  pick: [point: 'start' | 'finish', latitude: number, longitude: number]
}>()

const mapElement = ref<globalThis.HTMLElement | null>(null)
let map: L.Map | null = null
let layerGroup: L.LayerGroup | null = null
let resizeObserver: globalThis.ResizeObserver | null = null
let tileLayer: L.TileLayer | null = null
let preserveViewportUntil = 0

const DEFAULT_CENTER: [number, number] = [50.4501, 30.5234]
const VIEWPORT_PRESERVE_MS = 1500

const preserveViewport = (): void => {
  preserveViewportUntil = Date.now() + VIEWPORT_PRESERVE_MS
}

const shouldPreserveViewport = (): boolean => Date.now() < preserveViewportUntil

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

const createMarkerIcon = (variant: 'start' | 'finish', label: string, isActive: boolean): L.DivIcon =>
  L.divIcon({
    className: 'trip-map-marker-shell',
    html: `<span class="trip-map-marker trip-map-marker-${variant}${isActive ? ' trip-map-marker-active' : ''}">${label}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })

const renderMap = (): void => {
  if (!map) {
    return
  }

  layerGroup?.clearLayers()
  layerGroup = L.layerGroup().addTo(map)

  const points: Array<[number, number]> = []

  if (props.startLatitude !== null && props.startLongitude !== null) {
    const startLatitude = props.startLatitude
    const startLongitude = props.startLongitude
    const marker = L.marker([startLatitude, startLongitude], {
      icon: createMarkerIcon('start', 'A', props.activePoint === 'start'),
      draggable: true,
      zIndexOffset: 300,
    })
      .bindTooltip('Start', { direction: 'top' })
      .addTo(layerGroup)

    marker.on('dragend', () => {
      const position = marker.getLatLng()
      preserveViewport()
      emit('pick', 'start', position.lat, position.lng)
    })

    points.push([startLatitude, startLongitude])
  }

  if (props.finishLatitude !== null && props.finishLongitude !== null) {
    const finishLatitude = props.finishLatitude
    const finishLongitude = props.finishLongitude
    const marker = L.marker([finishLatitude, finishLongitude], {
      icon: createMarkerIcon('finish', 'B', props.activePoint === 'finish'),
      draggable: true,
      zIndexOffset: 300,
    })
      .bindTooltip('Finish', { direction: 'top' })
      .addTo(layerGroup)

    marker.on('dragend', () => {
      const position = marker.getLatLng()
      preserveViewport()
      emit('pick', 'finish', position.lat, position.lng)
    })

    points.push([finishLatitude, finishLongitude])
  }

  if (points.length === 2) {
    L.polyline(points, {
      color: '#8ab4ff',
      weight: 4,
      opacity: 0.92,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: '8 8',
    }).addTo(layerGroup)
  }

  if (points.length > 0) {
    if (!shouldPreserveViewport()) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 13,
      })
    }
    return
  }

  if (!shouldPreserveViewport()) {
    map.setView(DEFAULT_CENTER, 6)
  }
}

onMounted(() => {
  if (!mapElement.value) {
    return
  }

  map = L.map(mapElement.value, {
    zoomControl: true,
    attributionControl: false,
  })

  syncTileLayer()
  map.on('click', (event: L.LeafletMouseEvent) => {
    preserveViewport()
    emit('pick', props.activePoint, event.latlng.lat, event.latlng.lng)
  })

  renderMap()

  void nextTick(() => {
    map?.invalidateSize()
    renderMap()
  })

  resizeObserver = new globalThis.ResizeObserver(() => {
    if (!map) {
      return
    }

    map.invalidateSize()
    renderMap()
  })

  resizeObserver.observe(mapElement.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  map?.remove()
  map = null
})

watch(
  () => [props.theme] as const,
  () => {
    syncTileLayer()
  },
)

watch(
  () => [props.startLatitude, props.startLongitude, props.finishLatitude, props.finishLongitude, props.activePoint] as const,
  () => {
    renderMap()
  },
)
</script>

<template>
  <div ref="mapElement" class="trip-map trip-location-picker-map" />
</template>
