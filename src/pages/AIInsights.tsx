import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, FileText, AlertTriangle, Zap, Info, Sparkles, Camera, Scale, ClipboardCheck,
  ChevronDown, Lightbulb, MessageSquareText, Radar,
} from 'lucide-react'
import { useDemo } from '../contexts/DemoContext'
import { useRole } from '../contexts/RoleContext'
import DemoHighlight from '../components/shared/DemoHighlight'
import { StatusBadge, Tag } from '../components/shared/StatusBadge'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/States'
import { aiInsights } from '../data/ai-insights'
import { cn, formatDateTime } from '../lib/utils'

const SUGGESTED_QUESTIONS = [
  'Why is WCL-04 high risk?',
  'Which mines have overdue CAPA?',
  'Which contractor requires review?',
  'What changed in compliance this week?',
]

const WCL04_QUERY = 'Why is WCL-04 high risk?'
// Recommended action for the WCL-04 scenario comes from the existing insight record
const wcl04Insight = aiInsights.find((i) => i.id === 'ai-wcl04-vent-001')

export default function AIInsightsPage() {
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const navigate = useNavigate()
  const { role } = useRole()

  const handleQuerySubmit = (e?: React.FormEvent, q?: string) => {
    if (e) e.preventDefault()
    const textToSubmit = q || query
    if (!textToSubmit.trim()) return

    setQuery(textToSubmit)
    setIsTyping(true)
    setActiveQuery(null)

    // Simulate AI thinking time for the demo
    setTimeout(() => {
      setIsTyping(false)
      setActiveQuery(textToSubmit)
    }, 600)
  }

  // Auto-trigger demo query when Step 4 becomes active
  const { isActive: demoActive, currentStep } = useDemo()
  useEffect(() => {
    if (demoActive && currentStep === 4 && !activeQuery && !isTyping) {
      handleQuerySubmit(undefined, WCL04_QUERY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoActive, currentStep, activeQuery, isTyping])

  const canViewObligations = role !== 'MINE_OFFICIAL'

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Insights"
        description="Evidence-grounded compliance intelligence. Every answer is traced back to field evidence and statutory obligations."
        meta={<Tag tone="info">Khanan AI · Prototype</Tag>}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* ── Analysis workspace ─────────────────────── */}
        <div className="min-w-0 space-y-4 xl:col-span-8">
          {/* Query */}
          <Card>
            <CardContent className="space-y-3">
              <label htmlFor="kd-ai-query" className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
                <MessageSquareText className="h-4 w-4 text-text-muted" /> Ask a question
              </label>
              <form onSubmit={handleQuerySubmit} className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="kd-ai-query"
                  type="text"
                  placeholder="Ask Khanan AI about risks, compliance, and governance..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-11 w-full min-w-0 rounded-md sm:flex-1 border border-border bg-field px-3.5 text-[14px] text-text-primary shadow-card transition-colors placeholder:text-text-muted hover:border-border-strong focus:border-amber focus:outline-none focus:ring-3 focus:ring-focus/20 focus-visible:outline-none"
                />
                <Button type="submit" size="lg" disabled={!query.trim() || isTyping}>
                  <Sparkles /> Analyze
                </Button>
              </form>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] text-text-muted">Suggested:</span>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQuerySubmit(undefined, q)}
                    className={cn(
                      'inline-flex h-7 items-center rounded-full border px-3 text-[12px] transition-colors',
                      activeQuery === q ? 'border-amber/50 bg-amber-soft text-amber' : 'border-border bg-surface-2 text-text-secondary hover:border-border-strong hover:text-text-primary'
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Idle */}
          {!activeQuery && !isTyping && (
            <Card>
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-3">
                {[
                  { Icon: Camera, title: 'Evidence-grounded', text: 'Answers cite the photos, telemetry and records they are based on.' },
                  { Icon: Scale, title: 'Obligation-mapped', text: 'Findings are linked to the statutory clause they relate to.' },
                  { Icon: Radar, title: 'Confidence-scored', text: 'Every classification carries a confidence score for review.' },
                ].map(({ Icon, title, text }) => (
                  <div key={title} className="bg-surface p-4">
                    <Icon className="h-4 w-4 text-amber" />
                    <h3 className="mt-2 text-[13px] font-semibold text-text-primary">{title}</h3>
                    <p className="mt-0.5 text-[12px] leading-[18px] text-text-muted">{text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Analyzing */}
          {isTyping && (
            <Card role="status" aria-live="polite">
              <CardHeader title="AI analysis" subtitle="Analyzing compliance data…" icon={<Sparkles className="animate-pulse text-amber" />} />
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result: WCL-04 */}
          {activeQuery === WCL04_QUERY && (
            <div className="space-y-4 animate-fade-in">
              <DemoHighlight step={4} tooltip="Khanan AI correlates field evidence with statutory obligations to explain risk scores.">
                <Card className="overflow-hidden">
                  <CardHeader
                    title="AI analysis"
                    subtitle={<span>Query: “{activeQuery}”</span>}
                    icon={<Sparkles className="text-amber" />}
                    actions={<StatusBadge status="HIGH" />}
                  />
                  {/* Summary */}
                  <div className="border-b border-border bg-surface-2 px-4 py-4">
                    <div className="kd-overline mb-1">Summary</div>
                    <p className="text-[14px] leading-6 text-text-primary">
                      <strong className="font-semibold text-danger">WCL-04 is classified as HIGH RISK</strong> in the prototype because of multiple contributing factors
                      identified in recent inspections and telemetry data.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5">
                    <div className="space-y-5 p-4 md:col-span-3 md:border-r md:border-border">
                      {/* Risk Factors */}
                      <section>
                        <h3 className="kd-overline mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-danger" /> Identified risk factors
                        </h3>
                        <ol className="space-y-1.5">
                          {['Ventilation CAPA overdue', 'Missing verification evidence', 'Contractor safety observation'].map((f, i) => (
                            <li key={f} className="flex items-center gap-2.5 text-[13px] text-text-primary">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-inset text-[10px] font-semibold text-text-muted kd-num">{i + 1}</span>
                              {f}
                            </li>
                          ))}
                        </ol>
                      </section>

                      {/* Risk Propagation Flow */}
                      <section>
                        <h3 className="kd-overline mb-2">Risk propagation</h3>
                        <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium">
                          <span className="rounded-md border border-danger/25 bg-danger-soft px-2 py-1 text-danger">Ventilation CAPA</span>
                          <ArrowRight className="h-3.5 w-3.5 text-text-disabled" />
                          <span className="rounded-md border border-warning/25 bg-warning-soft px-2 py-1 text-warning">Compliance risk</span>
                          <ArrowRight className="h-3.5 w-3.5 text-text-disabled" />
                          <span className="rounded-md border border-info/25 bg-info-soft px-2 py-1 text-info">Inspection priority</span>
                        </div>
                      </section>

                      {wcl04Insight && (
                        <section className="rounded-lg border border-amber/30 bg-amber-soft px-3.5 py-3">
                          <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-amber">
                            <Zap className="h-3.5 w-3.5" /> Recommended action
                          </h3>
                          <p className="mt-1 text-[13px] leading-5 text-text-primary">{wcl04Insight.recommendedAction}</p>
                        </section>
                      )}
                    </div>

                    {/* Evidence rail */}
                    <div className="space-y-4 border-t border-border p-4 md:col-span-2 md:border-t-0">
                      <section>
                        <h3 className="kd-overline mb-2 flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" /> Key evidence
                        </h3>
                        <div className="rounded-lg border border-border bg-inset p-3">
                          <div className="font-mono text-[14px] font-semibold text-text-primary">KD-E102</div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[11px] text-text-muted">
                              <span>Confidence</span>
                              <span className="font-semibold text-success kd-num">94%</span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-chart-track">
                              <div className="h-full rounded-full bg-success-solid" style={{ width: '94%' }} />
                            </div>
                          </div>
                        </div>
                      </section>
                      <section>
                        <h3 className="kd-overline mb-1.5">Applicable obligation</h3>
                        <p className="text-[12px] text-text-muted">[Demo clause reference]</p>
                        <p className="font-mono text-[13px] font-medium text-amber">CMR 2017: Reg 153</p>
                      </section>
                      <div className="flex flex-col gap-2">
                        <Button variant="secondary" size="sm" onClick={() => navigate('/evidence')} className="justify-start">
                          <Camera /> View Evidence
                        </Button>
                        {canViewObligations && (
                          <Button variant="secondary" size="sm" onClick={() => navigate('/compliance')} className="justify-start">
                            <Scale /> View Obligation
                          </Button>
                        )}
                        <Button variant="secondary" size="sm" onClick={() => navigate('/capa')} className="justify-start">
                          <ClipboardCheck /> View CAPA
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </DemoHighlight>

              {/* AI Reasoning Trace */}
              <Card className="px-4 py-3">
                <h3 className="kd-overline mb-2 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber" /> AI reasoning trace
                </h3>
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12px] text-text-secondary">
                  {['Evidence analyzed', 'Relevant obligation identified', 'Risk factors evaluated', 'Risk classification generated'].map((s, i, arr) => (
                    <li key={s} className="flex items-center gap-2">
                      <span className={cn(i === arr.length - 1 && 'font-medium text-text-primary')}>{s}</span>
                      {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-text-disabled" aria-hidden="true" />}
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          )}

          {activeQuery && activeQuery !== WCL04_QUERY && (
            <Card className="flex items-start gap-3 px-4 py-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-info/25 bg-info-soft text-info">
                <Info className="h-4 w-4" />
              </span>
              <p className="text-[13px] leading-5 text-text-secondary">
                This query is not supported in the current demo prototype. Please select “{WCL04_QUERY}” to view the structured analysis capabilities.
              </p>
            </Card>
          )}

          <p className="flex items-start gap-2 px-1 text-[11px] leading-4 text-text-muted">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>
              <strong className="font-semibold text-text-secondary">Prototype/demo AI outputs.</strong> This system is for demonstration purposes only. Do not claim regulatory
              validity or guaranteed accuracy. Always verify insights with official mine records.
            </span>
          </p>
        </div>

        {/* ── Active insights feed ───────────────────── */}
        <Card className="self-start xl:col-span-4">
          <CardHeader
            title="Active insights"
            subtitle="From inspections, telemetry and records"
            icon={<Lightbulb />}
            actions={<span className="text-[12px] font-semibold text-text-muted kd-num">{aiInsights.length}</span>}
          />
          <ul className="divide-y divide-border">
            {aiInsights.map((insight) => (
              <InsightItem key={insight.id} insight={insight} />
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function InsightItem({ insight }: { insight: (typeof aiInsights)[number] }) {
  const [open, setOpen] = useState(false)
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={insight.severity} />
            <span className="text-[11px] text-text-muted">{insight.category.charAt(0) + insight.category.slice(1).toLowerCase()}</span>
          </span>
          <span className="mt-1 block text-[13px] font-medium leading-5 text-text-primary">{insight.title}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-text-muted">
            <span>{insight.mineName}</span>
            <span aria-hidden="true">·</span>
            <span className="kd-num">{insight.confidence}% confidence</span>
          </span>
        </span>
        <ChevronDown className={cn('mt-1 h-4 w-4 shrink-0 text-text-muted transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <div className="space-y-3 px-4 pb-4 animate-fade-in">
          <p className="text-[12px] leading-[18px] text-text-secondary">{insight.explanation}</p>
          <div className="rounded-md border border-border bg-inset px-3 py-2">
            <div className="text-[11px] font-medium text-text-muted">Evidence</div>
            <div className="text-[12px] text-text-primary">{insight.evidenceRef}</div>
          </div>
          {insight.regulationClause && (
            <div className="rounded-md border border-border bg-inset px-3 py-2">
              <div className="text-[11px] font-medium text-text-muted">{insight.regulationRef}</div>
              <div className="text-[12px] text-amber">{insight.regulationClause}</div>
            </div>
          )}
          <div className="rounded-md border border-amber/30 bg-amber-soft px-3 py-2">
            <div className="text-[11px] font-semibold text-amber">Recommended action</div>
            <div className="text-[12px] leading-[18px] text-text-primary">{insight.recommendedAction}</div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span className="kd-num">{formatDateTime(insight.createdDate)}</span>
            <StatusBadge status={insight.status} hideDot />
          </div>
        </div>
      )}
    </li>
  )
}
