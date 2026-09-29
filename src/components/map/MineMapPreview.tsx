import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { Mine } from '../../data/types'
import { createMineMap, createMineMarkerElement, fitMapToMines } from './mineMap'

/**
 * Static, non-interactive overview of the mine network for the Command Center.
 * Uses the same basemap, markers and risk colours as the GIS Risk Map. The surrounding
 * card owns interaction (it links to /map), so the map subtree is inert.
 */
export default function MineMapPreview({ mines }: { mines: Mine[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const map = createMineMap(el, { interactive: false, attributionControl: { compact: false } })
    mines.forEach((mine, index) => {
      new maplibregl.Marker({ element: createMineMarkerElement(mine, index, { decorative: true }) }).setLngLat(mine.coordinates).addTo(map)
    })
    fitMapToMines(map, mines)

    // Keep every mine in frame as the card resizes (sidebar collapse, breakpoints)
    const observer = new ResizeObserver(() => {
      map.resize()
      fitMapToMines(map, mines)
    })
    observer.observe(el)

    return () => {
      observer.disconnect()
      map.remove()
    }
  }, [mines])

  // MapLibre forces `position: relative` on its container, so it gets an inner, fully sized element
  return (
    <div inert className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
