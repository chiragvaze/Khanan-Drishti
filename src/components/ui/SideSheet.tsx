import React, { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useDialog } from '../../lib/useDialog'

interface SideSheetProps {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  /** Secondary line under the title (IDs, mine code…). */
  subtitle?: React.ReactNode
  /** Badges rendered beside the title. */
  badges?: React.ReactNode
  /** Short uppercase context label above the title, e.g. "CAPA detail". */
  eyebrow?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  width?: 'md' | 'lg'
  /**
   * During the guided demo the sheet content is spotlighted, so Escape is
   * reserved for exiting the demo.
   */
  closeOnEscape?: boolean
}

const widths = { md: 'sm:w-[520px]', lg: 'sm:w-[600px]' }

/**
 * Right-hand detail panel used by CAPA, Compliance & Risk and Contractors.
 * Always mounted so it can slide in/out; hidden from assistive tech when closed.
 */
export function SideSheet({ open, onClose, title, subtitle, badges, eyebrow, children, footer, width = 'lg', closeOnEscape = true }: SideSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useDialog(open, onClose, panelRef, { closeOnEscape, focusContainer: true })

  // Portal to <body> so page layout (spacing utilities, stacking contexts) never affects the overlay
  return createPortal(
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-overlay backdrop-blur-[2px] transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        inert={!open}
        tabIndex={-1}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-surface-raised shadow-pop transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none',
          widths[width],
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {open && (
          <>
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                {eyebrow && <div className="kd-overline mb-1">{eyebrow}</div>}
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id={titleId} className="text-[17px] font-semibold leading-6 text-text-primary">
                    {title}
                  </h2>
                  {badges}
                </div>
                {subtitle && <div className="mt-1 text-[12px] text-text-muted">{subtitle}</div>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pb-[var(--kd-demo-bar-h,0px)]">{children}</div>
            {footer && <div className="shrink-0 border-t border-border bg-surface-2 px-5 py-3 pb-safe">{footer}</div>}
          </>
        )}
      </div>
    </>,
    document.body
  )
}

/** Titled block inside a side sheet or detail pane. */
export function SheetSection({ title, icon, action, children, className }: { title: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="kd-overline flex items-center gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5">
          {icon}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Label/value pair used in detail panes. */
export function DetailItem({ label, children, icon, className }: { label: string; children: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted [&_svg]:h-3.5 [&_svg]:w-3.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-[13px] text-text-primary">{children}</dd>
    </div>
  )
}
