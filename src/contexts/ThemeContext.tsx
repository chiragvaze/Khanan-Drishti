import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'dark' | 'light'

// Keep in sync with the bootstrap script in index.html
export const THEME_STORAGE_KEY = 'khanan-theme'
const THEME_COLOR: Record<Theme, string> = { dark: '#0B1015', light: '#F4F6F8' }

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function readSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : null
  } catch {
    return null
  }
}

function readDocumentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readDocumentTheme)
  const transitionTimer = useRef<number | undefined>(undefined)

  const applyTheme = useCallback((next: Theme, animate: boolean) => {
    const root = document.documentElement
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (animate && !reduceMotion) {
      root.classList.add('theme-transition')
      window.clearTimeout(transitionTimer.current)
      transitionTimer.current = window.setTimeout(() => root.classList.remove('theme-transition'), 260)
    }
    root.setAttribute('data-theme', next)
    root.style.colorScheme = next
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next])
  }, [])

  const setTheme = useCallback(
    (next: Theme) => {
      applyTheme(next, true)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {
        /* storage unavailable — theme still applies for this session */
      }
      setThemeState(next)
    },
    [applyTheme]
  )

  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme])

  // Follow OS changes until the user makes an explicit choice
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (e: MediaQueryListEvent) => {
      if (readSavedTheme()) return
      const next: Theme = e.matches ? 'light' : 'dark'
      applyTheme(next, true)
      setThemeState(next)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [applyTheme])

  // Keep multiple open tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY || (e.newValue !== 'light' && e.newValue !== 'dark')) return
      applyTheme(e.newValue, true)
      setThemeState(e.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [applyTheme])

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
