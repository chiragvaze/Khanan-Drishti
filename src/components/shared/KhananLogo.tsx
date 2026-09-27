import { cn } from '../../lib/utils'
import { useTheme } from '../../contexts/ThemeContext'

// ──────────────────────────────────────────────
// Centralized Logo Asset Paths (official artwork — never recolour or redraw)
// ──────────────────────────────────────────────
export const LOGO_FULL = '/logo/text_logo_combine.png' // emblem + dark wordmark → light surfaces
export const LOGO_ICON = '/logo/ony_logo.png' // emblem only → works on both
export const LOGO_TEXT = '/logo/only_text.png' // light wordmark → dark surfaces

// ──────────────────────────────────────────────
// Logo Variant & Size Types
// ──────────────────────────────────────────────
type LogoVariant = 'full' | 'icon' | 'text' | 'lockup'
type LogoSize = 'sm' | 'md' | 'lg'
/** The tone of the surface the logo sits on. `auto` follows the active theme. */
type LogoTone = 'auto' | 'onDark' | 'onLight'

interface KhananLogoProps {
  variant?: LogoVariant
  size?: LogoSize
  tone?: LogoTone
  className?: string
  /** @deprecated use tone="onLight" */
  lightBackground?: boolean
}

const ALT = 'Khanan Drishti — Safer Mines, Stronger Tomorrow'

const iconSize: Record<LogoSize, string> = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-12 w-12' }
const textSize: Record<LogoSize, string> = { sm: 'h-7', md: 'h-10', lg: 'h-14' }
const fullSize: Record<LogoSize, string> = { sm: 'h-16', md: 'h-24', lg: 'h-32' }

const imgBase = 'object-contain select-none pointer-events-none flex-shrink-0'

export default function KhananLogo({ variant = 'full', size = 'md', tone = 'auto', className, lightBackground = false }: KhananLogoProps) {
  const { theme } = useTheme()
  const resolvedTone: Exclude<LogoTone, 'auto'> = lightBackground ? 'onLight' : tone === 'auto' ? (theme === 'light' ? 'onLight' : 'onDark') : tone

  if (variant === 'icon') {
    return <img src={LOGO_ICON} alt="Khanan Drishti" draggable={false} className={cn(imgBase, iconSize[size], className)} />
  }

  if (variant === 'text') {
    return <img src={LOGO_TEXT} alt={ALT} draggable={false} className={cn(imgBase, textSize[size], className)} />
  }

  if (variant === 'lockup') {
    // Horizontal emblem + wordmark for navigation chrome. The wordmark artwork is
    // light, so on light surfaces it sits on a Deep Charcoal brand plate instead of
    // being altered with filters.
    return (
      <span
        className={cn('inline-flex items-center gap-2', resolvedTone === 'onLight' && 'rounded-md bg-brand-charcoal px-2 py-1', className)}
        role="img"
        aria-label={ALT}
      >
        <img src={LOGO_ICON} alt="" draggable={false} className={cn(imgBase, iconSize[size])} />
        <img src={LOGO_TEXT} alt="" draggable={false} className={cn(imgBase, textSize[size])} />
      </span>
    )
  }

  // Full stacked brand mark
  if (resolvedTone === 'onLight') {
    return <img src={LOGO_FULL} alt={ALT} draggable={false} className={cn(imgBase, fullSize[size], className)} />
  }
  // The combined artwork uses a dark wordmark, so on dark surfaces we stack the
  // emblem above the light wordmark — both official assets, unmodified.
  return (
    <span className={cn('inline-flex flex-col items-center gap-1', className)} role="img" aria-label={ALT}>
      <img src={LOGO_ICON} alt="" draggable={false} className={cn(imgBase, { sm: 'h-10 w-10', md: 'h-14 w-14', lg: 'h-20 w-20' }[size])} />
      <img src={LOGO_TEXT} alt="" draggable={false} className={cn(imgBase, { sm: 'h-6', md: 'h-8', lg: 'h-11' }[size])} />
    </span>
  )
}
