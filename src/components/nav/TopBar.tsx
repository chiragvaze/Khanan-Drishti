import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Info,
  Menu,
  Play,
  Search,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useRole } from '../../contexts/RoleContext'
import type { Role } from '../../contexts/RoleContext'
import { useDemo } from '../../contexts/DemoContext'
import KhananLogo from '../shared/KhananLogo'
import { ThemeSegmented, ThemeToggle } from '../ui/ThemeToggle'
import { Select } from '../ui/Field'
import { CommandSearch } from './CommandSearch'
import { resolveRoute } from './navConfig'
import { useDismiss } from '../../lib/useDismiss'
import { mines } from '../../data/mines'

interface TopBarProps {
  isMobile: boolean
  onMenuToggle: () => void
}

const subsidiaries = [
  'All Subsidiaries',
  'WCL — Western Coalfields',
  'SECL — South Eastern Coalfields',
  'NCL — Northern Coalfields',
  'ECL — Eastern Coalfields',
  'MCL — Mahanadi Coalfields',
  'CCL — Central Coalfields',
  'BCCL — Bharat Coking Coal',
]

const roleProfiles: Record<Role, { name: string; title: string; label: string; initials: string }> = {
  MINE_OFFICIAL: { name: 'A.K. Sharma', title: 'Mine Manager, WCL-04', label: 'Mine Official', initials: 'AS' },
  CORPORATE_MANAGEMENT: { name: 'Shri V.K. Patel', title: 'Director (Technical), CIL', label: 'Corporate Management', initials: 'VP' },
  REGULATORY_AUTHORITY: { name: 'Dr. R. Singh', title: 'Director General, DGMS', label: 'Regulatory Authority', initials: 'RS' },
}

type Severity = 'HIGH' | 'MEDIUM' | 'INFO'

const notifications: { id: string; title: string; description: string; time: string; severity: Severity; link: string }[] = [
  {
    id: 'n1',
    title: 'WCL-04 CAPA crossed SLA threshold',
    description: 'Ventilation restoration CAPA (CAPA-2026-0042) is overdue.',
    time: '10m ago',
    severity: 'HIGH',
    link: '/capa',
  },
  {
    id: 'n2',
    title: 'New inspection evidence requires verification',
    description: 'KD-E103 (Video) uploaded by Inspector.',
    time: '2h ago',
    severity: 'MEDIUM',
    link: '/evidence',
  },
  {
    id: 'n3',
    title: 'Monthly compliance report generated',
    description: 'September 2026 report is ready for review.',
    time: '5h ago',
    severity: 'INFO',
    link: '/reports',
  },
]

const severityGroups: { severity: Severity; label: string; Icon: LucideIcon; tone: string }[] = [
  { severity: 'HIGH', label: 'Critical', Icon: AlertOctagon, tone: 'text-danger bg-danger-soft border-danger/20' },
  { severity: 'MEDIUM', label: 'Attention', Icon: AlertTriangle, tone: 'text-warning bg-warning-soft border-warning/20' },
  { severity: 'INFO', label: 'Informational', Icon: Info, tone: 'text-info bg-info-soft border-info/20' },
]

const iconButton =
  'relative inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary aria-expanded:bg-surface-2 aria-expanded:text-text-primary'

