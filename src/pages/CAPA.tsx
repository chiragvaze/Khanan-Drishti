import { useState, useMemo, useEffect } from 'react'
import {
  ClipboardCheck, Clock, AlertTriangle, CheckCircle, ShieldAlert, User, Paperclip, Activity, Check,
  PlayCircle, ArrowUpCircle, SearchX,
} from 'lucide-react'
import { StatusBadge, Tag } from '../components/shared/StatusBadge'
import { KPICard } from '../components/shared/KPICard'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Tabs } from '../components/ui/Tabs'
import { SearchInput } from '../components/ui/Field'
import { EmptyState } from '../components/ui/States'
import { SideSheet, SheetSection, DetailItem } from '../components/ui/SideSheet'
import { cn, formatDate, formatDateTime } from '../lib/utils'
import { useToast } from '../components/ui/ToastProvider'
import { useDemo } from '../contexts/DemoContext'
import DemoHighlight from '../components/shared/DemoHighlight'

// ----------------------------------------------------------------------
// Mock Data (CAPA Management)
// ----------------------------------------------------------------------
type CapaStatus = 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'CLOSED'

interface TimelineStep {
  id: string
  label: string
  completed: boolean
}

interface ActivityItem {
  timestamp: string
  desc: string
}

interface MockCapa {
  id: string
  observation: string
  mine: string
  risk: string
  owner: string
  slaHours: number
  status: CapaStatus
  created: string
  due: Date
  timeline: TimelineStep[]
  evidence: { name: string, type: string }[]
  activities: ActivityItem[]
}

const now = new Date()
const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000 - 1500000) // ~23.5 hours left
const yesterday = new Date(now.getTime() - 24 * 3600 * 1000)
const nextWeek = new Date(now.getTime() + 7 * 24 * 3600 * 1000)
const today = new Date(now.getTime() + 4 * 3600 * 1000) // Due in 4 hours

const initialCapas: MockCapa[] = [
  {
    id: 'KD-102',
    observation: 'Unsafe ventilation condition',
    mine: 'WCL-04',
    risk: 'HIGH',
    owner: 'ABC Mining Services',
    slaHours: 24,
    status: 'OPEN',
    created: yesterday.toISOString(),
    due: tomorrow,
    timeline: [
      { id: 't1', label: 'Observation raised', completed: true },
      { id: 't2', label: 'Owner assigned', completed: true },
      { id: 't3', label: 'Notification sent', completed: true },
      { id: 't4', label: 'Corrective action started', completed: false },
      { id: 't5', label: 'Evidence requested', completed: false },
      { id: 't6', label: 'Closure pending', completed: false },
    ],
    evidence: [],
    activities: [
      { timestamp: yesterday.toISOString(), desc: 'Observation recorded during inspection.' },
      { timestamp: new Date(yesterday.getTime() + 3600000).toISOString(), desc: 'Assigned to ABC Mining Services.' }
    ]
  },
  {
    id: 'KD-084',
    observation: 'FR cable installation delayed',
    mine: 'BCCL-06',
    risk: 'HIGH',
    owner: 'ElecTech Corp',
    slaHours: 48,
    status: 'ESCALATED',
    created: new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
    due: today,
    timeline: [
      { id: 't1', label: 'Observation raised', completed: true },
      { id: 't2', label: 'Owner assigned', completed: true },
      { id: 't3', label: 'Notification sent', completed: true },
      { id: 't4', label: 'Corrective action started', completed: true },
      { id: 't5', label: 'Evidence requested', completed: true },
      { id: 't6', label: 'Closure pending', completed: false },
    ],
    evidence: [{ name: 'cable_spec.pdf', type: 'DOCUMENT' }],
    activities: [
      { timestamp: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(), desc: 'Escalated due to SLA breach imminent.' }
    ]
  },
  {
    id: 'KD-115',
    observation: 'Dust suppression failure',
    mine: 'SECL-07',
    risk: 'LOW',
    owner: 'Internal Maintenance',
    slaHours: 72,
    status: 'IN_PROGRESS',
    created: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(),
    due: nextWeek,
    timeline: [
      { id: 't1', label: 'Observation raised', completed: true },
      { id: 't2', label: 'Owner assigned', completed: true },
      { id: 't3', label: 'Notification sent', completed: true },
      { id: 't4', label: 'Corrective action started', completed: true },
      { id: 't5', label: 'Evidence requested', completed: false },
      { id: 't6', label: 'Closure pending', completed: false },
    ],
    evidence: [],
    activities: [
      { timestamp: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(), desc: 'Water pump repair initiated.' }
    ]
  },
  {
    id: 'KD-056',
    observation: 'Slope monitoring prism damaged',
    mine: 'NCL-12',
    risk: 'MEDIUM',
    owner: 'GeoSys Ltd',
    slaHours: 48,
    status: 'CLOSED',
    created: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString(),
    due: new Date(now.getTime() - 3 * 24 * 3600 * 1000),
    timeline: [
      { id: 't1', label: 'Observation raised', completed: true },
      { id: 't2', label: 'Owner assigned', completed: true },
      { id: 't3', label: 'Notification sent', completed: true },
      { id: 't4', label: 'Corrective action started', completed: true },
      { id: 't5', label: 'Evidence requested', completed: true },
      { id: 't6', label: 'Closure pending', completed: true },
    ],
    evidence: [{ name: 'prism_replaced.jpg', type: 'PHOTO' }],
    activities: [
      { timestamp: new Date(now.getTime() - 4 * 24 * 3600 * 1000).toISOString(), desc: 'Prism replaced and calibrated. Verified.' },
      { timestamp: new Date(now.getTime() - 3.5 * 24 * 3600 * 1000).toISOString(), desc: 'CAPA closed.' }
    ]
  }
]

