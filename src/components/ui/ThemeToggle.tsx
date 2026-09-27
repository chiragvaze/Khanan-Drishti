import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Theme } from '../../contexts/ThemeContext'
import { cn } from '../../lib/utils'

/** Compact icon button for the desktop header. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${next} theme`}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary',
        className
      )}
    >
      <Sun className={cn('h-[18px] w-[18px] transition-all duration-200', theme === 'light' ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-45 opacity-0')} />
      <Moon className={cn('absolute h-[18px] w-[18px] transition-all duration-200', theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-75 rotate-45 opacity-0')} />
      <span className="sr-only">Current theme: {theme}</span>
    </button>
  )
}

/** Labelled segmented control for menus and the mobile drawer. */
export function ThemeSegmented({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const options: { value: Theme; label: string; Icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', Icon: Sun },
    { value: 'dark', label: 'Dark', Icon: Moon },
  ]

  return (
    <div role="radiogroup" aria-label="Colour theme" className={cn('grid grid-cols-2 gap-1 rounded-lg border border-border bg-inset p-1', className)}>
      {options.map(({ value, label, Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={cn(
              'inline-flex h-8 items-center justify-center gap-2 rounded-md text-[13px] font-medium transition-colors',
              active ? 'bg-surface-raised text-text-primary shadow-card ring-1 ring-border' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Icon className={cn('h-4 w-4', active && 'text-amber')} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
