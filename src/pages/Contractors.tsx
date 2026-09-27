import { useState, useMemo, useEffect } from 'react'
import {
  HardHat, ShieldAlert, AlertTriangle, CheckCircle, Activity, FileText, Clock, ExternalLink, LayoutGrid, Rows3, SearchX,
} from 'lucide-react'
import { KPICard } from '../components/shared/KPICard'
import { StatusBadge } from '../components/shared/StatusBadge'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { SearchInput, Select } from '../components/ui/Field'
import { SegmentedControl } from '../components/ui/Tabs'
import { EmptyState } from '../components/ui/States'
import { SideSheet, SheetSection } from '../components/ui/SideSheet'
import { cn, formatDate, toneFill, toneText } from '../lib/utils'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/ui/ToastProvider'
import { useDemo } from '../contexts/DemoContext'
import DemoHighlight from '../components/shared/DemoHighlight'

// ----------------------------------------------------------------------
// Mock Data (Contractor Governance)
// ----------------------------------------------------------------------
const mockContractors = [
  {
    id: 'C-001',
    name: 'ABC Mining Services',
    mine: 'WCL-04',
    safetyScore: 72,
    attendance: '88%',
    capaClosure: '65%',
    incidents: 2,
    overallStatus: 'UNDER_REVIEW',
    activeCapas: [
      { id: 'KD-102', title: 'Unsafe ventilation condition' }
    ],
    timeline: [
      { date: '2026-09-20', event: 'Safety audit conducted (Score: 72%)' },
      { date: '2026-09-18', event: 'Incident reported: Minor equipment damage' },
      { date: '2026-09-15', event: 'CAPA KD-102 assigned' },
    ],
    observations: [
      'Consistent delays in closing ventilation CAPAs.',
      'PPE compliance at 92%, slightly below mine average.'
    ],
    breakdown: {
      training: 85,
      ppe: 92,
      equipment: 65,
      reporting: 70
    }
  },
  {
    id: 'C-002',
    name: 'ElecTech Corp',
    mine: 'BCCL-06',
    safetyScore: 58,
    attendance: '95%',
    capaClosure: '40%',
    incidents: 1,
    overallStatus: 'HIGH_RISK',
    activeCapas: [
      { id: 'KD-084', title: 'FR cable installation delayed' }
    ],
    timeline: [
      { date: '2026-09-21', event: 'Escalation raised for FR cable CAPA' },
      { date: '2026-09-15', event: 'Failed electrical compliance check' },
    ],
    observations: [
      'Critical delays in safety-critical electrical installations.',
      'Staff attendance is strong, but technical compliance is lacking.'
    ],
    breakdown: {
      training: 70,
      ppe: 95,
      equipment: 45,
      reporting: 55
    }
  },
  {
    id: 'C-003',
    name: 'GeoSys Ltd',
    mine: 'NCL-12',
    safetyScore: 94,
    attendance: '98%',
    capaClosure: '100%',
    incidents: 0,
    overallStatus: 'ACTIVE',
    activeCapas: [],
    timeline: [
      { date: '2026-09-17', event: 'CAPA KD-056 closed successfully' },
      { date: '2026-09-10', event: 'Quarterly compliance review passed' },
    ],
    observations: [
      'Excellent track record of timely maintenance.',
      'Proactive reporting of geotechnical issues.'
    ],
    breakdown: {
      training: 98,
      ppe: 100,
      equipment: 90,
      reporting: 95
    }
  },
  {
    id: 'C-004',
    name: 'Global Haulage',
    mine: 'SECL-07',
    safetyScore: 82,
    attendance: '91%',
    capaClosure: '80%',
    incidents: 0,
    overallStatus: 'ACTIVE',
    activeCapas: [
      { id: 'KD-115', title: 'Dust suppression failure' }
    ],
    timeline: [
      { date: '2026-09-21', event: 'Dust suppression CAPA assigned' },
      { date: '2026-09-01', event: 'Monthly environmental audit passed' },
    ],
    observations: [
      'Generally reliable, minor recent issue with dust suppression system.',
      'Driver fatigue management protocols are well implemented.'
    ],
    breakdown: {
      training: 80,
      ppe: 85,
      equipment: 75,
      reporting: 88
    }
  }
]

