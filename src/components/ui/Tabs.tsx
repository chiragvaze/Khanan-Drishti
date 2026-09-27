import * as React from 'react'
import { cn } from '../../lib/utils'

export interface TabItem<T extends string = string> {
  value: T
  label: React.ReactNode
  count?: number
  icon?: React.ReactNode
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  'aria-label'?: string
}

/** Compact underline tabs with roving keyboard focus (←/→/Home/End). */
export function Tabs<T extends string>({ items, value, onChange, className, 'aria-label': ariaLabel }: TabsProps<T>) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = -1
    if (e.key === 'ArrowRight') next = (index + 1) % items.length
    if (e.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = items.length - 1
    if (next >= 0) {
      e.preventDefault()
      refs.current[next]?.focus()
      onChange(items[next].value)
    }
  }

  return (
    <div role="tablist" aria-label={ariaLabel} className={cn('flex gap-1 overflow-x-auto border-b border-border scrollbar-hide', className)}>
      {items.map((item, i) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'relative -mb-px inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-[13px] font-medium transition-colors focus-visible:outline-offset-[-2px]',
              active ? 'border-accent text-text-primary' : 'border-transparent text-text-muted hover:border-border-strong hover:text-text-primary'
            )}
          >
            {item.icon && <span className={cn('[&_svg]:h-4 [&_svg]:w-4', active ? 'text-amber' : '')}>{item.icon}</span>}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold kd-num',
                  active ? 'bg-amber-soft text-amber' : 'bg-neutral text-text-secondary'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

interface SegmentedProps<T extends string> {
  items: { value: T; label: React.ReactNode; icon?: React.ReactNode; ariaLabel?: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
  'aria-label'?: string
}

/** Small button group for mutually exclusive view options (e.g. Grid / List). */
export function SegmentedControl<T extends string>({ items, value, onChange, className, 'aria-label': ariaLabel }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('inline-flex h-9 items-center gap-0.5 rounded-md border border-border bg-inset p-0.5', className)}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={item.ariaLabel}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex h-full items-center gap-1.5 rounded-[5px] px-2.5 text-[12px] font-medium transition-colors [&_svg]:h-3.5 [&_svg]:w-3.5',
              active ? 'bg-surface-raised text-text-primary shadow-card ring-1 ring-border' : 'text-text-muted hover:text-text-primary'
            )}
          >
            {item.icon}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
