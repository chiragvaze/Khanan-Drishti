import type { RiskLevel, CAPAStatus, InspectionStatus, ComplianceStatus } from '../../data/types'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export type BadgeTone = 'danger' | 'warning' | 'success' | 'info' | 'neutral' | 'accent'

interface StatusBadgeProps {
  status: RiskLevel | CAPAStatus | InspectionStatus | ComplianceStatus | string
  size?: 'sm' | 'md'
  /** Hide the leading status dot (e.g. in very dense cells). */
  hideDot?: boolean
  className?: string
}

const toneClasses: Record<BadgeTone, { badge: string; dot: string }> = {
  danger: { badge: 'bg-danger-soft text-danger border-danger/25', dot: 'bg-danger-solid' },
  warning: { badge: 'bg-warning-soft text-warning border-warning/25', dot: 'bg-warning-solid' },
  success: { badge: 'bg-success-soft text-success border-success/25', dot: 'bg-success-solid' },
  info: { badge: 'bg-info-soft text-info border-info/25', dot: 'bg-info-solid' },
  accent: { badge: 'bg-amber-soft text-amber border-amber/25', dot: 'bg-accent' },
  neutral: { badge: 'bg-neutral text-text-secondary border-border', dot: 'bg-text-muted' },
}

// Single source of truth for status semantics across the product.
const statusConfig: Record<string, { tone: BadgeTone; label?: string }> = {
  // Risk
  CRITICAL: { tone: 'danger' },
  HIGH: { tone: 'danger' },
  MEDIUM: { tone: 'warning' },
  LOW: { tone: 'success' },
  // Workflow
  OPEN: { tone: 'warning' },
  IN_PROGRESS: { tone: 'info', label: 'In Progress' },
  ESCALATED: { tone: 'danger' },
  OVERDUE: { tone: 'danger' },
  CLOSED: { tone: 'success' },
  COMPLETED: { tone: 'success' },
  SCHEDULED: { tone: 'info' },
  MONITORING: { tone: 'info' },
  PENDING_REVIEW: { tone: 'warning', label: 'Pending Review' },
  // Compliance
  COMPLIANT: { tone: 'success' },
  NON_COMPLIANT: { tone: 'danger', label: 'Non-Compliant' },
  PARTIALLY_COMPLIANT: { tone: 'warning', label: 'Partial' },
  UNDER_REVIEW: { tone: 'warning', label: 'Under Review' },
  PASS: { tone: 'success' },
  FAIL: { tone: 'danger' },
  NA: { tone: 'neutral', label: 'N/A' },
  // Entity status
  ACTIVE: { tone: 'success' },
  INACTIVE: { tone: 'neutral' },
  SUSPENDED: { tone: 'danger' },
  UNDER_MAINTENANCE: { tone: 'warning', label: 'Maintenance' },
  HIGH_RISK: { tone: 'danger', label: 'High Risk' },
  BLACKLISTED: { tone: 'danger' },
  // Observations / evidence / reports
  CAPA_ASSIGNED: { tone: 'info', label: 'CAPA Assigned' },
  RESOLVED: { tone: 'success' },
  DRAFT: { tone: 'neutral' },
  GENERATED: { tone: 'success' },
  SUBMITTED: { tone: 'info' },
  APPROVED: { tone: 'success' },
  PENDING: { tone: 'warning' },
  ANALYZED: { tone: 'success' },
  FLAGGED: { tone: 'danger' },
  VERIFIED: { tone: 'success' },
  NEW: { tone: 'warning' },
  ACKNOWLEDGED: { tone: 'info' },
  ACTED_UPON: { tone: 'success', label: 'Acted Upon' },
  DISMISSED: { tone: 'neutral' },
  INFO: { tone: 'info' },
}

export function StatusBadge({ status, size = 'sm', hideDot = false, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { tone: 'neutral' as BadgeTone }
  const label = config.label || status.replace(/_/g, ' ')
  const tone = toneClasses[config.tone]

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[5px] border font-semibold uppercase tracking-[0.04em]',
        tone.badge,
        size === 'sm' ? 'h-5 px-1.5 text-[10.5px]' : 'h-6 px-2 text-[11px]',
        className
      )}
    >
      {!hideDot && <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} />}
      {label}
    </span>
  )
}

/** Generic neutral/tonal tag for metadata (mine type, domain, file type…). */
export function Tag({ children, tone = 'neutral', className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center whitespace-nowrap rounded-[5px] border px-1.5 text-[11px] font-medium',
        toneClasses[tone].badge,
        tone === 'neutral' && 'bg-inset',
        className
      )}
    >
      {children}
    </span>
  )
}