type Contractor = (typeof mockContractors)[number]

const scoreTone = (v: number) => (v >= 85 ? 'success' : v >= 70 ? 'warning' : 'danger') as 'success' | 'warning' | 'danger'

export default function Contractors() {
  const [search, setSearch] = useState('')
  const [mineFilter, setMineFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null)
  const [view, setView] = useState<'cards' | 'table'>('cards')

  const navigate = useNavigate()
  const { toast } = useToast()

  const { isActive: demoActive, currentStep } = useDemo()

  useEffect(() => {
    if (demoActive && currentStep === 7 && !selectedContractorId) {
      setSelectedContractorId('C-001')
    }
  }, [demoActive, currentStep, selectedContractorId])

  const mines = useMemo(() => ['ALL', ...new Set(mockContractors.map((c) => c.mine))], [])
  const statuses = useMemo(() => ['ALL', ...new Set(mockContractors.map((c) => c.overallStatus))], [])

  const filtered = useMemo(() => {
    return mockContractors.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())
      const matchMine = mineFilter === 'ALL' || c.mine === mineFilter
      const matchStatus = statusFilter === 'ALL' || c.overallStatus === statusFilter
      return matchSearch && matchMine && matchStatus
    })
  }, [search, mineFilter, statusFilter])

  const totalContractors = mockContractors.length
  const underReviewCount = mockContractors.filter((c) => c.overallStatus === 'UNDER_REVIEW').length
  const highRiskCount = mockContractors.filter((c) => c.overallStatus === 'HIGH_RISK').length
  const pendingCapaCount = mockContractors.reduce((sum, c) => sum + c.activeCapas.length, 0)

  const selectedContractor = mockContractors.find((c) => c.id === selectedContractorId)

  const handleCapaClick = (capaId: string) => {
    toast({ title: `Navigating to CAPA ${capaId}`, type: 'info' })
    navigate('/capa') // In a real app we'd pass state or URL params to open the specific CAPA
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Contractors" description="Contractor governance — safety performance, CAPA accountability and compliance history." />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <KPICard label="TOTAL CONTRACTORS" value={totalContractors} subtitle="Across all mines" icon={<HardHat />} />
        <KPICard label="UNDER REVIEW" value={underReviewCount} subtitle="Performance watch" variant="warning" icon={<Clock />} />
        <KPICard label="HIGH RISK" value={highRiskCount} subtitle="Immediate attention" variant="danger" icon={<ShieldAlert />} />
        <KPICard label="PENDING CAPA" value={pendingCapaCount} subtitle="Active assignments" variant="warning" icon={<AlertTriangle />} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <SearchInput value={search} onValueChange={setSearch} placeholder="Search contractors..." wrapperClassName="lg:w-72" />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select aria-label="Mine" value={mineFilter} onChange={(e) => setMineFilter(e.target.value)} className="sm:w-[140px]">
            {mines.map((m) => (
              <option key={m} value={m}>
                {m === 'ALL' ? 'All Mines' : m}
              </option>
            ))}
          </Select>
          <Select aria-label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-[160px]">
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center justify-between gap-3 lg:ml-auto">
          <span className="text-[12px] text-text-muted kd-num">
            {filtered.length} of {totalContractors} contractors
          </span>
          <SegmentedControl
            aria-label="View"
            value={view}
            onChange={setView}
            items={[
              { value: 'cards', label: 'Scorecards', icon: <LayoutGrid /> },
              { value: 'table', label: 'Table', icon: <Rows3 /> },
            ]}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={SearchX} title="No contractors match the current filters." description="Try a different search term or clear the filters." />
        </Card>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {filtered.map((c) => (
            <ContractorScorecard key={c.id} contractor={c} selected={selectedContractorId === c.id} onOpen={() => setSelectedContractorId(c.id)} />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="kd-table-wrap">
            <table className="kd-table min-w-[820px] whitespace-nowrap">
              <thead>
                <tr>
                  <th scope="col">Contractor</th>
                  <th scope="col">Mine</th>
                  <th scope="col">Safety Score</th>
                  <th scope="col" className="kd-cell-num">Attendance</th>
                  <th scope="col" className="kd-cell-num">CAPA Closure</th>
                  <th scope="col" className="kd-cell-num">Incidents</th>
                  <th scope="col">Overall Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const tone = scoreTone(c.safetyScore)
                  return (
                    <tr
                      key={c.id}
                      data-clickable="true"
                      data-selected={selectedContractorId === c.id}
                      tabIndex={0}
                      onClick={() => setSelectedContractorId(c.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setSelectedContractorId(c.id)
                      }}
                    >
                      <td>
                        <p className="text-[13px] font-medium text-text-primary">{c.name}</p>
                        <p className="font-mono text-[11px] text-text-muted">{c.id}</p>
                      </td>
                      <td className="font-mono text-[12px]">{c.mine}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-chart-track">
                            <span className={cn('block h-full rounded-full', toneFill[tone])} style={{ width: `${c.safetyScore}%` }} />
                          </span>
                          <span className={cn('text-[13px] font-semibold kd-num', toneText[tone])}>{c.safetyScore}/100</span>
                        </div>
                      </td>
                      <td className="kd-cell-num">{c.attendance}</td>
                      <td className="kd-cell-num">{c.capaClosure}</td>
                      <td className={cn('kd-cell-num font-semibold', c.incidents > 0 ? 'text-danger' : 'text-text-primary')}>{c.incidents}</td>
                      <td>
                        <StatusBadge status={c.overallStatus} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detail sheet */}
      <SideSheet
        open={!!selectedContractor}
        onClose={() => setSelectedContractorId(null)}
        closeOnEscape={!demoActive}
        eyebrow="Contractor profile"
        title={selectedContractor?.name}
        badges={selectedContractor && <StatusBadge status={selectedContractor.overallStatus} />}
        subtitle={
          selectedContractor && (
            <span>
              <span className="font-mono">{selectedContractor.id}</span> • Assigned to <span className="font-mono">{selectedContractor.mine}</span>
            </span>
          )
        }
      >
        {selectedContractor && (
          <DemoHighlight step={7} tooltip="Contractor safety scores and active CAPAs are linked to ensure full accountability across the supply chain.">
            <div className="space-y-6 p-5">
              {/* Prototype Scorecard */}
              <SheetSection title="Prototype scorecard" icon={<Activity />}>
                <p className="-mt-1 text-[11px] italic text-text-muted">Note: This model is for demonstrative purposes and is not scientifically validated.</p>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2">
                  {[
                    { label: 'Training Compliance', val: selectedContractor.breakdown.training },
                    { label: 'PPE Usage', val: selectedContractor.breakdown.ppe },
                    { label: 'Equipment Safety', val: selectedContractor.breakdown.equipment },
                    { label: 'Reporting Accuracy', val: selectedContractor.breakdown.reporting },
                  ].map((metric) => {
                    const tone = scoreTone(metric.val)
                    return (
                      <div key={metric.label}>
                        <div className="mb-1.5 flex justify-between text-[12px]">
                          <span className="text-text-secondary">{metric.label}</span>
                          <span className={cn('font-semibold kd-num', toneText[tone])}>{metric.val}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-chart-track">
                          <div className={cn('h-full rounded-full transition-all', toneFill[tone])} style={{ width: `${metric.val}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </SheetSection>

              {/* Performance Overview Grid */}
              <section className="grid grid-cols-2 gap-3">
                <StatTile label="Overall Safety Score" Icon={ShieldAlert} value={`${selectedContractor.safetyScore}/100`} valueClass={toneText[scoreTone(selectedContractor.safetyScore)]} />
                <StatTile label="Attendance Rate" Icon={Activity} value={selectedContractor.attendance} />
                <StatTile label="CAPA Closure" Icon={CheckCircle} value={selectedContractor.capaClosure} />
                <StatTile label="Incident History" Icon={AlertTriangle} value={String(selectedContractor.incidents)} valueClass={selectedContractor.incidents > 0 ? 'text-danger' : 'text-success'} />
              </section>

              {/* Pending CAPAs */}
              <SheetSection title="Pending CAPAs">
                {selectedContractor.activeCapas.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedContractor.activeCapas.map((capa) => (
                      <li key={capa.id}>
                        <button
                          type="button"
                          onClick={() => handleCapaClick(capa.id)}
                          className="group flex w-full items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning-soft/60 px-3 py-2.5 text-left transition-colors hover:border-warning/60"
                        >
                          <span className="min-w-0">
                            <span className="block font-mono text-[11px] font-semibold text-warning">{capa.id}</span>
                            <span className="block truncate text-[13px] text-text-primary">{capa.title}</span>
                          </span>
                          <ExternalLink className="h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-text-primary" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-md border border-dashed border-border-strong px-4 py-4 text-center text-[12px] text-text-muted">No active CAPAs assigned.</div>
                )}
              </SheetSection>

              {/* Observations & Timeline */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <SheetSection title="Observations">
                  <ul className="space-y-2">
                    {selectedContractor.observations.map((obs) => (
                      <li key={obs} className="flex gap-2 rounded-md border border-border bg-surface px-3 py-2.5 text-[12px] leading-[18px] text-text-primary">
                        <FileText className="mt-px h-4 w-4 shrink-0 text-text-muted" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </SheetSection>

                <SheetSection title="Compliance timeline">
                  <ol className="relative ml-1.5 space-y-4 border-l border-border">
                    {selectedContractor.timeline.map((event) => (
                      <li key={event.date + event.event} className="relative pl-4">
                        <span className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-border-strong" aria-hidden="true" />
                        <p className="text-[12px] leading-[18px] text-text-primary">{event.event}</p>
                        <p className="mt-0.5 text-[11px] text-text-muted kd-num">{formatDate(event.date)}</p>
                      </li>
                    ))}
                  </ol>
                </SheetSection>
              </div>
            </div>
          </DemoHighlight>
        )}
      </SideSheet>
    </div>
  )
}

function ContractorScorecard({ contractor: c, selected, onOpen }: { contractor: Contractor; selected: boolean; onOpen: () => void }) {
  const tone = scoreTone(c.safetyScore)
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${c.name} scorecard`}
      className={cn(
        'group flex flex-col rounded-lg border bg-surface p-4 text-left shadow-card transition-colors',
        selected ? 'border-amber/60' : 'border-border hover:border-border-strong'
      )}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-semibold text-text-primary">{c.name}</h3>
          <p className="mt-0.5 text-[12px] text-text-muted">
            <span className="font-mono">{c.id}</span> · <span className="font-mono">{c.mine}</span>
          </p>
        </div>
        <StatusBadge status={c.overallStatus} />
      </div>

      <div className="mt-4 flex w-full items-end justify-between gap-4">
        <div>
          <div className="kd-overline">Safety score</div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className={cn('text-[28px] font-semibold leading-8 kd-num', toneText[tone])}>{c.safetyScore}</span>
            <span className="text-[12px] text-text-muted">/100</span>
          </div>
        </div>
        <div className="mb-2 h-1.5 flex-1 overflow-hidden rounded-full bg-chart-track">
          <div className={cn('h-full rounded-full', toneFill[tone])} style={{ width: `${c.safetyScore}%` }} />
        </div>
      </div>

      <dl className="mt-4 grid w-full grid-cols-4 gap-2 border-t border-border pt-3">
        {[
          { label: 'Attend.', value: c.attendance },
          { label: 'CAPA close', value: c.capaClosure },
          { label: 'Incidents', value: String(c.incidents), danger: c.incidents > 0 },
          { label: 'Open CAPA', value: String(c.activeCapas.length), warning: c.activeCapas.length > 0 },
        ].map((m) => (
          <div key={m.label} className="min-w-0">
            <dt className="truncate text-[11px] text-text-muted">{m.label}</dt>
            <dd className={cn('text-[13px] font-semibold kd-num', m.danger ? 'text-danger' : m.warning ? 'text-warning' : 'text-text-primary')}>{m.value}</dd>
          </div>
        ))}
      </dl>
    </button>
  )
}

function StatTile({ label, value, Icon, valueClass }: { label: string; value: string; Icon: typeof Activity; valueClass?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3.5">
      <p className="flex items-center justify-between text-[11px] font-medium text-text-muted">
        <span>{label}</span>
        <Icon className="h-3.5 w-3.5" />
      </p>
      <p className={cn('mt-1 text-[22px] font-semibold leading-7 text-text-primary kd-num', valueClass)}>{value}</p>
    </div>
  )
}
