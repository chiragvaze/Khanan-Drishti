import React from 'react'
import { AlertCircle, Inbox } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../../lib/utils'

// Skeleton — a shimmering placeholder shaped like the content it replaces
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('kd-skeleton h-4', className)} />
}

// Loading State — skeleton rows that match a list/table layout
export interface LoadingStateProps {
  message?: string
  rows?: number
  className?: string
}

export function LoadingState({ message = 'Loading…', rows = 4, className }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className={cn('space-y-3 p-4', className)}>
      <span className="sr-only">{message}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Empty State
export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ElementType
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
  className?: string
}

export function EmptyState({
  title = 'No data found',
  description = 'There is no data available to display at this time.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-8' : 'px-6 py-12', className)}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-inset">
        <Icon className="h-5 w-5 text-text-muted" aria-hidden="true" />
      </div>
      <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-[13px] text-text-secondary">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary" size="sm" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

// Error State
export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Unable to load data',
  message = 'Check your connection or try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-danger/25 bg-danger-soft">
        <AlertCircle className="h-5 w-5 text-danger" aria-hidden="true" />
      </div>
      <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-text-secondary">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm" className="mt-4">
          Retry
        </Button>
      )}
    </div>
  )
}
