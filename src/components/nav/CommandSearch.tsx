import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Camera, ClipboardCheck, CornerDownLeft, Database, History, Search, ShieldCheck, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useDialog } from '../../lib/useDialog'

interface SearchResult {
  type: string
  title: string
  icon: LucideIcon
  tone: string
  link: string
}

// Prototype search index — behaviour unchanged from the original header search.
const getMockSearchResults = (query: string): SearchResult[] => {
  if (!query) return []
  const q = query.toLowerCase()
  if (q.includes('wcl-04') || q.includes('wcl')) {
    return [
      { type: 'Mine', title: 'WCL-04 — Wani Opencast Extension', icon: Database, tone: 'text-info', link: '/mines/mine-wcl-04' },
      { type: 'Risk', title: 'CRITICAL: Ventilation failure imminent', icon: AlertTriangle, tone: 'text-danger', link: '/ai-insights' },
      { type: 'CAPA', title: 'Ventilation restoration CAPA (Overdue)', icon: ShieldCheck, tone: 'text-warning', link: '/capa' },
      { type: 'Inspections', title: 'Routine inspection — 4 observations', icon: ClipboardCheck, tone: 'text-text-secondary', link: '/inspections' },
      { type: 'Evidence', title: 'KD-E102 (Photo)', icon: Camera, tone: 'text-text-secondary', link: '/evidence' },
    ]
  }
  return [{ type: 'General', title: `Search results for "${query}"`, icon: Search, tone: 'text-text-muted', link: '#' }]
}

const RECENT_KEY = 'khanan-recent-searches'
type RecentItem = Pick<SearchResult, 'type' | 'title' | 'link'>

function readRecent(): RecentItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.slice(0, 5) : []
  } catch {
    return []
  }
}

function saveRecent(item: RecentItem) {
  try {
    const next = [item, ...readRecent().filter((r) => r.link !== item.link || r.title !== item.title)].slice(0, 5)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

/** Mount only while open so every opening starts from a clean state. */
export function CommandSearch({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recent] = useState<RecentItem[]>(readRecent)

  useDialog(true, onClose, panelRef)

  const results = useMemo(() => getMockSearchResults(query), [query])
  const list: RecentItem[] = query ? results : recent

  const select = (item: RecentItem) => {
    if (item.link !== '#') {
      saveRecent({ type: item.type, title: item.title, link: item.link })
      navigate(item.link)
    }
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, list.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && list[activeIndex]) {
      e.preventDefault()
      select(list[activeIndex])
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center sm:px-4 sm:pt-[12vh]">
      <div className="absolute inset-0 bg-overlay backdrop-blur-[2px] animate-fade-in-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search Khanan Drishti"
        className="relative flex h-full w-full flex-col overflow-hidden bg-surface-raised shadow-pop animate-pop-in sm:h-auto sm:max-h-[70vh] sm:max-w-[620px] sm:rounded-xl sm:border sm:border-border"
      >
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <Search className="h-[18px] w-[18px] shrink-0 text-text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            data-autofocus
            type="text"
            role="combobox"
            aria-expanded={list.length > 0}
            aria-controls="kd-search-results"
            aria-activedescendant={list[activeIndex] ? `kd-search-opt-${activeIndex}` : undefined}
            aria-label="Search mines, CAPA, evidence, inspections"
            placeholder="Search mines, CAPA, evidence, inspections…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={onKeyDown}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none focus-visible:outline-none"
          />
          <kbd className="hidden rounded border border-border bg-inset px-1.5 py-0.5 font-mono text-[10px] text-text-muted sm:inline">Esc</kbd>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="-mr-1 flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text-primary sm:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {list.length > 0 && (
            <div className="kd-overline flex items-center gap-1.5 px-2 pb-1.5 pt-1">
              {!query && <History className="h-3 w-3" />}
              {query ? 'Results' : 'Recent'}
            </div>
          )}
          <ul id="kd-search-results" role="listbox" aria-label={query ? 'Search results' : 'Recent searches'}>
            {list.map((item, idx) => {
              const full = results.find((r) => r.title === item.title && r.link === item.link)
              const Icon = full?.icon ?? History
              const active = idx === activeIndex
              return (
                <li key={`${item.link}-${item.title}`} id={`kd-search-opt-${idx}`} role="option" aria-selected={active}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => select(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
                      active ? 'bg-surface-2' : 'hover:bg-surface-2'
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-inset">
                      <Icon className={cn('h-4 w-4', full?.tone ?? 'text-text-muted')} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-text-primary">{item.title}</span>
                      <span className="block text-[11px] text-text-muted">{item.type}</span>
                    </span>
                    {active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />}
                  </button>
                </li>
              )
            })}
          </ul>

          {!query && recent.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-[13px] font-medium text-text-primary">Search Khanan Drishti</p>
              <p className="mt-1 text-[12px] text-text-muted">Find mines, CAPAs, evidence and inspections — for example, type a mine code.</p>
            </div>
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-4 border-t border-border bg-surface-2 px-4 py-2 text-[11px] text-text-muted sm:flex">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-surface px-1 font-mono">↑</kbd>
            <kbd className="rounded border border-border bg-surface px-1 font-mono">↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-surface px-1 font-mono">↵</kbd> open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-surface px-1 font-mono">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}
