import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface KPICardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  /** Whether the trend direction is good news (green) or bad news (red). */
  trendPositive?: boolean
  icon?: ReactNode
  variant?: 'default' | 'danger' | 'warning' | 'success'
  className?: string
}

const variantIcon: Record<NonNullable<KPICardProps['variant']>, string> = {
  default: 'bg-inset text-text-muted border-border',
  danger: 'bg-danger-soft text-danger border-danger/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  success: 'bg-success-soft text-success border-success/20',
}

const variantRail: Record<NonNullable<KPICardProps['variant']>, string> = {
  default: 'bg-transparent',
  danger: 'bg-danger-solid',
  warning: 'bg-warning-solid',
  success: 'bg-success-solid',
}

export function KPICard({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  trendPositive,
  icon,
  variant = 'default',
  className,
}: KPICardProps) {
  const trendTone =
    trend === 'neutral' || trend === undefined ? 'text-text-muted' : trendPositive ? 'text-success' : 'text-danger'
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus

  return (
    <div
      className={cn(
        'relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong',
        className
      )}
    >
      {/* Thin status rail — communicates severity without flooding the card with colour */}
      <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-[3px]', variantRail[variant])} />

      <div className="flex items-start justify-between gap-3">
        <span className="kd-overline min-w-0 break-words">{label}</span>
        {icon && (
          <span
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border [&_svg]:h-3.5 [&_svg]:w-3.5',
              variantIcon[variant]
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="mt-1.5 text-[28px] font-semibold leading-8 tracking-tight text-text-primary kd-num">{value}</div>

      {(subtitle || (trend && trendValue)) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] leading-4">
          {trend && trendValue && (
            <span className={cn('inline-flex items-center gap-0.5 font-medium kd-num', trendTone)}>
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {trendValue}
            </span>
          )}
          {trend && trendValue && subtitle && <span className="text-text-disabled" aria-hidden="true">·</span>}
          {subtitle && <span className="text-text-secondary">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
