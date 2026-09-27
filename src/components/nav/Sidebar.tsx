import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useRole } from '../../contexts/RoleContext'
import KhananLogo from '../shared/KhananLogo'
import { ThemeSegmented } from '../ui/ThemeToggle'
import { useDialog } from '../../lib/useDialog'
import { navSections, systemNavItems, isNavItemActive } from './navConfig'
import type { NavItem } from './navConfig'

interface SidebarProps {
  isMobile: boolean
  isOpen: boolean
  onClose: () => void
}

const COLLAPSE_KEY = 'khanan-sidebar-collapsed'

const roleLabels = {
  MINE_OFFICIAL: 'Mine Official',
  CORPORATE_MANAGEMENT: 'Corporate Management',
  REGULATORY_AUTHORITY: 'Regulatory Authority',
} as const

export default function Sidebar({ isMobile, isOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const location = useLocation()
  const { role } = useRole()
  const drawerRef = useRef<HTMLElement>(null)

  const sections = navSections
    .map((section) => ({ ...section, items: section.items.filter((item) => item.roles.includes(role)) }))
    .filter((section) => section.items.length > 0)

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, String(!c))
      } catch {
        /* ignore */
      }
      return !c
    })
  }

  useDialog(isMobile && isOpen, onClose, drawerRef)

  // Close drawer on route change
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // ──────────────────────────────────────────────
  // Mobile Drawer
  // ──────────────────────────────────────────────
  if (isMobile) {
    if (!isOpen) return null

    return (
      <>
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-[2px] animate-fade-in-backdrop" onClick={onClose} aria-hidden="true" />

        <aside
          ref={drawerRef}
          className="fixed inset-y-0 left-0 z-50 flex w-[288px] max-w-[85vw] flex-col border-r border-border bg-surface shadow-pop animate-slide-in-left"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          tabIndex={-1}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <KhananLogo variant="lockup" size="sm" />
            <button
              onClick={onClose}
              className="-mr-2 flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="border-b border-border px-4 py-3">
            <div className="kd-overline">Signed in as</div>
            <div className="mt-0.5 text-[13px] font-medium text-text-primary">{roleLabels[role]}</div>
          </div>

          <nav aria-label="Primary" className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
            {sections.map((section) => (
              <div key={section.id} className="mb-4 last:mb-0">
                <div className="kd-overline px-3 pb-1.5">{section.label}</div>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <SidebarLink key={item.path} item={item} active={isNavItemActive(item.path, location.pathname)} onNavigate={onClose} size="lg" />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="space-y-3 border-t border-border px-3 py-3 pb-safe">
            <div className="space-y-0.5">
              {systemNavItems.map((item) => (
                <SidebarLink key={item.path} item={item} active={isNavItemActive(item.path, location.pathname)} onNavigate={onClose} size="lg" />
              ))}
            </div>
            <div className="px-1">
              <div className="kd-overline mb-1.5 px-2">Appearance</div>
              <ThemeSegmented />
            </div>
          </div>
        </aside>
      </>
    )
  }

  // ──────────────────────────────────────────────
  // Desktop Sidebar
  // ──────────────────────────────────────────────
  return (
    <aside
      className={cn(
        'z-30 flex h-full shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ease-out',
        collapsed ? 'w-[64px]' : 'w-[248px]'
      )}
    >
      {/* Brand */}
      <div className={cn('flex h-[60px] shrink-0 items-center border-b border-border', collapsed ? 'justify-center px-2' : 'px-4')}>
        <NavLink to="/dashboard" aria-label="Khanan Drishti — Command Center" className="rounded-md">
          {collapsed ? <KhananLogo variant="icon" size="sm" /> : <KhananLogo variant="lockup" size="sm" />}
        </NavLink>
      </div>

      {/* Main nav */}
      {/* Collapsed rail doesn't scroll so hover tooltips aren't clipped */}
      <nav aria-label="Primary" className={cn('flex-1 py-3', collapsed ? 'overflow-visible px-2' : 'overflow-y-auto overflow-x-hidden px-3')}>
        {sections.map((section, idx) => (
          <div key={section.id} className={cn(idx > 0 && (collapsed ? 'mt-3 border-t border-border pt-3' : 'mt-5'))}>
            {!collapsed && <div className="kd-overline px-3 pb-1.5">{section.label}</div>}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarLink key={item.path} item={item} active={isNavItemActive(item.path, location.pathname)} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* System nav */}
      <div className={cn('space-y-0.5 border-t border-border py-3', collapsed ? 'px-2' : 'px-3')}>
        {systemNavItems.map((item) => (
          <SidebarLink key={item.path} item={item} active={isNavItemActive(item.path, location.pathname)} collapsed={collapsed} />
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        className={cn(
          'flex h-11 shrink-0 items-center gap-3 border-t border-border text-[12px] text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary',
          collapsed ? 'justify-center' : 'px-6'
        )}
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  )
}

function SidebarLink({
  item,
  active,
  collapsed = false,
  onNavigate,
  size = 'md',
}: {
  item: Omit<NavItem, 'roles'>
  active: boolean
  collapsed?: boolean
  onNavigate?: () => void
  size?: 'md' | 'lg'
}) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-md font-medium transition-colors duration-150',
        size === 'lg' ? 'h-10 px-3 text-[14px]' : 'h-9 px-3 text-[13px]',
        collapsed && 'justify-center px-0',
        active ? 'bg-amber-soft text-text-primary' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
      )}
    >
      {active && <span aria-hidden="true" className={cn('absolute top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-accent', collapsed ? '-left-2' : '-left-3')} />}
      <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-colors', active ? 'text-amber' : 'text-text-muted group-hover:text-text-secondary')} strokeWidth={1.9} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {collapsed && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-surface-raised px-2 py-1 text-[12px] font-medium text-text-primary opacity-0 shadow-pop transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {item.label}
        </span>
      )}
    </NavLink>
  )
}
