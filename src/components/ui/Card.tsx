import * as React from 'react'
import { cn } from '../../lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border border-border bg-surface text-text-primary shadow-card', className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Convenience props — when provided, CardHeader renders a standard title row. */
  title?: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  actions?: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, icon, actions, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex min-h-[52px] items-center justify-between gap-3 border-b border-border px-4 py-3', className)}
      {...props}
    >
      {title !== undefined ? (
        <>
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && <span className="flex h-4 w-4 shrink-0 items-center justify-center text-text-muted [&_svg]:h-4 [&_svg]:w-4">{icon}</span>}
            <div className="min-w-0">
              <CardTitle className="truncate">{title}</CardTitle>
              {subtitle && <CardDescription className="mt-0.5 truncate">{subtitle}</CardDescription>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </>
      ) : (
        children
      )}
    </div>
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-[14px] font-semibold leading-5 text-text-primary', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-[12px] leading-4 text-text-muted', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-4', className)} {...props} />
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-2 border-t border-border px-4 py-3', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
