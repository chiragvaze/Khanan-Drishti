import { useState, useMemo, useEffect } from 'react'
import {
  ShieldAlert, AlertTriangle, Activity, CheckCircle, FileText, Zap, Camera, FileSearch, Scale,
  ClipboardCheck, ChevronRight, Sparkles, GitBranch, SearchX,
} from 'lucide-react'
import { StatusBadge, Tag } from '../components/shared/StatusBadge'
import { KPICard } from '../components/shared/KPICard'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { SearchInput, Select } from '../components/ui/Field'
import { EmptyState } from '../components/ui/States'
import { SideSheet, SheetSection, DetailItem } from '../components/ui/SideSheet'
import { cn, formatDate } from '../lib/utils'
import { useDemo } from '../contexts/DemoContext'
import DemoHighlight from '../components/shared/DemoHighlight'

// ----------------------------------------------------------------------
// Mock Data (Compliance Risk Engine)
// ----------------------------------------------------------------------
const mockRisks = [
  {
    id: 'KD-R102',
    mine: 'WCL-04',
    observation: 'Ventilation CAPA overdue',
    domain: 'Safety',
    riskLevel: 'HIGH',
    confidence: 94,
    obligation: 'CMR-2017 Ch-XI',
    status: 'OPEN',
    lastUpdated: '2026-09-22T08:30:00Z',
    evidence: 'System log shows CAPA #WCL04-VENT-001 is 72 hours overdue.',
    riskFactors: ['Methane concentration upward trend', 'Auxiliary fan failure rate high'],
    aiReasoning: 'Historical data shows 85% probability of incident when ventilation CAPAs are delayed >48h in this seam.',
    recommendedAction: 'Immediate DGMS escalation and halt of operations in Panel 3B.',
    propagation: [
      'Ventilation CAPA overdue',
      'Ventilation compliance risk',
      'Gas-related compliance weight',
      'Inspection priority increased'
    ]
  },
  {
    id: 'KD-R105',
    mine: 'BCCL-06',
    observation: 'FR cable installation delayed',
    domain: 'Electrical',
    riskLevel: 'HIGH',
    confidence: 88,
    obligation: 'CEA Reg-109',
    status: 'OPEN',
    lastUpdated: '2026-09-21T14:15:00Z',
    evidence: 'Field inspection photo shows standard PVC cables in main intake.',
    riskFactors: ['High voltage line proximity', 'Historical fire incidents'],
    aiReasoning: 'Non-FR cables in main intake pose critical fire propagation risk.',
    recommendedAction: 'Issue stoppage order for specific electrical section until FR cables are installed.',
    propagation: [
      'FR cable installation delayed',
      'Electrical fire risk elevated',
      'Overall mine safety score reduced',
      'Immediate contractor penalty'
    ]
  },
  {
    id: 'KD-R089',
    mine: 'NCL-12',
    observation: 'Slope movement detected',
    domain: 'Geotechnical',
    riskLevel: 'MEDIUM',
    confidence: 76,
    obligation: 'CMR-2017 Reg-106',
    status: 'MONITORING',
    lastUpdated: '2026-09-20T09:45:00Z',
    evidence: 'Prism monitoring data shows 2mm/day movement on South bench.',
    riskFactors: ['Post-monsoon saturation', 'Heavy machinery vibration'],
    aiReasoning: 'Movement rate is within acceptable limits but accelerating slightly.',
    recommendedAction: 'Increase monitoring frequency to 12-hourly and restrict heavy machinery near edge.',
    propagation: [
      'Slope movement detected',
      'Geotechnical stability alert',
      'Operational restriction applied',
      'Survey team dispatched'
    ]
  },
  {
    id: 'KD-R112',
    mine: 'SECL-07',
    observation: 'Dust suppression failure',
    domain: 'Environmental',
    riskLevel: 'LOW',
    confidence: 91,
    obligation: 'EP Act 1986',
    status: 'CLOSED',
    lastUpdated: '2026-09-19T16:20:00Z',
    evidence: 'Sensor PM10 readings exceeded limit for 4 hours.',
    riskFactors: ['Dry weather conditions', 'High truck traffic'],
    aiReasoning: 'Temporary failure of water sprinklers caused localized dust spike.',
    recommendedAction: 'Repair sprinkler pump and increase manual spraying.',
    propagation: [
      'Dust suppression failure',
      'Air quality index drop',
      'Environmental compliance warning',
      'CAPA issued to maintenance'
    ]
  }
]