export default function TopBar({ isMobile, onMenuToggle }: TopBarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, setRole } = useRole()
  const { isActive: demoActive, startDemo } = useDemo()

  const [selectedSubsidiary, setSelectedSubsidiary] = useState('All Subsidiaries')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [readIds, setReadIds] = useState<string[]>([])

  const notifRef = useRef<HTMLDivElement>(null)
  const roleRef = useRef<HTMLDivElement>(null)
  const closeNotifications = useCallback(() => setShowNotifications(false), [])
  const closeRoleMenu = useCallback(() => setShowRoleMenu(false), [])
  useDismiss(showNotifications, closeNotifications, [notifRef])
  useDismiss(showRoleMenu, closeRoleMenu, [roleRef])

  const route = resolveRoute(location.pathname)
  const detailCode = route.parent?.path === '/mines' ? mines.find((m) => `/mines/${m.id}` === location.pathname)?.code : undefined
  const currentLabel = detailCode ?? route.page
  const profile = roleProfiles[role]
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length

  // Global Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowNotifications(false)
        setShowRoleMenu(false)
        setShowSearch((s) => !s)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close overlays on route change (state adjusted during render, per React guidance)
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setShowSearch(false)
    setShowNotifications(false)
    setShowRoleMenu(false)
  }

  return (
    <>
      <header
        className={cn(
          'z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface',
          isMobile ? 'h-14 px-2 sm:px-3' : 'h-[60px] px-5 xl:px-6'
        )}
      >
        {/* ── Left: context ─────────────────────────── */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {isMobile ? (
            <>
              <button onClick={onMenuToggle} className={iconButton} aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </button>
              <KhananLogo variant="icon" size="sm" className="h-7 w-7" />
              <span className="ml-1 min-w-0 truncate text-[15px] font-semibold text-text-primary">{currentLabel}</span>
            </>
          ) : (
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
                {route.section && (
                  <li className="flex shrink-0 items-center gap-1.5 text-text-muted">
                    <span>{route.section}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-text-disabled" aria-hidden="true" />
                  </li>
                )}
                {route.parent && (
                  <li className="flex shrink-0 items-center gap-1.5">
                    <Link to={route.parent.path} className="rounded text-text-muted transition-colors hover:text-text-primary">
                      {route.parent.label}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-text-disabled" aria-hidden="true" />
                  </li>
                )}
                <li className="min-w-0 truncate font-semibold text-text-primary" aria-current="page">
                  {currentLabel}
                </li>
              </ol>
            </nav>
          )}
        </div>

        {/* ── Center: search ─────────────────────────── */}
        {!isMobile && (
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            aria-label="Search (Ctrl+K)"
            aria-keyshortcuts="Control+K Meta+K"
            className="group flex h-9 w-[240px] shrink-0 items-center gap-2 rounded-md border border-border bg-field px-3 text-left text-[13px] text-text-muted shadow-card transition-colors hover:border-border-strong 2xl:w-[340px]"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">
              <span className="2xl:hidden">Search…</span>
              <span className="hidden 2xl:inline">Search mines, CAPA, evidence, inspections…</span>
            </span>
            <kbd className="shrink-0 rounded border border-border bg-inset px-1.5 py-px font-mono text-[10px] text-text-muted">Ctrl K</kbd>
          </button>
        )}

        {/* ── Right: actions ─────────────────────────── */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {isMobile && (
            <button onClick={() => setShowSearch(true)} className={iconButton} aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </button>
          )}

          {/* Subsidiary scope */}
          {role !== 'MINE_OFFICIAL' && !isMobile && (
            <Select
              aria-label="Subsidiary scope"
              value={selectedSubsidiary}
              onChange={(e) => setSelectedSubsidiary(e.target.value)}
              wrapperClassName="hidden xl:block ml-1.5"
              className="w-[184px] text-text-secondary"
            >
              {subsidiaries.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </Select>
          )}

          {/* Demo Mode trigger */}
          {!demoActive && !isMobile && (
            <button
              type="button"
              onClick={startDemo}
              title="Start guided demo"
              className="ml-1.5 inline-flex h-9 items-center gap-2 rounded-md border border-amber/30 bg-amber-soft px-2.5 text-[12px] font-semibold text-amber transition-colors hover:border-amber/60 xl:px-3"
            >
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              <span className="hidden xl:inline">Demo mode</span>
              <span className="sr-only xl:hidden">Demo mode</span>
            </button>
          )}

          {!isMobile && <span className="mx-1.5 h-6 w-px bg-border" aria-hidden="true" />}

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications((s) => !s)
                setShowRoleMenu(false)
              }}
              className={iconButton}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={showNotifications}
              aria-haspopup="dialog"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-solid px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-surface kd-num">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div
                role="dialog"
                aria-label="Notification center"
                className={cn(
                  'z-50 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-pop animate-pop-in',
                  isMobile ? 'fixed inset-x-2 top-[60px]' : 'absolute right-0 top-full mt-2 w-[380px]'
                )}
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-text-primary">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-neutral px-1.5 text-[11px] font-semibold text-text-secondary kd-num">{unreadCount} new</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setReadIds(notifications.map((n) => n.id))}
                    disabled={unreadCount === 0}
                    className="rounded text-[12px] font-medium text-text-muted transition-colors hover:text-text-primary disabled:opacity-50"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-[min(420px,70vh)] overflow-y-auto">
                  {severityGroups.map((group) => {
                    const items = notifications.filter((n) => n.severity === group.severity)
                    if (items.length === 0) return null
                    return (
                      <div key={group.severity}>
                        <div className="kd-overline border-b border-border bg-surface-2 px-4 py-1.5">{group.label}</div>
                        {items.map((n) => {
                          const unread = !readIds.includes(n.id)
                          return (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => {
                                setReadIds((ids) => (ids.includes(n.id) ? ids : [...ids, n.id]))
                                setShowNotifications(false)
                                navigate(n.link)
                              }}
                              className="group flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-2"
                            >
                              <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border', group.tone)}>
                                <group.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-start justify-between gap-3">
                                  <span className={cn('text-[13px] leading-5 text-text-primary', unread ? 'font-semibold' : 'font-medium')}>{n.title}</span>
                                  <span className="mt-0.5 shrink-0 text-[11px] text-text-muted kd-num">{n.time}</span>
                                </span>
                                <span className="mt-0.5 line-clamp-2 block text-[12px] leading-4 text-text-secondary">{n.description}</span>
                              </span>
                              {unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Theme */}
          {!isMobile && <ThemeToggle />}

          {!isMobile && <span className="mx-1.5 h-6 w-px bg-border" aria-hidden="true" />}

          {/* Profile / Role switcher */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => {
                setShowRoleMenu((s) => !s)
                setShowNotifications(false)
              }}
              aria-haspopup="menu"
              aria-expanded={showRoleMenu}
              aria-label={`Account menu — ${profile.name}, ${profile.label}`}
              className="flex h-10 items-center gap-2.5 rounded-md py-1 pl-1 pr-1.5 transition-colors hover:bg-surface-2 aria-expanded:bg-surface-2"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-neutral text-[12px] font-semibold text-text-primary">
                {profile.initials}
              </span>
              {!isMobile && (
                <span className="hidden min-w-0 flex-col text-left leading-tight min-[1440px]:flex">
                  <span className="max-w-[160px] truncate text-[13px] font-medium text-text-primary">{profile.name}</span>
                  <span className="max-w-[160px] truncate text-[11px] text-text-muted">{profile.label}</span>
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
            </button>

            {showRoleMenu && (
              <div role="menu" aria-label="Account" className="absolute right-0 top-full z-50 mt-2 w-[288px] overflow-hidden rounded-xl border border-border bg-surface-raised shadow-pop animate-pop-in">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-neutral text-[13px] font-semibold text-text-primary">
                    {profile.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-text-primary">{profile.name}</div>
                    <div className="truncate text-[12px] text-text-muted">{profile.title}</div>
                  </div>
                </div>

                <div className="py-1.5">
                  <div className="kd-overline px-4 pb-1 pt-1.5">Demo role</div>
                  {(Object.keys(roleProfiles) as Role[]).map((r) => (
                    <button
                      key={r}
                      role="menuitemradio"
                      aria-checked={role === r}
                      onClick={() => {
                        setRole(r)
                        setShowRoleMenu(false)
                        navigate('/')
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-2"
                    >
                      <span className="min-w-0">
                        <span className={cn('block text-[13px] font-medium', role === r ? 'text-text-primary' : 'text-text-secondary')}>{roleProfiles[r].label}</span>
                        <span className="block truncate text-[11px] text-text-muted">{roleProfiles[r].title}</span>
                      </span>
                      {role === r && <Check className="h-4 w-4 shrink-0 text-amber" aria-hidden="true" />}
                    </button>
                  ))}
                </div>

                {isMobile && (
                  <div className="space-y-2 border-t border-border p-3">
                    <ThemeSegmented />
                    {!demoActive && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          startDemo()
                          setShowRoleMenu(false)
                        }}
                        className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-amber/30 bg-amber-soft text-[13px] font-semibold text-amber"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> Start demo mode
                      </button>
                    )}
                  </div>
                )}

                <div className="border-t border-border py-1.5">
                  <Link role="menuitem" to="/settings" onClick={() => setShowRoleMenu(false)} className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <Link role="menuitem" to="/help" onClick={() => setShowRoleMenu(false)} className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary">
                    <HelpCircle className="h-4 w-4" /> Help & support
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showSearch && <CommandSearch onClose={() => setShowSearch(false)} />}
    </>
  )
}
