import { useEffect, useRef, useState, useMemo } from 'react'
import * as maplibregl from 'maplibre-gl'
import { RotateCcw, ShieldAlert, Activity, SlidersHorizontal, ChevronDown, ChevronUp, MapPin, SearchX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { mines } from '../data/mines'
import { cn, complianceTone, toneFill, toneText } from '../lib/utils'
import DemoHighlight from '../components/shared/DemoHighlight'
import { StatusBadge } from '../components/shared/StatusBadge'
import { SearchInput, Select } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/States'
import { useIsMobile } from '../lib/useIsMobile'

const riskSeverity = { HIGH: 3, MEDIUM: 2, LOW: 1 }
const riskVar = { HIGH: 'var(--color-danger-solid)', MEDIUM: 'var(--color-warning-solid)', LOW: 'var(--color-success-solid)' } as const
const riskLabel = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' } as const

type MineItem = (typeof mines)[number]

// Prototype estimate carried over from the original map view
const estimatedOpenCapa = (mine: MineItem) => (mine.riskLevel === 'HIGH' ? 7 : mine.riskLevel === 'MEDIUM' ? 3 : 0)

export default function GISRiskMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markers = useRef<Map<string, { marker: maplibregl.Marker; el: HTMLDivElement }>>(new Map())
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [subsidiaryFilter, setSubsidiaryFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const [showMineList, setShowMineList] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const subsidiaries = useMemo(() => Array.from(new Set(mines.map((m) => m.subsidiaryCode))), [])
  const types = useMemo(() => Array.from(new Set(mines.map((m) => m.type))), [])

  const filteredMines = useMemo(() => {
    return mines.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase())
      const matchRisk = riskFilter === 'ALL' || m.riskLevel === riskFilter
      const matchSub = subsidiaryFilter === 'ALL' || m.subsidiaryCode === subsidiaryFilter
      const matchType = typeFilter === 'ALL' || m.type === typeFilter
      return matchSearch && matchRisk && matchSub && matchType
    })
  }, [search, riskFilter, subsidiaryFilter, typeFilter])

  const sortedMines = useMemo(() => {
    return [...filteredMines].sort((a, b) => riskSeverity[b.riskLevel] - riskSeverity[a.riskLevel])
  }, [filteredMines])

  const riskCounts = useMemo(
    () => ({
      HIGH: filteredMines.filter((m) => m.riskLevel === 'HIGH').length,
      MEDIUM: filteredMines.filter((m) => m.riskLevel === 'MEDIUM').length,
      LOW: filteredMines.filter((m) => m.riskLevel === 'LOW').length,
    }),
    [filteredMines]
  )

  const activeFilterCount = [riskFilter, subsidiaryFilter, typeFilter].filter((f) => f !== 'ALL').length

  const resetView = () => {
    map.current?.flyTo({ center: [82.5, 22.5], zoom: 5 })
    setSearch('')
    setRiskFilter('ALL')
    setSubsidiaryFilter('ALL')
    setTypeFilter('ALL')
    setSelectedId(null)
  }

  const focusMine = (mine: MineItem) => {
    setSelectedId(mine.id)
    map.current?.flyTo({ center: mine.coordinates, zoom: 9 })
  }

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [82.5, 22.5],
      zoom: 5,
    })

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    const markerStore = markers.current
    return () => {
      markerStore.clear()
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Keep the map canvas sized to its container when the layout changes
  useEffect(() => {
    const t = window.setTimeout(() => map.current?.resize(), 250)
    return () => window.clearTimeout(t)
  }, [isMobile, showMineList])

  // Update Markers
  useEffect(() => {
    if (!map.current) return

    markers.current.forEach(({ marker }) => marker.remove())
    markers.current.clear()

    filteredMines.forEach((mine) => {
      const color = riskVar[mine.riskLevel]
      const openCapaCount = estimatedOpenCapa(mine)

      const el = document.createElement('div')
      el.className = 'mine-marker'
      el.setAttribute('role', 'button')
      el.setAttribute('aria-label', `${mine.code} — ${riskLabel[mine.riskLevel]} risk`)
      Object.assign(el.style, {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: color,
        border: '2px solid var(--color-surface)',
        cursor: 'pointer',
        boxShadow: `0 0 0 4px color-mix(in oklab, ${color} 28%, transparent), 0 2px 6px rgb(0 0 0 / 0.35)`,
        transition: 'width 150ms ease, height 150ms ease',
      })

      // Popup content — themed via .kd-map-popup classes in index.css
      const popupNode = document.createElement('div')
      popupNode.className = 'kd-map-popup'
      const code = document.createElement('div')
      code.className = 'kd-map-popup__code'
      code.textContent = mine.code
      const name = document.createElement('div')
      name.className = 'kd-map-popup__name'
      name.textContent = mine.name
      const rows = document.createElement('div')
      rows.className = 'kd-map-popup__rows'
      const addRow = (label: string, value: string, dot?: string) => {
        const row = document.createElement('div')
        row.className = 'kd-map-popup__row'
        const l = document.createElement('span')
        l.textContent = label
        const v = document.createElement('span')
        if (dot) {
          v.className = 'kd-map-popup__risk'
          const d = document.createElement('i')
          d.className = 'kd-map-popup__dot'
          d.style.backgroundColor = dot
          v.append(d, document.createTextNode(value))
        } else {
          v.textContent = value
        }
        row.append(l, v)
        rows.append(row)
      }
      addRow('Risk', mine.riskLevel, color)
      addRow('Compliance', `${mine.complianceScore}%`)
      addRow('Open CAPA', String(openCapaCount))
      const btn = document.createElement('button')
      btn.className = 'kd-map-popup__btn'
      btn.type = 'button'
      btn.textContent = 'View mine'
      btn.addEventListener('click', () => navigate(`/mines/${mine.id}`))
      popupNode.append(code, name, rows, btn)

      const popup = new maplibregl.Popup({ offset: 14, closeButton: true, maxWidth: '260px' }).setDOMContent(popupNode)
      popup.on('open', () => setSelectedId(mine.id))

      const marker = new maplibregl.Marker({ element: el }).setLngLat(mine.coordinates).setPopup(popup).addTo(map.current!)
      markers.current.set(mine.id, { marker, el })
    })
  }, [filteredMines, navigate])

  // Reflect selected mine on its marker
  useEffect(() => {
    markers.current.forEach(({ el }, id) => {
      const selected = id === selectedId
      el.style.width = selected ? '22px' : '16px'
      el.style.height = selected ? '22px' : '16px'
      el.style.zIndex = selected ? '2' : ''
    })
  }, [selectedId, filteredMines])

  const filterControls = (
    <>
      <Select aria-label="Risk level" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className={cn(!isMobile && 'w-[128px]')}>
        <option value="ALL">All Risks</option>
        <option value="HIGH">High Risk</option>
        <option value="MEDIUM">Medium Risk</option>
        <option value="LOW">Low Risk</option>
      </Select>
      <Select aria-label="Subsidiary" value={subsidiaryFilter} onChange={(e) => setSubsidiaryFilter(e.target.value)} className={cn(!isMobile && 'w-[150px]')}>
        <option value="ALL">All Subsidiaries</option>
        {subsidiaries.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Select aria-label="Mine type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={cn(!isMobile && 'w-[140px]')}>
        <option value="ALL">All Types</option>
        {types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
    </>
  )

  const legend = (
    <div
      className={cn(
        'absolute z-10 rounded-lg border border-border bg-surface-raised/95 shadow-pop backdrop-blur',
        isMobile ? 'bottom-2 left-2 px-2.5 py-2' : 'bottom-6 left-4 px-3.5 py-3'
      )}
    >
      {!isMobile && <div className="kd-overline mb-2">Risk severity</div>}
      <ul className={cn('flex text-[12px]', isMobile ? 'gap-3' : 'flex-col gap-1.5')}>
        {(['HIGH', 'MEDIUM', 'LOW'] as const).map((level) => (
          <li key={level} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full ring-2 ring-surface-raised" style={{ backgroundColor: riskVar[level] }} aria-hidden="true" />
            <span className="text-text-secondary">{riskLabel[level]}</span>
            {!isMobile && <span className="ml-auto pl-4 font-semibold text-text-primary kd-num">{riskCounts[level]}</span>}
          </li>
        ))}
      </ul>
    </div>
  )

  const mineList = (
    <div className={cn('space-y-2', isMobile ? 'p-3' : 'p-3')}>
      {sortedMines.map((mine, idx) => (
        <MineCard key={mine.id} mine={mine} rank={idx + 1} selected={selectedId === mine.id} onSelect={() => focusMine(mine)} onOpen={() => navigate(`/mines/${mine.id}`)} />
      ))}
      {sortedMines.length === 0 && <EmptyState compact icon={SearchX} title="No mines match your filters." description="Adjust or reset the filters to see monitored sites." actionLabel="Reset view" onAction={resetView} />}
    </div>
  )

  return (
    <div className={cn('flex h-full overflow-hidden bg-canvas', isMobile ? 'flex-col' : 'flex-row')}>
      {/* Map Area */}
      <div className={cn('relative flex flex-col', isMobile ? 'kd-map-compact h-[46dvh] min-h-[280px] shrink-0' : 'min-w-0 flex-1')}>
        {/* Filter toolbar */}
        {isMobile ? (
          <div className="absolute left-2 right-2 top-2 z-10 flex items-center gap-2">
            <SearchInput value={search} onValueChange={setSearch} placeholder="Search mines..." wrapperClassName="flex-1" className="bg-surface-raised/95 shadow-pop backdrop-blur" />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Filters"
              aria-expanded={showFilters}
              className={cn('shrink-0 shadow-pop', showFilters && 'border-amber/50 text-amber')}
            >
              <SlidersHorizontal />
            </Button>
            <Button variant="secondary" size="icon" onClick={resetView} aria-label="Reset view" className="shrink-0 shadow-pop">
              <RotateCcw />
            </Button>
          </div>
        ) : (
          <div className="absolute left-4 right-14 top-4 z-10 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-raised/95 p-2 shadow-pop backdrop-blur">
            <SearchInput value={search} onValueChange={setSearch} placeholder="Search mines..." wrapperClassName="w-52" />
            {filterControls}
            <div className="flex-1" />
            <Button variant="ghost" size="icon" onClick={resetView} aria-label="Reset view" title="Reset view">
              <RotateCcw />
            </Button>
          </div>
        )}

        {isMobile && showFilters && (
          <div className="absolute left-2 right-2 top-14 z-10 space-y-2 rounded-lg border border-border bg-surface-raised p-3 shadow-pop animate-pop-in">
            {filterControls}
          </div>
        )}

        {/* Map Container */}
        <div ref={mapContainer} className="flex-1" aria-label="Map of monitored mines" role="region" />

        {legend}
      </div>

      {/* Ranked panel */}
      {isMobile ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-border bg-surface">
          <button
            type="button"
            onClick={() => setShowMineList(!showMineList)}
            aria-expanded={showMineList}
            className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 text-left"
          >
            <div>
              <h2 className="text-[14px] font-semibold text-text-primary">Risk-ranked mines</h2>
              <p className="mt-0.5 text-[12px] text-text-muted kd-num">
                {sortedMines.length} mines · {riskCounts.HIGH} high · {riskCounts.MEDIUM} medium · {riskCounts.LOW} low
              </p>
            </div>
            {showMineList ? <ChevronDown className="h-4 w-4 text-text-muted" /> : <ChevronUp className="h-4 w-4 text-text-muted" />}
          </button>
          {showMineList && <div className="flex-1 overflow-y-auto">{mineList}</div>}
        </div>
      ) : (
        <aside aria-label="Risk-ranked mines" className="flex w-[360px] shrink-0 flex-col border-l border-border bg-surface xl:w-[380px]">
          <div className="shrink-0 border-b border-border px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-semibold text-text-primary">Risk-ranked mines</h2>
                <p className="mt-0.5 text-[12px] text-text-muted">Monitored sites sorted by priority.</p>
              </div>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[11px] font-semibold text-amber kd-num">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {/* Risk summary */}
            <dl className="mt-3 grid grid-cols-3 gap-2">
              {(['HIGH', 'MEDIUM', 'LOW'] as const).map((level) => (
                <div key={level} className="rounded-md border border-border bg-inset px-3 py-2">
                  <dt className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: riskVar[level] }} aria-hidden="true" />
                    {riskLabel[level]}
                  </dt>
                  <dd className="mt-0.5 text-[18px] font-semibold leading-6 text-text-primary kd-num">{riskCounts[level]}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex-1 overflow-y-auto">{mineList}</div>
        </aside>
      )}
    </div>
  )
}

function MineCard({ mine, rank, selected, onSelect, onOpen }: { mine: MineItem; rank: number; selected: boolean; onSelect: () => void; onOpen: () => void }) {
  const tone = complianceTone(mine.complianceScore)
  const openCapaCount = estimatedOpenCapa(mine)

  const card = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-surface transition-colors',
        selected ? 'border-amber/60 bg-amber-soft/40' : 'border-border hover:border-border-strong hover:bg-surface-2'
      )}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: riskVar[mine.riskLevel] }} />
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${mine.code} ${mine.name}, ${riskLabel[mine.riskLevel]} risk. Show on map`}
        onClick={onSelect}
        className="block w-full py-3 pl-4 pr-3 text-left focus-visible:outline-offset-[-2px]"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-neutral text-[10px] font-semibold text-text-secondary kd-num">{rank}</span>
            <span className="min-w-0">
              <span className="block font-mono text-[13px] font-semibold text-text-primary">{mine.code}</span>
              <span className="block truncate text-[12px] text-text-muted">{mine.name}</span>
            </span>
          </span>
          <StatusBadge status={mine.riskLevel} />
        </span>

        <span className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-2.5">
          <span>
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <ShieldAlert className="h-3 w-3" /> Compliance
            </span>
            <span className="mt-1 flex items-center gap-2">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-chart-track">
                <span className={cn('block h-full rounded-full', toneFill[tone])} style={{ width: `${mine.complianceScore}%` }} />
              </span>
              <span className={cn('text-[12px] font-semibold kd-num', toneText[tone])}>{mine.complianceScore}%</span>
            </span>
          </span>
          <span>
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <Activity className="h-3 w-3" /> Open CAPA
            </span>
            <span className="mt-0.5 block text-[13px] font-semibold text-text-primary kd-num">{openCapaCount}</span>
          </span>
        </span>
      </button>

      {selected && (
        <div className="px-3 pb-3 pl-4">
          <button
            type="button"
            onClick={onOpen}
            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-surface text-[12px] font-semibold text-text-primary transition-colors hover:border-border-strong"
          >
            <MapPin className="h-3.5 w-3.5 text-amber" /> Open mine profile
          </button>
        </div>
      )}
    </div>
  )

  if (mine.code === 'WCL-04') {
    return (
      <DemoHighlight step={2} tooltip="The risk engine prioritizes WCL-04 for attention.">
        {card}
      </DemoHighlight>
    )
  }

  return card
}