const statusTabs = ['ALL', 'OPEN', 'IN_PROGRESS', 'ESCALATED', 'CLOSED']

function formatCountdown(due: Date, status: CapaStatus) {
  if (status === 'CLOSED') return '00:00:00'
  const diff = due.getTime() - new Date().getTime()
  if (diff <= 0) return 'OVERDUE'
  
  const h = Math.floor(diff / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((diff % (1000 * 60)) / 1000)
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function CAPAPage() {
  const [capas, setCapas] = useState<MockCapa[]>(initialCapas)
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [selectedCapaId, setSelectedCapaId] = useState<string | null>(null)
  const { toast } = useToast()

  // SLA Countdown timer
  useEffect(() => {
    const timer = setInterval(() => setCapas((c) => [...c]), 1000) // Force re-render for countdown
    return () => clearInterval(timer)
  }, [])

  const { isActive: demoActive, currentStep } = useDemo()

  // Auto-select KD-102 for Demo Step 6
  useEffect(() => {
    if (demoActive && currentStep === 6 && !selectedCapaId) {
      setSelectedCapaId('KD-102')
    }
  }, [demoActive, currentStep, selectedCapaId])

  const openCount = capas.filter((c) => c.status === 'OPEN').length
  const escalatedCount = capas.filter((c) => c.status === 'ESCALATED').length
  const closedCount = capas.filter((c) => c.status === 'CLOSED').length
  const dueTodayCount = capas.filter((c) => {
    const diff = c.due.getTime() - new Date().getTime()
    return c.status !== 'CLOSED' && diff > 0 && diff <= 24 * 3600 * 1000
  }).length

  const filteredCapas = useMemo(() => {
    return capas.filter((c) => {
      const matchSearch =
        c.id.toLowerCase().includes(search.toLowerCase()) || c.observation.toLowerCase().includes(search.toLowerCase()) || c.mine.toLowerCase().includes(search.toLowerCase())
      const matchStatus = activeTab === 'ALL' || c.status === activeTab
      return matchSearch && matchStatus
    })
  }, [capas, search, activeTab])

  const selectedCapa = capas.find((c) => c.id === selectedCapaId)

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------
  const addActivity = (id: string, desc: string) => {
    setCapas((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return { ...c, activities: [{ timestamp: new Date().toISOString(), desc }, ...c.activities] }
        }
        return c
      })
    )
  }

  const handleMarkInProgress = (id: string) => {
    setCapas((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newTimeline = [...c.timeline]
          newTimeline[3].completed = true // Corrective action started
          return { ...c, status: 'IN_PROGRESS', timeline: newTimeline }
        }
        return c
      })
    )
    addActivity(id, 'Marked IN PROGRESS. Corrective actions initiated.')
    toast({ title: 'CAPA marked in progress', type: 'success' })
  }

  const handleEscalate = (id: string) => {
    setCapas((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'ESCALATED' } : c)))
    addActivity(id, 'ESCALATED to Mine Manager.')
    toast({ title: 'CAPA Escalated', type: 'warning' })
  }

  const handleRequestEvidence = (id: string) => {
    setCapas((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newTimeline = [...c.timeline]
          newTimeline[4].completed = true // Evidence requested
          return { ...c, timeline: newTimeline }
        }
        return c
      })
    )
    addActivity(id, 'Evidence request sent to owner.')
    toast({ title: 'Evidence requested', type: 'info' })
  }

  const handleClose = (id: string) => {
    setCapas((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newTimeline = c.timeline.map((t) => ({ ...t, completed: true }))
          return { ...c, status: 'CLOSED', timeline: newTimeline }
        }
        return c
      })
    )
    addActivity(id, 'CAPA CLOSED. Workflow complete.')
    toast({ title: 'CAPA Closed successfully', type: 'success' })
  }

  const selectedCountdown = selectedCapa ? formatCountdown(selectedCapa.due, selectedCapa.status) : ''

  return (
    <div className="space-y-5">
      <PageHeader title="CAPA Management" description="Corrective and preventive actions tracked against SLA, from observation to verified closure." />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <KPICard label="OPEN" value={openCount} subtitle="Requires action" icon={<AlertTriangle />} />
        <KPICard label="ESCALATED" value={escalatedCount} subtitle="Management review" variant="danger" icon={<ShieldAlert />} />
        <KPICard label="DUE TODAY" value={dueTodayCount} subtitle="SLA expiring" variant="warning" icon={<Clock />} />
        <KPICard label="CLOSED" value={closedCount} subtitle="Verified resolution" variant="success" icon={<CheckCircle />} />
      </div>

      <Card className="overflow-hidden">
        {/* Header, tabs & search */}
        <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-text-primary">
              <ClipboardCheck className="h-4 w-4 text-text-muted" />
              CAPA workspace
            </h2>
            <p className="text-[12px] text-text-muted">Select a CAPA to view its workflow, evidence and activity.</p>
          </div>
          <SearchInput value={search} onValueChange={setSearch} placeholder="Search CAPAs..." wrapperClassName="w-full sm:w-64" />
        </div>
        <Tabs
          aria-label="Filter by status"
          className="mt-3 px-2"
          value={activeTab}
          onChange={setActiveTab}
          items={statusTabs.map((tab) => ({
            value: tab,
            label: tab === 'ALL' ? 'All' : tab.replace('_', ' ').toLowerCase().replace(/^\w/, (ch) => ch.toUpperCase()),
            count: tab === 'ALL' ? capas.length : capas.filter((c) => c.status === tab).length,
          }))}
        />

        {/* Main Table */}
        <div className="kd-table-wrap">
          <table className="kd-table min-w-[820px] whitespace-nowrap">
            <thead>
              <tr>
                <th scope="col">CAPA ID</th>
                <th scope="col">Observation</th>
                <th scope="col">Mine</th>
                <th scope="col">Risk</th>
                <th scope="col">Owner</th>
                <th scope="col">SLA Left</th>
                <th scope="col">Status</th>
                <th scope="col">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredCapas.map((c) => {
                const timeLeft = formatCountdown(c.due, c.status)
                const isOverdue = timeLeft === 'OVERDUE'
                return (
                  <tr
                    key={c.id}
                    data-clickable="true"
                    data-selected={selectedCapaId === c.id}
                    tabIndex={0}
                    onClick={() => setSelectedCapaId(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelectedCapaId(c.id)
                    }}
                  >
                    <td className="font-mono text-[12px] font-medium text-amber">{c.id}</td>
                    <td className="font-medium text-text-primary">{c.observation}</td>
                    <td className="font-mono text-[12px]">{c.mine}</td>
                    <td>
                      <StatusBadge status={c.risk} />
                    </td>
                    <td>{c.owner}</td>
                    <td>
                      <SlaCell value={timeLeft} overdue={isOverdue} closed={c.status === 'CLOSED'} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} hideDot />
                    </td>
                    <td className="kd-num">{formatDate(c.created)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredCapas.length === 0 && <EmptyState compact icon={SearchX} title="No CAPAs match the selected filters." description="Try another status tab or search term." />}
        </div>
      </Card>

      {/* Detail sheet */}
      <SideSheet
        open={!!selectedCapa}
        onClose={() => setSelectedCapaId(null)}
        closeOnEscape={!demoActive}
        eyebrow="CAPA detail"
        title={selectedCapa?.observation}
        badges={selectedCapa && <StatusBadge status={selectedCapa.status} hideDot />}
        subtitle={
          selectedCapa && (
            <span className="font-mono">
              {selectedCapa.id} • {selectedCapa.mine}
            </span>
          )
        }
      >
        {selectedCapa && (
          <DemoHighlight step={6} tooltip="The Corrective & Preventive Action (CAPA) is tracked against a strict SLA timer to ensure accountability.">
            <div className="space-y-6 p-5">
              {/* Meta Details */}
              <dl className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-4">
                <DetailItem label="Risk" icon={<ShieldAlert />}>
                  <StatusBadge status={selectedCapa.risk} />
                </DetailItem>
                <DetailItem label="Owner" icon={<User />}>
                  <span className="font-medium">{selectedCapa.owner}</span>
                </DetailItem>
                <DetailItem label="SLA Term" icon={<Clock />}>
                  <span className="kd-num">{selectedCapa.slaHours} hours</span>
                </DetailItem>
                <DetailItem label="Active SLA" icon={<Activity />}>
                  <span
                    className={cn(
                      'font-mono text-[18px] font-semibold kd-num',
                      selectedCountdown === 'OVERDUE' ? 'text-danger' : selectedCapa.status === 'CLOSED' ? 'text-success' : 'text-warning'
                    )}
                  >
                    {selectedCountdown}
                  </span>
                </DetailItem>
              </dl>

              {/* Workflow (Detection -> Action -> Follow-up -> Closure) */}
              <SheetSection title="Workflow progress">
                <ol className="flex items-start rounded-lg border border-border bg-surface px-3 py-4">
                  {['DETECTION', 'ACTION', 'FOLLOW-UP', 'CLOSURE'].map((step, idx, arr) => {
                    let isActive = false
                    let isDone = false

                    if (selectedCapa.status === 'CLOSED') {
                      isDone = true
                    } else if (selectedCapa.status === 'OPEN' && idx === 0) {
                      isActive = true
                    } else if (selectedCapa.status === 'IN_PROGRESS') {
                      if (idx < 2) isDone = true
                      if (idx === 2) isActive = true
                    } else if (selectedCapa.status === 'ESCALATED') {
                      if (idx < 2) isDone = true
                      if (idx === 1) isActive = true // Escalated is a blocker in action
                    }

                    return (
                      <li key={step} className="relative flex flex-1 flex-col items-center gap-2">
                        {idx < arr.length - 1 && (
                          <span aria-hidden="true" className={cn('absolute left-1/2 top-3 h-0.5 w-full', isDone ? 'bg-success-solid' : 'bg-border')} />
                        )}
                        <span
                          className={cn(
                            'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                            isDone ? 'border-success-solid bg-success-solid text-white' : isActive ? 'border-accent bg-surface text-amber' : 'border-border bg-surface text-text-muted'
                          )}
                        >
                          {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="text-[10px] font-semibold kd-num">{idx + 1}</span>}
                        </span>
                        <span className={cn('text-center text-[10px] font-semibold tracking-[0.06em]', isDone ? 'text-success' : isActive ? 'text-amber' : 'text-text-muted')}>
                          {step}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </SheetSection>

              {/* Actions Box */}
              {selectedCapa.status !== 'CLOSED' && (
                <SheetSection title="Available actions">
                  <div className="flex flex-wrap gap-2">
                    {selectedCapa.status === 'OPEN' && (
                      <Button variant="secondary" size="sm" onClick={() => handleMarkInProgress(selectedCapa.id)}>
                        <PlayCircle /> Mark In Progress
                      </Button>
                    )}
                    {(selectedCapa.status === 'OPEN' || selectedCapa.status === 'IN_PROGRESS') && (
                      <Button variant="danger-outline" size="sm" onClick={() => handleEscalate(selectedCapa.id)}>
                        <ArrowUpCircle /> Escalate
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => handleRequestEvidence(selectedCapa.id)}>
                      <Paperclip /> Request Evidence
                    </Button>
                    <Button variant="success" size="sm" onClick={() => handleClose(selectedCapa.id)} className="sm:ml-auto">
                      <CheckCircle /> Close CAPA
                    </Button>
                  </div>
                </SheetSection>
              )}

              {/* Timeline + Evidence */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <SheetSection title="Timeline">
                  <ul className="space-y-2.5">
                    {selectedCapa.timeline.map((step) => (
                      <li key={step.id} className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                            step.completed ? 'border-success-solid bg-success-solid text-white' : 'border-border-strong text-transparent'
                          )}
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                        <span className={cn('text-[13px]', step.completed ? 'text-text-primary' : 'text-text-muted')}>{step.label}</span>
                      </li>
                    ))}
                  </ul>
                </SheetSection>

                <SheetSection title="Evidence">
                  {selectedCapa.evidence.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border-strong px-4 py-5 text-center text-[12px] text-text-muted">No evidence uploaded yet.</div>
                  ) : (
                    <ul className="space-y-2">
                      {selectedCapa.evidence.map((ev) => (
                        <li key={ev.name} className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2">
                          <Paperclip className="h-4 w-4 shrink-0 text-text-muted" />
                          <span className="flex-1 truncate text-[12px] text-text-primary">{ev.name}</span>
                          <Tag>{ev.type}</Tag>
                        </li>
                      ))}
                    </ul>
                  )}
                </SheetSection>
              </div>

              {/* Activity Log */}
              <SheetSection title="Activity log">
                <ol className="max-h-[220px] space-y-0 overflow-y-auto rounded-lg border border-border bg-surface p-4">
                  {selectedCapa.activities.map((act, idx) => (
                    <li key={`${act.timestamp}-${idx}`} className="relative flex gap-3 pb-4 last:pb-0">
                      {idx !== selectedCapa.activities.length - 1 && <span aria-hidden="true" className="absolute left-[5px] top-4 h-full w-px bg-border" />}
                      <span className="relative z-10 mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-accent bg-surface" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-text-primary">{act.desc}</p>
                        <p className="mt-0.5 text-[11px] text-text-muted kd-num">{formatDateTime(act.timestamp)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </SheetSection>
            </div>
          </DemoHighlight>
        )}
      </SideSheet>
    </div>
  )
}

function SlaCell({ value, overdue, closed }: { value: string; overdue: boolean; closed: boolean }) {
  if (overdue) return <StatusBadge status="OVERDUE" />
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-[12px] font-semibold kd-num', closed ? 'text-success' : 'text-warning')}>
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {value}
    </span>
  )
}
