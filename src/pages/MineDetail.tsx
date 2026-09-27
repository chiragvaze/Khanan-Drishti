import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin, Users, Pickaxe, ShieldAlert, ArrowLeft,
  Brain, Activity,
  FileText, Image as ImageIcon,
  CheckCircle, HardHat, FileSearch, Ruler, Film, Radio, Mic, ArrowRight, SearchX,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { StatusBadge, Tag } from '../components/shared/StatusBadge'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Tabs } from '../components/ui/Tabs'
import { EmptyState } from '../components/ui/States'
import { mines } from '../data/mines'
import { inspections } from '../data/inspections'
import { observations } from '../data/observations'
import { capas } from '../data/capas'
import { evidence } from '../data/evidence'
import type { EvidenceType } from '../data/types'
import { chartColors } from '../lib/chart'
import { cn, complianceTone, formatDate, formatDateTime, toneFill, toneText } from '../lib/utils'

const tabs = ['Overview', 'Compliance', 'Inspections', 'Observations', 'CAPAs', 'Contractors', 'Evidence'] as const
type TabName = (typeof tabs)[number]

const evidenceIcon: Record<EvidenceType, typeof ImageIcon> = {
  PHOTO: ImageIcon,
  VIDEO: Film,
  DOCUMENT: FileText,
  SENSOR_DATA: Radio,
  AUDIO: Mic,
}