const statusLabel: Record<string, string> = { OPEN: 'OPEN', CLOSED: 'CLOSED', MONITORING: 'MONITORING' }

const chainSteps = [
  { label: 'Evidence', detail: 'Photo, video, sensor or record from the field', Icon: Camera },
  { label: 'Observation', detail: 'Finding raised by inspector or AI', Icon: FileSearch },
  { label: 'Obligation', detail: 'Statutory clause the finding maps to', Icon: Scale },
  { label: 'Risk', detail: 'Severity scored by the risk engine', Icon: ShieldAlert },
  { label: 'CAPA', detail: 'Corrective action with an SLA owner', Icon: ClipboardCheck },
]

export default function ComplianceRisk() {
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('ALL')
  const [domainFilter, setDomainFilter] = useState<string>('ALL')
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null)

  const { isActive: demoActive, currentStep } = useDemo()

  const domains = useMemo(() => ['ALL', ...new Set(mockRisks.map((r) => r.domain))], [])

  // Auto-select WCL-04 Risk for Demo Step 5
  useEffect(() => {
    if (demoActive && currentStep === 5 && !selectedRiskId) {
      setSelectedRiskId('KD-R102')
    }
  }, [demoActive, currentStep, selectedRiskId])
  const filteredRisks = useMemo(() => {
    return mockRisks.filter((r) => {
      const matchSearch =
        r.mine.toLowerCase().includes(search.toLowerCase()) || r.observation.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())
      const matchRisk = riskFilter === 'ALL' || r.riskLevel === riskFilter
      const matchDomain = domainFilter === 'ALL' || r.domain === domainFilter
      return matchSearch && matchRisk && matchDomain
    })
  }, [search, riskFilter, domainFilter])

  const highRiskCount = mockRisks.filter((r) => r.riskLevel === 'HIGH').length
  const medRiskCount = mockRisks.filter((r) => r.riskLevel === 'MEDIUM').length
  const lowRiskCount = mockRisks.filter((r) => r.riskLevel === 'LOW').length

  const selectedRisk = mockRisks.find((r) => r.id === selectedRiskId)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Compliance & Risk"
        description="Explainable risk engine linking field evidence and observations to statutory obligations."
        meta={<Tag tone="warning">Prototype model</Tag>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:gap-4">
        <KPICard label="HIGH RISK" value={highRiskCount} subtitle="Active critical risks" variant="danger" icon={<AlertTriangle />} />
        <KPICard label="MEDIUM RISK" value={medRiskCount} subtitle="Elevated warnings" variant="warning" icon={<ShieldAlert />} />
        <KPICard label="LOW RISK" value={lowRiskCount} subtitle="Minor deviations" variant="success" icon={<CheckCircle />} />
      </div>

      {/* How risk is derived */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3.5">
          <h2 className="kd-overline">How a risk is derived</h2>
          <span className="text-[11px] text-text-muted">Every risk is traceable back to its evidence</span>
        </div>
        <ol className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-5 sm:gap-0">
          {chainSteps.map((step, i) => (
            <li key={step.label} className="relative flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2 sm:pr-6">
              <div className="flex items-center gap-2 sm:w-full">
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                    step.label === 'Risk' ? 'border-danger/30 bg-danger-soft text-danger' : step.label === 'Obligation' ? 'border-amber/30 bg-amber-soft text-amber' : 'border-border bg-inset text-text-secondary'
                  )}
                >
                  <step.Icon className="h-4 w-4" />
                </span>
                {i < chainSteps.length - 1 && (
                  <span aria-hidden="true" className="hidden h-px flex-1 bg-border sm:block">
                    <ChevronRight className="-mt-[7px] ml-auto h-3.5 w-3.5 text-text-disabled" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-text-primary">{step.label}</div>
                <div className="text-[12px] leading-4 text-text-muted">{step.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Risk register */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="mr-2 shrink-0">
            <h2 className="text-[14px] font-semibold text-text-primary">Risk engine</h2>
            <p className="text-[12px] text-text-muted">Prototype Risk Model — Not scientifically validated.</p>
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row lg:justify-end">
            <SearchInput value={search} onValueChange={setSearch} placeholder="Search risks..." wrapperClassName="sm:w-64" />
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Select aria-label="Risk level" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="sm:w-[150px]">
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk</option>
              </Select>
              <Select aria-label="Domain" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="sm:w-[150px]">
                {domains.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'All Domains' : cat}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="kd-table-wrap">
          <table className="kd-table min-w-[880px] whitespace-nowrap">
            <thead>
              <tr>
                <th scope="col">Risk ID</th>
                <th scope="col">Mine</th>
                <th scope="col">Observation</th>
                <th scope="col">Domain</th>
                <th scope="col">Risk Level</th>
                <th scope="col">Confidence</th>
                <th scope="col">Applicable Obligation</th>
                <th scope="col">Status</th>
                <th scope="col">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((risk) => (
                <tr
                  key={risk.id}
                  data-clickable="true"
                  data-selected={selectedRiskId === risk.id}
                  tabIndex={0}
                  onClick={() => setSelectedRiskId(risk.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSelectedRiskId(risk.id)
                  }}
                >
                  <td className="font-mono text-[12px] font-medium text-amber">{risk.id}</td>
                  <td className="font-mono text-[12px] text-text-primary">{risk.mine}</td>
                  <td className="font-medium text-text-primary">{risk.observation}</td>
                  <td>{risk.domain}</td>
                  <td>
                    <StatusBadge status={risk.riskLevel} />
                  </td>
                  <td>
                    <ConfidenceMeter value={risk.confidence} />
                  </td>
                  <td className="font-mono text-[12px]">{risk.obligation}</td>
                  <td>
                    <StatusBadge status={statusLabel[risk.status] ?? risk.status} hideDot />
                  </td>
                  <td className="kd-num">{formatDate(risk.lastUpdated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRisks.length === 0 && <EmptyState compact icon={SearchX} title="No risks match the current filters." description="Try a different search term or clear the filters." />}
        </div>
      </Card>

      {/* Detail sheet */}
      <SideSheet
        open={!!selectedRisk}
        onClose={() => setSelectedRiskId(null)}
        closeOnEscape={!demoActive}
        eyebrow="Risk detail"
        title={selectedRisk?.observation}
        badges={selectedRisk && <StatusBadge status={selectedRisk.riskLevel} />}
        subtitle={
          selectedRisk && (
            <span className="font-mono">
              {selectedRisk.id} • {selectedRisk.mine} • {selectedRisk.domain}
            </span>
          )
        }
      >
        {selectedRisk && (
          <div className="space-y-6 p-5">
            {/* WHY THIS WAS FLAGGED */}
            <DemoHighlight step={5} tooltip="The Compliance & Risk Engine breaks down exactly why WCL-04's risk score was elevated, linking evidence to statutory obligations.">
              <SheetSection title="Why this was flagged" icon={<Activity />}>
                <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
                  <div>
                    <p className="mb-1 text-[11px] font-medium text-text-muted">Evidence</p>
                    <p className="rounded-md border border-border bg-inset px-3 py-2 text-[13px] leading-5 text-text-primary">{selectedRisk.evidence}</p>
                  </div>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailItem label="Observation">
                      <span className="font-medium">{selectedRisk.observation}</span>
                    </DetailItem>
                    <DetailItem label="Applicable Obligation">
                      <span className="font-mono text-amber">{selectedRisk.obligation}</span>
                    </DetailItem>
                  </dl>
                  <div>
                    <p className="mb-1.5 text-[11px] font-medium text-text-muted">Risk Factors</p>
                    <ul className="space-y-1.5">
                      {selectedRisk.riskFactors.map((rf) => (
                        <li key={rf} className="flex items-start gap-2 text-[13px] text-text-secondary">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-warning-solid" aria-hidden="true" />
                          {rf}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-info" /> AI Reasoning
                      </span>
                      <span className="font-semibold text-info kd-num">Confidence: {selectedRisk.confidence}%</span>
                    </p>
                    <p className="rounded-md border border-info/25 bg-info-soft px-3 py-2.5 text-[13px] leading-5 text-text-primary">{selectedRisk.aiReasoning}</p>
                  </div>
                  <div className="rounded-md border border-amber/30 bg-amber-soft px-3 py-2.5">
                    <p className="text-[11px] font-medium text-amber">Recommended Action</p>
                    <p className="mt-0.5 flex items-start gap-2 text-[13px] font-semibold leading-5 text-text-primary">
                      <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                      {selectedRisk.recommendedAction}
                    </p>
                  </div>
                </div>
              </SheetSection>
            </DemoHighlight>

            {/* LOGICAL CHAIN */}
            <SheetSection title="Reasoning chain" icon={<FileText />}>
              <ol className="relative space-y-2">
                {[
                  { label: 'Evidence', tone: 'neutral' },
                  { label: 'Observation', tone: 'neutral' },
                  { label: 'Obligation', tone: 'accent' },
                  { label: 'Risk Engine', tone: 'info' },
                  { label: 'Risk', tone: 'danger' },
                  { label: 'Action', tone: 'neutral' },
                ].map((node, idx, arr) => (
                  <li key={node.label} className="relative flex items-center gap-3">
                    {idx < arr.length - 1 && <span aria-hidden="true" className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-px bg-border" />}
                    <span
                      className={cn(
                        'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold kd-num',
                        node.tone === 'danger' && 'border-danger/40 bg-danger-soft text-danger',
                        node.tone === 'accent' && 'border-amber/40 bg-amber-soft text-amber',
                        node.tone === 'info' && 'border-info/40 bg-info-soft text-info',
                        node.tone === 'neutral' && 'border-border bg-surface text-text-muted'
                      )}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={cn(
                        'flex-1 rounded-md border px-3 py-1.5 text-[13px]',
                        node.tone === 'danger' ? 'border-danger/25 bg-danger-soft/60 font-semibold text-danger' : node.tone === 'info' ? 'border-info/25 bg-info-soft/60 font-semibold text-info' : node.tone === 'accent' ? 'border-amber/25 bg-amber-soft/60 font-medium text-amber' : 'border-border bg-surface text-text-secondary'
                      )}
                    >
                      {node.label}
                    </span>
                  </li>
                ))}
              </ol>
            </SheetSection>

            {/* RISK PROPAGATION */}
            <SheetSection title="Risk propagation" icon={<GitBranch />}>
              <ol className="rounded-lg border border-border bg-surface p-4">
                {selectedRisk.propagation.map((step, idx) => {
                  const last = idx === selectedRisk.propagation.length - 1
                  return (
                    <li key={step} className="relative flex gap-3 pb-4 last:pb-0">
                      {!last && <span aria-hidden="true" className="absolute left-3 top-7 h-[calc(100%-24px)] w-px bg-border" />}
                      <span
                        className={cn(
                          'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold kd-num',
                          idx === 0 ? 'border-border bg-inset text-text-secondary' : last ? 'border-danger/40 bg-danger-soft text-danger' : 'border-warning/40 bg-warning-soft text-warning'
                        )}
                      >
                        {idx + 1}
                      </span>
                      <span className={cn('pt-0.5 text-[13px]', last ? 'font-semibold text-text-primary' : 'text-text-secondary')}>{step}</span>
                    </li>
                  )
                })}
              </ol>
            </SheetSection>
          </div>
        )}
      </SideSheet>
    </div>
  )
}

function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Confidence ${value}%`}>
      <span className="h-1 w-12 overflow-hidden rounded-full bg-chart-track">
        <span className="block h-full rounded-full bg-info-solid" style={{ width: `${value}%` }} />
      </span>
      <span className="text-[12px] text-text-primary kd-num">{value}%</span>
    </div>
  )
}
