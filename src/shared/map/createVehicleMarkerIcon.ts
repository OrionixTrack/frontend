import L from 'leaflet'

export const createVehicleMarkerIcon = (bearing?: number | null): L.DivIcon =>
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
