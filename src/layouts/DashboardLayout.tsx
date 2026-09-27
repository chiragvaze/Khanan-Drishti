import { useCallback, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/nav/Sidebar'
import TopBar from '../components/nav/TopBar'
import { ToastProvider } from '../components/ui/ToastProvider'
import { DemoProvider, useDemo } from '../contexts/DemoContext'
import { DemoOverlays, DemoControlBar } from '../components/ui/DemoOverlays'
import { useIsMobile } from '../lib/useIsMobile'
import { cn } from '../lib/utils'

// Routes that manage their own full-height, edge-to-edge layout
const FULL_BLEED_ROUTES = ['/map']

export default function DashboardLayout() {
  return (
    <DemoProvider>
      <ToastProvider>
        <Shell />
        <DemoOverlays />
        <DemoControlBar />
      </ToastProvider>
    </DemoProvider>
  )
}

function Shell() {
  const isMobile = useIsMobile()
  const location = useLocation()
  const { isActive: demoActive, currentStep } = useDemo()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMobileMenuOpen(false), [])

  const fullBleed = FULL_BLEED_ROUTES.includes(location.pathname)
  const demoBarVisible = demoActive && currentStep > 0 && currentStep < 9

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-accent-fg"
      >
        Skip to content
      </a>

      {/* Desktop: persistent sidebar. Mobile/tablet: overlay drawer. */}
      {isMobile ? <Sidebar isMobile isOpen={mobileMenuOpen} onClose={closeMenu} /> : <Sidebar isMobile={false} isOpen onClose={closeMenu} />}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar isMobile={isMobile} onMenuToggle={() => setMobileMenuOpen(true)} />

        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            'relative flex-1 overflow-x-hidden focus:outline-none',
            fullBleed ? 'overflow-hidden' : 'overflow-y-auto',
            demoBarVisible && !fullBleed && 'pb-28 sm:pb-16'
          )}
        >
          {fullBleed ? (
            <Outlet />
          ) : (
            <div key={location.pathname} className={cn('mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6', !demoActive && 'animate-page-in')}>
              <Outlet />
            </div>
          )}
        </main>

        {/* Environment status bar */}
        <footer className="flex h-7 shrink-0 select-none items-center justify-between gap-3 border-t border-border bg-surface px-4 text-[11px] sm:px-6">
          <span className="flex min-w-0 items-center gap-2 font-medium text-amber">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent" aria-hidden="true" />
            <span className="truncate">
              <span className="sm:hidden">Prototype · Demo data</span>
              <span className="hidden sm:inline">Prototype environment · Demo data only — not official statistics</span>
            </span>
          </span>
          <span className="hidden shrink-0 text-text-muted md:inline">Smart India Hackathon 2026</span>
          <span className="shrink-0 text-text-muted md:hidden">SIH 2026</span>
        </footer>
      </div>
    </div>
  )
}
