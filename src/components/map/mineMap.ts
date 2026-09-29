// Shared MapLibre building blocks for the GIS Risk Map and the Command Center map preview.
// Only lazily loaded modules import this file, so MapLibre stays out of the initial bundle.
import * as maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import type { Mine, RiskLevel } from '../../data/types'

export const riskVar: Record<RiskLevel, string> = {
  HIGH: 'var(--color-danger-solid)',
  MEDIUM: 'var(--color-warning-solid)',
  LOW: 'var(--color-success-solid)',
}
export const riskLabel: Record<RiskLevel, string> = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' }

/** Default national view used by the GIS page and its "Reset view". */
export const INDIA_VIEW = { center: [82.5, 22.5] as [number, number], zoom: 5 }

const BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: 'osm-layer', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 }],
}

/** Create a map with the shared basemap. Theme styling of the canvas is handled in index.css. */
export function createMineMap(container: HTMLElement, options?: Omit<maplibregl.MapOptions, 'container' | 'style'>) {
  return new maplibregl.Map({ container, style: BASEMAP_STYLE, center: INDIA_VIEW.center, zoom: INDIA_VIEW.zoom, ...options })
}

/**
 * Risk-coloured marker element. Appearance and the subtle "live" pulse live in index.css
 * (.kd-mine-marker); `decorative` hides it from assistive tech when a surrounding control
 * already describes the map.
 */
export function createMineMarkerElement(mine: Mine, index: number, { decorative = false }: { decorative?: boolean } = {}) {
  const el = document.createElement('div')
  el.className = 'mine-marker kd-mine-marker'
  el.dataset.risk = mine.riskLevel
  el.style.setProperty('--kd-marker', riskVar[mine.riskLevel])
  // Offset each marker's phase so the network breathes rather than blinking in unison
  el.style.animationDelay = `${-((index * 0.61) % 2).toFixed(2)}s`
  if (decorative) {
    el.setAttribute('aria-hidden', 'true')
  } else {
    el.setAttribute('role', 'button')
    el.setAttribute('aria-label', `${mine.code} — ${riskLabel[mine.riskLevel]} risk`)
  }
  return el
}

/** Frame all given mines within the map viewport. */
export function fitMapToMines(map: maplibregl.Map, list: Mine[], padding = 36) {
  if (list.length === 0) return
  const bounds = new maplibregl.LngLatBounds(list[0].coordinates, list[0].coordinates)
  list.forEach((m) => bounds.extend(m.coordinates))
  map.fitBounds(bounds, { padding, animate: false, maxZoom: 7 })
}
