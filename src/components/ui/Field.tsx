import * as React from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const controlBase =
  'h-9 w-full rounded-md border border-border bg-field text-[13px] text-text-primary shadow-card transition-colors placeholder:text-text-muted hover:border-border-strong focus:border-amber focus:outline-none focus-visible:outline-none focus:ring-3 focus:ring-focus/20 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/20'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input ref={ref} type={type} className={cn(controlBase, 'px-3', className)} {...props} />
  )
)
Input.displayName = 'Input'

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onValueChange: (value: string) => void
  /** Accessible label; defaults to the placeholder. */
  label?: string
  wrapperClassName?: string
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onValueChange, label, placeholder, className, wrapperClassName, ...props }, ref) => (
    <div className={cn('relative isolate min-w-0', wrapperClassName)}>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className={cn(controlBase, 'pl-9 pr-8 [&::-webkit-search-cancel-button]:hidden', className)}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onValueChange('')}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 z-[1] flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-text-muted hover:bg-surface-2 hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
)
SearchInput.displayName = 'SearchInput'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  wrapperClassName?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, wrapperClassName, children, ...props }, ref) => (
  <div className={cn('relative isolate min-w-0', wrapperClassName)}>
    <select ref={ref} className={cn(controlBase, 'cursor-pointer appearance-none pl-3 pr-8', className)} {...props}>
      {children}
    </select>
    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-text-muted" />
  </div>
))
Select.displayName = 'Select'

interface FieldProps {
  label: string
  htmlFor?: string
  helper?: string
  error?: string
  children: React.ReactNode
  className?: string
}

/** Label + control + helper/error text. */
export function Field({ label, htmlFor, helper, error, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-[12px] font-medium text-text-secondary">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12px] text-danger">{error}</p>
      ) : helper ? (
        <p className="text-[12px] text-text-muted">{helper}</p>
      ) : null}
    </div>
  )
}

/** Horizontal toolbar that hosts search + filters above a table or grid. */
export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>
}
