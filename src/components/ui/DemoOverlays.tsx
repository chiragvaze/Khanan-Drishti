import { useEffect, useRef } from 'react'
import { useDemo } from '../../contexts/DemoContext'
import { Play, X, ChevronRight, ChevronLeft, CheckCircle2, RotateCcw } from 'lucide-react'
import KhananLogo from '../shared/KhananLogo'
import { StatusBadge } from '../shared/StatusBadge'
import { Button } from './Button'
import { cn } from '../../lib/utils'

// Labels for the 8 guided steps (routes are defined in DemoContext)
const STEP_LABELS = ['Command Center', 'GIS Risk Map', 'Evidence', 'AI Insights', 'Compliance & Risk', 'CAPA', 'Contractors', 'Reports']

const COMPLETED_ITEMS = [
  'Evidence captured securely',
  'AI verification processed',
  'Compliance mapping established',
  'Risk automatically identified',
  'Corrective action (CAPA) initiated',
  'Contractor safety record linked',
  'Statutory report generated',
]

export function DemoOverlays() {
  const { isActive, currentStep, startDemo, exitDemo, nextStep } = useDemo()
  const dialogRef = useRef<HTMLDivElement>(null)

  if (!isActive) return null
  if (currentStep > 0 && currentStep < 9) {
    // While in steps 1-8, dim the rest of the app so the spotlight reads clearly
    return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 bg-overlay/70 transition-opacity duration-300" />
  }

  const isCompletion = currentStep === 9

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-canvas/90 p-4 backdrop-blur-md animate-fade-in-backdrop">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-title"
        className="relative w-full max-w-[680px] overflow-hidden rounded-xl border border-border bg-surface-raised shadow-pop animate-pop-in"
      >
        <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-[3px]', isCompletion ? 'bg-success-solid' : 'bg-accent')} />

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <KhananLogo variant="lockup" size="sm" />
            <span className="kd-overline">{isCompletion ? 'Demo complete' : 'Guided demo'}</span>
          </div>

          {!isCompletion ? (
            <>
              <h2 id="demo-title" className="mt-7 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-text-primary sm:text-[30px]">
                From field evidence to governance
              </h2>
              <p className="mt-3 text-[14px] leading-6 text-text-secondary sm:text-[15px]">
                Follow a real-time compliance scenario across the Khanan Drishti platform. You will track a high-risk ventilation
                observation from the moment it is logged in the field, through AI verification, risk analysis, and final corrective
                action mapping.
              </p>

              <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-border bg-inset px-4 py-3">
                <div>
                  <div className="kd-overline">Scenario target</div>
                  <div className="mt-0.5 text-[14px] font-semibold text-text-primary">
                    Mine <span className="font-mono">WCL-04</span>
                  </div>
                </div>
                <StatusBadge status="HIGH" size="md" />
              </div>

              <ol className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4" aria-label="Demo steps">
                {STEP_LABELS.map((label, i) => (
                  <li key={label} className="flex items-center gap-2 text-[12px] text-text-secondary">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-inset text-[10px] font-semibold text-text-muted kd-num">
                      {i + 1}
                    </span>
                    <span className="truncate">{label}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="hidden text-[12px] text-text-muted sm:block">
                  Use <kbd className="rounded border border-border bg-inset px-1 font-mono text-[11px]">←</kbd>{' '}
                  <kbd className="rounded border border-border bg-inset px-1 font-mono text-[11px]">→</kbd> to navigate,{' '}
                  <kbd className="rounded border border-border bg-inset px-1 font-mono text-[11px]">Esc</kbd> to exit
                </p>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button variant="ghost" size="lg" onClick={exitDemo}>
                    Exit
                  </Button>
                  <Button variant="primary" size="lg" onClick={nextStep} data-autofocus autoFocus>
                    <Play className="fill-current" /> Start demo
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mt-7 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-success/25 bg-success-soft">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </span>
                <h2 id="demo-title" className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-text-primary sm:text-[28px]">
                  Scenario complete
                </h2>
              </div>
              <p className="mt-3 text-[14px] text-text-secondary">The system successfully tracked:</p>

              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {COMPLETED_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 rounded-md border border-border bg-inset px-3 py-2 text-[13px] text-text-primary">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <Button variant="secondary" size="lg" onClick={startDemo}>
                  <RotateCcw /> Restart demo
                </Button>
                <Button variant="primary" size="lg" onClick={exitDemo} autoFocus>
                  Exit demo
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function DemoControlBar() {
  const { isActive, currentStep, nextStep, prevStep, exitDemo } = useDemo()
  const barRef = useRef<HTMLDivElement>(null)
  const visible = isActive && currentStep > 0 && currentStep < 9

  // Publish the bar height so fixed panels (side sheets) can keep content clear of it
  useEffect(() => {
    const el = barRef.current
    if (!visible || !el) return
    const root = document.documentElement
    const update = () => root.style.setProperty('--kd-demo-bar-h', `${el.offsetHeight}px`)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      ro.disconnect()
      root.style.removeProperty('--kd-demo-bar-h')
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Demo controls"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-surface-raised shadow-pop animate-fade-in pb-safe"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-border">
        <span className="block h-full bg-accent transition-all duration-300" style={{ width: `${(currentStep / 8) * 100}%` }} />
      </span>
      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-3 py-2.5 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-0">
        {/* Context */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-6 items-center gap-1.5 rounded-[5px] bg-amber-soft px-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-amber">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Demo
          </span>
          <span className="font-mono text-[12px] text-text-secondary">WCL-04</span>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <span className="min-w-0 truncate text-[13px] text-text-primary" aria-live="polite">
            <span className="text-text-muted kd-num">Step {currentStep}/8 · </span>
            <span className="font-medium">{STEP_LABELS[currentStep - 1]}</span>
          </span>
        </div>

        {/* Step dots */}
        <ol className="hidden items-center gap-1.5 lg:flex" aria-hidden="true">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1
            return (
              <li
                key={label}
                title={label}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  s === currentStep ? 'w-6 bg-accent' : s < currentStep ? 'w-1.5 bg-amber/60' : 'w-1.5 bg-neutral-strong'
                )}
              />
            )
          })}
        </ol>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <Button variant="secondary" size="sm" onClick={prevStep} disabled={currentStep === 1} title="Previous step (←)" aria-label="Previous step" className="h-9 sm:h-8">
            <ChevronLeft /> <span className="hidden sm:inline">Back</span>
          </Button>
          <Button variant="primary" size="sm" onClick={nextStep} title="Next step (→)" className="h-9 min-w-[96px] flex-1 sm:h-8 sm:flex-none">
            {currentStep === 8 ? 'Finish' : 'Next'} <ChevronRight />
          </Button>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
          <Button variant="ghost" size="sm" onClick={exitDemo} title="Exit demo (Esc)" aria-label="Exit demo" className="h-9 sm:h-8">
            <X /> <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
