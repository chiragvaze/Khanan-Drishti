import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-fg shadow-card hover:bg-accent-hover',
        secondary: 'border border-border bg-surface text-text-primary shadow-card hover:border-border-strong hover:bg-surface-2',
        ghost: 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
        danger: 'bg-danger-solid text-white shadow-card hover:bg-danger-solid/90',
        'danger-outline': 'border border-danger/40 bg-transparent text-danger hover:bg-danger-soft',
        success: 'bg-success-solid text-white shadow-card hover:bg-success-solid/90',
        link: 'h-auto px-0 text-amber underline-offset-4 hover:underline',
        // Backwards-compatible aliases
        default: 'bg-accent text-accent-fg shadow-card hover:bg-accent-hover',
        destructive: 'bg-danger-solid text-white shadow-card hover:bg-danger-solid/90',
        outline: 'border border-border bg-surface text-text-primary shadow-card hover:border-border-strong hover:bg-surface-2',
      },
      size: {
        sm: 'h-8 px-3 text-[12px] [&_svg]:h-3.5 [&_svg]:w-3.5',
        md: 'h-9 px-3.5 text-[13px] [&_svg]:h-4 [&_svg]:w-4',
        lg: 'h-11 px-5 text-[14px] [&_svg]:h-4 [&_svg]:w-4',
        icon: 'h-9 w-9 [&_svg]:h-4 [&_svg]:w-4',
        'icon-sm': 'h-8 w-8 [&_svg]:h-4 [&_svg]:w-4',
        default: 'h-9 px-3.5 text-[13px] [&_svg]:h-4 [&_svg]:w-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', asChild: _asChild = false, ...props }, ref) => {
    return <button type={type} className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
