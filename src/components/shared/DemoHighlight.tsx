import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useDemo } from '../../contexts/DemoContext'

interface DemoHighlightProps {
  step: number
  tooltip: string
  children: ReactNode
}

export default function DemoHighlight({ step, tooltip, children }: DemoHighlightProps) {
  const { isActive, currentStep } = useDemo()

  const isHighlighted = isActive && currentStep === step
  const ref = useRef<HTMLDivElement>(null)

  // Bring the spotlighted element into view (important on small screens)
  useEffect(() => {
    if (!isHighlighted) return
    const t = window.setTimeout(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ref.current?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
    }, 350)
    return () => window.clearTimeout(t)
  }, [isHighlighted])

  if (!isHighlighted) {
    return <>{children}</>
  }

  return (
    <div ref={ref} className="relative z-50 scroll-mt-24 scroll-mb-40">
      {/* Spotlight ring around the component */}
      <div className="relative z-10 rounded-lg bg-surface ring-2 ring-accent ring-offset-4 ring-offset-canvas shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-accent)_12%,transparent)]">
        {children}
      </div>

      {/* Callout */}
      <div
        role="note"
        aria-live="polite"
        className="pointer-events-auto absolute left-1/2 top-full z-50 mt-5 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-border bg-surface-raised p-4 shadow-pop animate-pop-in"
      >
        {/* Arrow */}
        <div aria-hidden="true" className="absolute -top-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-border bg-surface-raised" />
        <div className="mb-1.5 flex items-center gap-2">
          <span className="inline-flex h-5 items-center rounded-[5px] bg-amber-soft px-1.5 text-[11px] font-semibold text-amber kd-num">
            Step {step} of 8
          </span>
        </div>
        <p className="text-[13px] leading-5 text-text-primary">{tooltip}</p>
      </div>
    </div>
  )
}
