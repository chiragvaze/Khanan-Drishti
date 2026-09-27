import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  /** Small context line above the title, e.g. the active role or scope. */
  eyebrow?: ReactNode
  /** Inline metadata shown next to the title (badges, codes). */
  meta?: ReactNode
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, eyebrow, meta, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <div className="kd-overline mb-1.5">{eyebrow}</div>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.015em] text-text-primary sm:text-[26px]">{title}</h1>
          {meta}
        </div>
        {description && <p className="mt-1 max-w-3xl text-[14px] leading-5 text-text-secondary">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

/** Header for a section of a page that is not wrapped in a card. */
export function SectionHeader({ title, description, children, className }: { title: string; description?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-2', className)}>
      <div className="min-w-0">
        <h2 className="text-[16px] font-semibold leading-6 text-text-primary">{title}</h2>
        {description && <p className="text-[13px] text-text-muted">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
