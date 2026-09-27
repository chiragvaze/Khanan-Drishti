import {
  LayoutDashboard,
  Factory,
  Map,
  ShieldAlert,
  ClipboardCheck,
  HardHat,
  Search,
  Camera,
  Brain,
  FileBarChart,
  Settings,
  HelpCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role } from '../../contexts/RoleContext'

export interface NavItem {
  icon: LucideIcon
  label: string
  path: string
  roles: Role[]
}

export interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

const ALL: Role[] = ['MINE_OFFICIAL', 'CORPORATE_MANAGEMENT', 'REGULATORY_AUTHORITY']

// Visual grouping only — the route structure in router.tsx is unchanged.
export const navSections: NavSection[] = [
  {
    id: 'command',
    label: 'Command',
    items: [
      { icon: LayoutDashboard, label: 'Command Center', path: '/dashboard', roles: ALL },
      { icon: Factory, label: 'Mines', path: '/mines', roles: ALL },
      { icon: Map, label: 'GIS Risk Map', path: '/map', roles: ['CORPORATE_MANAGEMENT', 'REGULATORY_AUTHORITY'] },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    items: [
      { icon: ShieldAlert, label: 'Compliance & Risk', path: '/compliance', roles: ['CORPORATE_MANAGEMENT', 'REGULATORY_AUTHORITY'] },
      { icon: ClipboardCheck, label: 'CAPA', path: '/capa', roles: ['MINE_OFFICIAL', 'CORPORATE_MANAGEMENT'] },
      { icon: Search, label: 'Inspections', path: '/inspections', roles: ALL },
      { icon: Camera, label: 'Evidence', path: '/evidence', roles: ALL },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [
      { icon: HardHat, label: 'Contractors', path: '/contractors', roles: ['MINE_OFFICIAL', 'CORPORATE_MANAGEMENT'] },
      { icon: Brain, label: 'AI Insights', path: '/ai-insights', roles: ['MINE_OFFICIAL', 'CORPORATE_MANAGEMENT'] },
      { icon: FileBarChart, label: 'Reports', path: '/reports', roles: ['CORPORATE_MANAGEMENT', 'REGULATORY_AUTHORITY'] },
    ],
  },
]

export const systemNavItems: Omit<NavItem, 'roles'>[] = [
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help', path: '/help' },
]

export function isNavItemActive(path: string, pathname: string) {
  if (path === '/dashboard') return pathname === '/dashboard' || pathname === '/'
  return pathname === path || pathname.startsWith(`${path}/`)
}

/** Resolve the section + page label for breadcrumbs. */
export function resolveRoute(pathname: string): { section?: string; page: string; parent?: { label: string; path: string } } {
  if (pathname === '/settings') return { section: 'System', page: 'Settings' }
  if (pathname === '/help') return { section: 'System', page: 'Help & Support' }
  for (const section of navSections) {
    for (const item of section.items) {
      if (pathname === item.path || (item.path === '/dashboard' && pathname === '/')) {
        return { section: section.label, page: item.label }
      }
      if (pathname.startsWith(`${item.path}/`)) {
        return { section: section.label, page: 'Detail', parent: { label: item.label, path: item.path } }
      }
    }
  }
  return { page: 'Command Center' }
}