export default function MineDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabName>('Overview')

  const mine = mines.find((m) => m.id === id)
  if (!mine) {
    return (
      <Card>
        <EmptyState
          icon={SearchX}
          title="Mine not found"
          description="The mine you are looking for does not exist or is no longer monitored."
          actionLabel="Back to Mines"
          onAction={() => navigate('/mines')}
        />
      </Card>
    )
  }

  const mineInspections = inspections.filter((i) => i.mineId === mine.id)
  const mineObservations = observations.filter((o) => o.mineId === mine.id)
  const mineCAPAs = capas.filter((c) => c.mineId === mine.id)
  const mineEvidence = evidence.filter((e) => e.mineId === mine.id)

  const complianceData = [
    { name: 'Compliant', value: mine.complianceScore, color: chartColors.success },
    { name: 'Non-Compliant', value: 100 - mine.complianceScore, color: chartColors.track },
  ]

  const openObsCount = mineObservations.filter((o) => o.status !== 'RESOLVED').length
  const overdueCapaCount = mineCAPAs.filter((c) => c.status === 'OVERDUE').length
  const tone = complianceTone(mine.complianceScore)

  const isWcl04Demo = mine.id === 'mine-wcl-04'

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate('/mines')} className="-ml-2">
        <ArrowLeft /> Back to Mines
      </Button>

      {/* Profile header */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-6 items-center rounded-[5px] border border-amber/30 bg-amber-soft px-2 font-mono text-[12px] font-semibold text-amber">{mine.code}</span>
              <StatusBadge status={mine.riskLevel} size="md" />
              <StatusBadge status={mine.status} size="md" hideDot />
            </div>
            <h1 className="text-[22px] font-semibold leading-8 tracking-[-0.015em] text-text-primary sm:text-[26px]">{mine.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-secondary">
              <span className="font-medium text-text-primary">
                {mine.subsidiary} ({mine.subsidiaryCode})
              </span>
              <span className="hidden text-text-disabled sm:inline" aria-hidden="true">
                •
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-text-muted" /> {mine.location}, {mine.state}
              </span>
            </div>
          </div>

          <dl className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Workforce', value: mine.totalWorkers, Icon: Users },
              { label: 'Annual Prod.', value: `${mine.annualProductionMT} MT`, Icon: Pickaxe },
              { label: 'Type', value: mine.type.replace('_', ' '), Icon: HardHat },
              { label: 'Area', value: mine.area, Icon: Ruler },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="bg-inset px-4 py-2.5">
                <dt className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </dt>
                <dd className="mt-0.5 whitespace-nowrap text-[13px] font-semibold text-text-primary kd-num">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Stats strip */}
        <dl className="grid grid-cols-2 border-t border-border md:grid-cols-4">
          <div className="border-b border-r border-border px-5 py-4 md:border-b-0">
            <dt className="kd-overline">Compliance Score</dt>
            <dd className="mt-1 flex items-center gap-3">
              <span className={cn('text-[24px] font-semibold leading-none kd-num', toneText[tone])}>{mine.complianceScore}%</span>
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-chart-track">
                <span className={cn('block h-full rounded-full', toneFill[tone])} style={{ width: `${mine.complianceScore}%` }} />
              </span>
            </dd>
          </div>
          <div className="border-b border-border px-5 py-4 md:border-b-0 md:border-r">
            <dt className="kd-overline">Open Observations</dt>
            <dd className="mt-1 text-[24px] font-semibold leading-none text-text-primary kd-num">{openObsCount}</dd>
          </div>
          <div className="border-r border-border px-5 py-4">
            <dt className="kd-overline">Overdue CAPA</dt>
            <dd className={cn('mt-1 text-[24px] font-semibold leading-none kd-num', overdueCapaCount > 0 ? 'text-danger' : 'text-text-primary')}>{overdueCapaCount}</dd>
          </div>
          <div className="px-5 py-4">
            <dt className="kd-overline">Last Inspection</dt>
            <dd className="mt-1.5 text-[16px] font-semibold leading-none text-text-primary kd-num">{formatDate(mine.lastInspectionDate)}</dd>
          </div>
        </dl>
      </Card>

      {/* Tabs */}
      <Tabs
        aria-label="Mine sections"
        value={activeTab}
        onChange={setActiveTab}
        items={tabs.map((tab) => ({
          value: tab,
          label: tab,
          count: tab === 'Observations' && mineObservations.length > 0 ? mineObservations.length : tab === 'CAPAs' && mineCAPAs.length > 0 ? mineCAPAs.length : tab === 'Evidence' && mineEvidence.length > 0 ? mineEvidence.length : undefined,
        }))}
      />

      {/* Tab Content */}
      <div role="tabpanel" aria-label={activeTab} className="min-h-[320px]">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Left Column: Stats & Drivers */}
            <div className="space-y-4">
              <Card>
                <CardHeader title="Compliance health" icon={<Activity />} />
                <CardContent className="flex items-center gap-5">
                  <div className="relative h-[132px] w-[132px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={complianceData} cx="50%" cy="50%" innerRadius={50} outerRadius={64} dataKey="value" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
                          {complianceData.map((entry) => (
                            <Cell key={entry.name} fill={entry.name === 'Compliant' ? `var(--color-${tone}-solid)` : entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[24px] font-semibold leading-none text-text-primary kd-num">{mine.complianceScore}%</span>
                      <span className="mt-1 text-[11px] text-text-muted">compliant</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-[13px]">
                    <li className="flex items-center gap-2 text-text-secondary">
                      <span className={cn('h-2.5 w-2.5 rounded-sm', toneFill[tone])} /> Compliant
                      <span className="ml-auto pl-3 font-semibold text-text-primary kd-num">{mine.complianceScore}%</span>
                    </li>
                    <li className="flex items-center gap-2 text-text-secondary">
                      <span className="h-2.5 w-2.5 rounded-sm bg-chart-track ring-1 ring-border" /> Non-Compliant
                      <span className="ml-auto pl-3 font-semibold text-text-primary kd-num">{100 - mine.complianceScore}%</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Key risk drivers" icon={<ShieldAlert />} />
                <CardContent>
                  <ul className="space-y-3">
                    {isWcl04Demo ? (
                      <>
                        <RiskDriver tone="danger">Overdue ventilation CAPA in underground Panel 3B indicating prolonged non-compliance.</RiskDriver>
                        <RiskDriver tone="warning">Missing daily environmental telemetry evidence for 3 continuous shifts.</RiskDriver>
                        <RiskDriver tone="warning">Contractor safety observation open for &gt; 15 days.</RiskDriver>
                      </>
                    ) : (
                      <li className="flex items-center gap-2 text-[13px] text-text-muted">
                        <CheckCircle className="h-4 w-4 text-success" /> No critical risk drivers identified.
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Middle/Right Column: Risk Explanation (WCL-04 Demo) or General Activity */}
            <div className="lg:col-span-2">
              {isWcl04Demo ? (
                <Card>
                  <CardHeader title="AI risk classification chain" subtitle="How the current risk level was derived" icon={<Brain />} actions={<StatusBadge status="HIGH" />} />
                  <CardContent className="space-y-5">
                    <div className="rounded-lg border border-danger/25 bg-danger-soft px-4 py-3">
                      <h4 className="text-[14px] font-semibold text-danger">Unsafe ventilation condition detected</h4>
                      <p className="mt-1 text-[13px] leading-5 text-text-secondary">
                        AI systems detected a critical safety pattern combining low air velocity readings from telemetry and visual evidence of damaged ventilation ducting in Panel
                        3B.
                      </p>
                    </div>

                    <ol className="relative space-y-4">
                      <span aria-hidden="true" className="absolute bottom-5 left-[19px] top-5 w-px bg-border" />
                      <ChainStep step={1} label="Evidence uploaded" title="Damaged Ventilation Ducting (Photo + Sensor)" Icon={ImageIcon} tone="neutral">
                        Inspector uploaded field photo showing 1.5m tear in flexible ducting at Station 4+200. Correlated with telemetry reading of 0.3 m/s air velocity.
                      </ChainStep>
                      <ChainStep step={2} label="AI observation created" title="Ventilation effectiveness compromised" Icon={FileSearch} tone="accent">
                        Vision AI confirmed duct tear. Data AI correlated low velocity with risk of methane buildup at the working face.
                      </ChainStep>
                      <ChainStep step={3} label="Regulatory mapping" title="Coal Mines Regulations 2017, Reg. 130" Icon={FileText} tone="neutral">
                        System mapped observation to statutory requirement: Minimum 1.0 m/s air velocity must be maintained in the return airway.
                      </ChainStep>
                      <ChainStep step={4} label="Risk classified" title="HIGH RISK ASSIGNED" Icon={ShieldAlert} tone="danger">
                        Due to direct violation of CMR 2017 Reg. 130 and presence of methane hazard, the issue was automatically escalated to HIGH risk and DGMS notified.
                      </ChainStep>
                    </ol>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader title="Recent inspections" icon={<FileSearch />} />
                  <ul className="divide-y divide-border">
                    {mineInspections.slice(0, 5).map((insp) => (
                      <li key={insp.id} className="flex items-start justify-between gap-4 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-text-primary">{insp.type.replace('_', ' ')} Inspection</p>
                          <p className="mt-0.5 text-[12px] text-text-muted">
                            {insp.inspector} • <span className="kd-num">{formatDate(insp.date)}</span>
                          </p>
                        </div>
                        <StatusBadge status={insp.riskLevel} />
                      </li>
                    ))}
                  </ul>
                  {mineInspections.length === 0 && <EmptyState compact title="No recent inspections" description="No inspections have been recorded for this mine yet." />}
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Compliance' && (
          <Card>
            <EmptyState
              icon={CheckCircle}
              title="Compliance History Module"
              description="Detailed statutory compliance mapping and historical scoring trends will be available here."
            />
          </Card>
        )}

        {activeTab === 'Inspections' && (
          <Card className="overflow-hidden">
            <div className="kd-table-wrap">
              <table className="kd-table whitespace-nowrap">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Date</th>
                    <th scope="col">Inspector</th>
                    <th scope="col">Type</th>
                    <th scope="col">Status</th>
                    <th scope="col">Observations</th>
                    <th scope="col">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {mineInspections.map((insp) => (
                    <tr key={insp.id}>
                      <td className="font-mono text-[12px] text-amber">{insp.id.slice(-8)}</td>
                      <td className="text-text-primary kd-num">{formatDate(insp.date)}</td>
                      <td>{insp.inspector}</td>
                      <td>{insp.type.replace('_', ' ')}</td>
                      <td>
                        <StatusBadge status={insp.status} hideDot />
                      </td>
                      <td className="text-text-primary kd-num">
                        {insp.observationsCount}
                        {insp.highRiskCount > 0 && <span className="ml-1.5 text-danger">({insp.highRiskCount} high)</span>}
                      </td>
                      <td>
                        <StatusBadge status={insp.riskLevel} />
                      </td>
                    </tr>
                  ))}
                  {mineInspections.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState compact title="No inspections" description="No inspections have been recorded for this mine." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'Observations' && (
          <div className="space-y-3">
            {mineObservations.map((obs) => (
              <Card key={obs.id} className="p-4 transition-colors hover:border-border-strong">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={obs.riskLevel} />
                      <StatusBadge status={obs.status} hideDot />
                      <Tag>{obs.type}</Tag>
                    </div>
                    <h4 className="text-[14px] font-semibold text-text-primary">{obs.title}</h4>
                    <p className="max-w-4xl text-[13px] leading-5 text-text-secondary">{obs.description}</p>
                    <div className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-border bg-inset px-2.5 py-1.5 font-mono text-[11px] text-text-muted">
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span>{obs.regulationRef}</span>
                      <span aria-hidden="true">—</span>
                      <span className="text-amber">{obs.regulationClause}</span>
                    </div>
                  </div>
                  {obs.aiVerified && (
                    <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-success/25 bg-success-soft px-2.5 py-1 text-[12px] font-medium text-success">
                        <Brain className="h-3.5 w-3.5" /> AI Verified ({obs.aiConfidence}%)
                      </span>
                      <span className="text-[11px] text-text-muted kd-num">{obs.dateIdentified}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {mineObservations.length === 0 && (
              <Card>
                <EmptyState compact title="No observations" description="No observations have been recorded for this mine." />
              </Card>
            )}
          </div>
        )}

        {activeTab === 'CAPAs' && (
          <div className="space-y-3">
            {mineCAPAs.length === 0 ? (
              <Card>
                <EmptyState compact icon={CheckCircle} title="No CAPAs for this mine" description="There are no corrective or preventive actions assigned." />
              </Card>
            ) : (
              mineCAPAs.map((capa) => (
                <Card key={capa.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={capa.priority} />
                      <StatusBadge status={capa.status} hideDot />
                    </div>
                    <h4 className="text-[14px] font-semibold text-text-primary">{capa.title}</h4>
                    <p className="max-w-4xl text-[13px] leading-5 text-text-secondary">{capa.description}</p>
                  </div>
                  <div className="mt-4 space-y-2.5 rounded-lg border border-border bg-inset p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                      <span className="text-text-muted">
                        Progress <span className="font-semibold text-text-primary kd-num">{capa.progressPercent}%</span>
                      </span>
                      <span className="text-text-muted">
                        Due: <span className={cn('font-medium kd-num', capa.status === 'OVERDUE' ? 'text-danger' : 'text-text-primary')}>{formatDate(capa.dueDate)}</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-chart-track">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', capa.status === 'OVERDUE' ? 'bg-danger-solid' : capa.progressPercent === 100 ? 'bg-success-solid' : 'bg-accent')}
                        style={{ width: `${capa.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-[12px] text-text-secondary">
                      <HardHat className="h-4 w-4 text-text-muted" />
                      Assigned to: <span className="font-medium text-text-primary">{capa.assignedContractor}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'Contractors' && (
          <Card>
            <EmptyState
              icon={HardHat}
              title="Contractor Safety Profiles"
              description="Detailed performance metrics, safety incidents, and clearance statuses for all active contractors at this mine."
            />
          </Card>
        )}

        {activeTab === 'Evidence' && (
          <Card className="overflow-hidden">
            <CardHeader
              title="Evidence vault"
              subtitle="Central repository for inspection photos, videos, drone footage, and IoT telemetry data logs."
              icon={<ImageIcon />}
              actions={
                <Button variant="ghost" size="sm" onClick={() => navigate('/evidence')}>
                  Open repository <ArrowRight />
                </Button>
              }
            />
            {mineEvidence.length === 0 ? (
              <EmptyState compact icon={ImageIcon} title="No evidence captured" description="No evidence has been captured for this mine yet." />
            ) : (
              <ul className="divide-y divide-border">
                {mineEvidence.map((ev) => {
                  const Icon = evidenceIcon[ev.type]
                  return (
                    <li key={ev.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-inset text-text-muted">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[12px] font-semibold text-amber">{ev.id}</span>
                          <span className="truncate text-[13px] text-text-primary">{ev.fileName}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-text-muted kd-num">
                          {ev.type.replace('_', ' ')} · {formatDateTime(ev.capturedDate)}
                        </div>
                      </div>
                      {ev.confidence && <span className="hidden text-[12px] font-medium text-text-secondary kd-num sm:inline">{ev.confidence}%</span>}
                      <StatusBadge status={ev.aiAnalysisStatus} />
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

function RiskDriver({ tone, children }: { tone: 'danger' | 'warning'; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className={cn('mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full', tone === 'danger' ? 'bg-danger-solid' : 'bg-warning-solid')} aria-hidden="true" />
      <p className="text-[13px] leading-5 text-text-primary">{children}</p>
    </li>
  )
}

function ChainStep({
  step,
  label,
  title,
  Icon,
  tone,
  children,
}: {
  step: number
  label: string
  title: string
  Icon: typeof ImageIcon
  tone: 'neutral' | 'accent' | 'danger'
  children: React.ReactNode
}) {
  const node = {
    neutral: 'border-border bg-surface text-text-muted',
    accent: 'border-amber/40 bg-amber-soft text-amber',
    danger: 'border-danger/40 bg-danger-soft text-danger',
  }[tone]
  const panel = {
    neutral: 'border-border bg-inset',
    accent: 'border-amber/25 bg-amber-soft/60',
    danger: 'border-danger/25 bg-danger-soft/60',
  }[tone]
  return (
    <li className="relative flex items-start gap-4">
      <span className={cn('relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border', node)}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className={cn('min-w-0 flex-1 rounded-lg border px-4 py-3', panel)}>
        <div className="kd-overline">
          Step {step} · {label}
        </div>
        <h5 className={cn('mt-0.5 text-[13px] font-semibold', tone === 'danger' ? 'text-danger' : tone === 'accent' ? 'text-amber' : 'text-text-primary')}>{title}</h5>
        <p className="mt-1 text-[12px] leading-[18px] text-text-secondary">{children}</p>
      </div>
    </li>
  )
}
