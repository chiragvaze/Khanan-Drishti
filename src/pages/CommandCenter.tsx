import { Suspense, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Factory,
  ClipboardCheck,
  ShieldAlert,
  Brain,
  ArrowRight,
  FileDown,
  ListTodo,
  FileCheck,
  HardHat,
  Database,
  Map as MapIcon,
  Sparkles,
  FileText,
  ChevronRight,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { KPICard } from '../components/shared/KPICard'
import { StatusBadge } from '../components/shared/StatusBadge'
import { PageHeader } from '../components/ui/PageHeader'
import { Button, buttonVariants } from '../components/ui/Button'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { useToast } from '../components/ui/ToastProvider'
import { mines } from '../data/mines'
import { riskAlerts } from '../data/risk-alerts'
import { capas } from '../data/capas'
import { inspections } from '../data/inspections'
import type { Inspection } from '../data/types'
import { useRole } from '../contexts/RoleContext'
import DemoHighlight from '../components/shared/DemoHighlight'
import MineMapPreview from '../components/map/MineMapPreview.lazy'
import { useInView } from '../lib/useInView'
import { axisProps, chartColors, gridProps, riskColor, tooltipCursor } from '../lib/chart'
import { cn, complianceTone, formatDate, formatDateTime, toneFill, toneText } from '../lib/utils'

// Data mocks
const complianceTrend = [
  { month: 'Apr', score: 74 },
  { month: 'May', score: 76 },
  { month: 'Jun', score: 73 },
  { month: 'Jul', score: 78 },
  { month: 'Aug', score: 80 },
  { month: 'Sep', score: 76 },
]
const riskDistribution = [
  { name: 'High', value: 3, color: chartColors.danger },
  { name: 'Medium', value: 4, color: chartColors.warning },
  { name: 'Low', value: 3, color: chartColors.success },
]
const capaStatusData = [
  { status: 'Open', count: 2, color: chartColors.warning },
  { status: 'In Progress', count: 2, color: chartColors.info },
  { status: 'Overdue', count: 1, color: chartColors.danger },
  { status: 'Closed', count: 2, color: chartColors.success },
]

const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export default function CommandCenter() {
  const { role } = useRole()

  if (role === 'MINE_OFFICIAL') return <MineOfficialDashboard />
  if (role === 'REGULATORY_AUTHORITY') return <RegulatoryDashboard />

  return <CorporateDashboard />
}

// ────────────────────────────────────────────────────────────
// Corporate Management
// ────────────────────────────────────────────────────────────
function CorporateDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const highRiskMines = mines.filter((m) => m.riskLevel === 'HIGH')
  const openCAPAs = capas.filter((c) => c.status !== 'CLOSED')
  const overdueCAPAs = capas.filter((c) => c.status === 'OVERDUE')
  const avgCompliance = Math.round(mines.reduce((sum, m) => sum + m.complianceScore, 0) / mines.length)
  const riskTotal = riskDistribution.reduce((s, r) => s + r.value, 0)

  const priorityCapas = [...openCAPAs]
    .sort((a, b) => Number(b.status === 'OVERDUE') - Number(a.status === 'OVERDUE') || a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3)

  const handleExport = () => {
    toast({ title: 'Export Started', description: 'The dashboard report is being generated.', type: 'info' })
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Corporate management" title="Command Center" description="Network-wide overview of mine safety and compliance.">
        <span className="hidden text-[12px] text-text-muted sm:inline">Data as of {today}</span>
        <Button onClick={handleExport} variant="secondary">
          <FileDown /> Export report
        </Button>
      </PageHeader>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        <KPICard label="Mines Monitored" value={mines.length} subtitle="Active tracking" icon={<Factory />} trend="neutral" trendValue="Stable" />
        <KPICard label="High Risk Mines" value={highRiskMines.length} subtitle="Require attention" icon={<AlertTriangle />} trend="up" trendValue="+1 this month" trendPositive={false} variant="danger" />
        <KPICard label="Open CAPA" value={openCAPAs.length} subtitle={`${overdueCAPAs.length} overdue`} icon={<ClipboardCheck />} trend="down" trendValue="-2 this week" trendPositive variant="warning" />
        <KPICard label="Compliance Rate" value={`${avgCompliance}%`} subtitle="Network average" icon={<ShieldAlert />} trend="up" trendValue="+1.2% from Aug" trendPositive variant="success" />
      </div>

      {/* Row 2 — network risk overview + geographic network map */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader
            title="Network risk overview"
            subtitle="Risk distribution and mines requiring attention"
            icon={<ShieldAlert />}
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/map')}>
                <MapIcon /> <span className="hidden sm:inline">Open GIS map</span>
              </Button>
            }
          />
          <CardContent className="grid gap-5 md:grid-cols-[200px_1fr] md:gap-6">
            {/* Distribution */}
            <div className="flex items-center gap-4 md:flex-col md:items-stretch">
              <div className="relative h-[132px] w-[132px] shrink-0 md:mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={46} outerRadius={64} paddingAngle={2} dataKey="value" stroke="none" isAnimationActive={false}>
                      {riskDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[22px] font-semibold leading-none text-text-primary kd-num">{riskTotal}</span>
                  <span className="mt-1 text-[11px] text-text-muted">mines</span>
                </div>
              </div>
              <ul className="flex-1 space-y-1.5" aria-label="Risk distribution">
                {riskDistribution.map((r) => (
                  <li key={r.name} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="flex items-center gap-2 text-text-secondary">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: r.color }} aria-hidden="true" />
                      {r.name} risk
                    </span>
                    <span className="font-semibold text-text-primary kd-num">
                      {r.value}
                      <span className="ml-1.5 font-normal text-text-muted">{Math.round((r.value / riskTotal) * 100)}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Watchlist */}
            <div className="min-w-0">
              <div className="kd-overline mb-2">Priority watchlist</div>
              <div className="space-y-2">
                <DemoHighlight step={1} tooltip="An inspection finding has increased the compliance risk of WCL-04.">
                  <WatchlistRow
                    tone="danger"
                    code="WCL-04"
                    name="Wani Opencast"
                    detail="Critical Risk • 65% Compliance"
                    status="HIGH"
                    onOpen={() => navigate('/mines/mine-wcl-04')}
                  />
                </DemoHighlight>
                <WatchlistRow
                  tone="warning"
                  code="NCL-12"
                  name="Jayant Opencast"
                  detail="Medium Risk • 74% Compliance"
                  status="MEDIUM"
                  onOpen={() => navigate('/mines/mine-ncl-12')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <MineNetworkMapCard className="xl:col-span-5" />
      </div>

      {/* Row 3 — AI alerts + compliance trend + CAPA / priority actions */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                AI risk alerts
                <span className="rounded-full bg-danger-soft px-1.5 text-[11px] font-semibold text-danger kd-num">{riskAlerts.slice(0, 4).length}</span>
              </span>
            }
            subtitle="Predictions and escalations requiring review"
            icon={<Sparkles />}
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/ai-insights')}>
                View insights <ArrowRight />
              </Button>
            }
          />
          <ul className="divide-y divide-border">
            {riskAlerts.slice(0, 4).map((alert) => (
              <li key={alert.id}>
                <button
                  type="button"
                  onClick={() => navigate('/ai-insights')}
                  className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
                >
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', alert.severity === 'HIGH' ? 'bg-danger-solid' : 'bg-warning-solid')} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <StatusBadge status={alert.severity} hideDot />
                      <span className="text-[12px] text-text-muted">{alert.mineName}</span>
                      <span className="text-[12px] text-text-disabled" aria-hidden="true">·</span>
                      <span className="text-[12px] text-text-muted">{alert.category}</span>
                    </span>
                    <span className="mt-1 block text-[13px] font-semibold leading-5 text-text-primary group-hover:text-amber">{alert.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[12px] leading-[18px] text-text-secondary">{alert.description}</span>
                  </span>
                  <span className="hidden shrink-0 text-[11px] text-text-muted kd-num sm:block">{formatDateTime(alert.timestamp)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col xl:col-span-3">
          <CardHeader title="Compliance trend" subtitle="Network average · last 6 months" />
          <CardContent className="flex flex-1 flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] font-semibold text-text-primary kd-num">{complianceTrend[complianceTrend.length - 1].score}%</span>
              <span className="text-[12px] text-text-muted">September</span>
            </div>
            <div className="mt-2 min-h-[160px] flex-1">
              <ResponsiveContainer width="100%" height="100%" minHeight={160}>
                <AreaChart data={complianceTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="kd-trend-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.accent} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={chartColors.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis domain={[60, 100]} ticks={[60, 70, 80, 90, 100]} {...axisProps} />
                  <Tooltip cursor={{ stroke: chartColors.grid }} formatter={(v) => [`${v}%`, 'Compliance']} />
                  <Area type="monotone" dataKey="score" stroke={chartColors.accent} strokeWidth={2} fill="url(#kd-trend-fill)" dot={{ r: 3, fill: chartColors.accent, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col xl:col-span-4">
          <CardHeader
            title="CAPA status"
            subtitle="Corrective actions across all mines"
            icon={<ClipboardCheck />}
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/capa')}>
                Open CAPA <ArrowRight />
              </Button>
            }
          />
          <CardContent className="pb-2">
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capaStatusData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="status" {...axisProps} interval={0} />
                  <YAxis allowDecimals={false} {...axisProps} />
                  <Tooltip cursor={tooltipCursor} formatter={(v) => [v, 'CAPAs']} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={36}>
                    {capaStatusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <div className="border-t border-border px-4 pb-3 pt-3">
            <div className="kd-overline mb-2 flex items-center gap-1.5">
              <ListTodo className="h-3.5 w-3.5" /> Priority actions
            </div>
            <ul className="space-y-1">
              {priorityCapas.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => navigate('/capa')}
                    className="group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-2"
                  >
                    <StatusBadge status={c.status} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-text-primary">{c.title}</span>
                      <span className="block truncate text-[11px] text-text-muted">
                        {c.mineName} · Due {formatDate(c.dueDate)}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-text-disabled group-hover:text-text-secondary" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Row 4 — recent inspections + mine status */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <RecentInspectionsCard className="xl:col-span-7" />

        <Card className="xl:col-span-5">
          <CardHeader
            title="Mine status"
            subtitle="Lowest compliance first"
            icon={<Factory />}
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/mines')}>
                All mines <ArrowRight />
              </Button>
            }
          />
          <ul className="divide-y divide-border">
            {[...mines]
              .sort((a, b) => a.complianceScore - b.complianceScore)
              .slice(0, 6)
              .map((m) => {
                const tone = complianceTone(m.complianceScore)
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/mines/${m.id}`)}
                      className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                    >
                      <span className="w-[72px] shrink-0 font-mono text-[12px] font-medium text-text-primary">{m.code}</span>
                      <span className="hidden min-w-0 flex-1 truncate text-[12px] text-text-secondary sm:block">{m.name}</span>
                      <span className="flex w-[112px] shrink-0 items-center gap-2 sm:w-[120px]">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-chart-track">
                          <span className={cn('block h-full rounded-full', toneFill[tone])} style={{ width: `${m.complianceScore}%` }} />
                        </span>
                        <span className={cn('w-9 text-right text-[12px] font-semibold kd-num', toneText[tone])}>{m.complianceScore}%</span>
                      </span>
                      <span className="ml-auto sm:ml-0">
                        <StatusBadge status={m.riskLevel} />
                      </span>
                    </button>
                  </li>
                )
              })}
          </ul>
        </Card>
      </div>
    </div>
  )
}

/** Executive map preview — same mines, markers and risk colours as the GIS Risk Map; the whole card opens it. */
function MineNetworkMapCard({ className }: { className?: string }) {
  const mapAreaRef = useRef<HTMLDivElement>(null)
  // Mount the (lazily loaded) map only once it approaches the viewport
  const inView = useInView(mapAreaRef, '200px')
  const counts = (['HIGH', 'MEDIUM', 'LOW'] as const).map((level) => ({ level, count: mines.filter((m) => m.riskLevel === level).length }))
  const legendLabel = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' } as const

  return (
    <Card className={cn('group relative flex flex-col overflow-hidden transition-colors hover:border-amber/50 has-[a:focus-visible]:border-amber', className)}>
      <CardHeader title="Mine network map" subtitle="Geographic overview of monitored mines" icon={<MapIcon />} />

      <div ref={mapAreaRef} className="relative min-h-[280px] flex-1 bg-inset">
        {inView ? (
          <Suspense fallback={<div className="kd-skeleton absolute inset-0 rounded-none" />}>
            <MineMapPreview mines={mines} />
          </Suspense>
        ) : (
          <div className="kd-skeleton absolute inset-0 rounded-none" />
        )}

        {/* Legend — same risk colours as the GIS map */}
        <ul
          aria-label="Mines by risk level"
          className="pointer-events-none absolute left-3 top-3 z-[1] flex items-center gap-3 rounded-md border border-border bg-surface-raised/95 px-2.5 py-1.5 text-[11px] shadow-card backdrop-blur"
        >
          {counts.map(({ level, count }) => (
            <li key={level} className="flex items-center gap-1.5 text-text-secondary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: riskColor[level] }} aria-hidden="true" />
              {legendLabel[level]}
              <span className="font-semibold text-text-primary kd-num">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      <CardFooter className="justify-between">
        <span className="text-[12px] text-text-muted kd-num">{mines.length} monitored sites</span>
        {/* Stretched link: its ::after covers the whole card, making the card one accessible target */}
        <Link
          to="/map"
          className="inline-flex items-center gap-1.5 rounded text-[13px] font-semibold text-amber after:absolute after:inset-0 after:z-[2] after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-focus"
        >
          Open GIS Map<span className="sr-only"> — GIS Risk Map</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  )
}

function WatchlistRow({
  tone,
  code,
  name,
  detail,
  status,
  onOpen,
}: {
  tone: 'danger' | 'warning'
  code: string
  name: string
  detail: string
  status: string
  onOpen: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View mine ${code} — ${detail}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className="group relative flex items-center gap-3 overflow-hidden rounded-lg border border-border bg-surface-2 py-3 pl-4 pr-3 transition-colors hover:border-border-strong"
    >
      <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-[3px]', tone === 'danger' ? 'bg-danger-solid' : 'bg-warning-solid')} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-[13px] font-semibold text-text-primary">{code}</span>
          <span className="truncate text-[13px] text-text-secondary">{name}</span>
        </div>
        <p className={cn('mt-0.5 text-[12px] font-medium', tone === 'danger' ? 'text-danger' : 'text-warning')}>{detail}</p>
      </div>
      <StatusBadge status={status} className="hidden sm:inline-flex" />
      <span aria-hidden="true" className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'shrink-0')}>
        View mine
      </span>
    </div>
  )
}

function RecentInspectionsCard({ className, mineId, title = 'Recent inspections' }: { className?: string; mineId?: string; title?: string }) {
  const navigate = useNavigate()
  const rows = [...inspections]
    .filter((i) => !mineId || i.mineId === mineId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader
        title={title}
        subtitle="Latest field inspections and their risk outcome"
        icon={<FileCheck />}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/inspections')}>
            All inspections <ArrowRight />
          </Button>
        }
      />
      <DataTable<Inspection>
        data={rows}
        getRowKey={(r) => r.id}
        onRowClick={() => navigate('/inspections')}
        columns={[
          { header: 'Date', cell: (r) => <span className="whitespace-nowrap text-text-primary kd-num">{formatDate(r.date)}</span> },
          {
            header: 'Mine',
            cell: (r) => (
              <div className="min-w-0">
                <div className="font-mono text-[12px] font-medium text-text-primary">{r.mineCode}</div>
                <div className="max-w-[180px] truncate text-[11px] text-text-muted">{r.mineName}</div>
              </div>
            ),
          },
          { header: 'Inspector', cell: (r) => <span className="whitespace-nowrap">{r.inspector}</span>, className: 'hidden md:table-cell' },
          { header: 'Risk', cell: (r) => <StatusBadge status={r.riskLevel} /> },
          { header: 'Status', cell: (r) => <StatusBadge status={r.status} hideDot />, className: 'hidden sm:table-cell' },
        ]}
      />
    </Card>
  )
}

// ────────────────────────────────────────────────────────────
// Mine Official
// ────────────────────────────────────────────────────────────
function MineOfficialDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Mine official · WCL-04"
        title="Mine Operations Center: WCL-04"
        description="Daily operational tracking and compliance execution for Wani Opencast Extension."
      />

      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        <KPICard label="My Compliance Score" value="65%" subtitle="Below target (75%)" icon={<ShieldAlert />} trend="down" trendValue="-2% this month" trendPositive={false} variant="danger" />
        <KPICard label="Open Observations" value={4} subtitle="From recent inspection" icon={<AlertTriangle />} variant="warning" />
        <KPICard label="My CAPA Pending" value={2} subtitle="1 Overdue" icon={<ClipboardCheck />} variant="danger" />
        <KPICard label="Active Contractors" value={3} subtitle="1 expiring soon" icon={<HardHat />} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Priority Actions */}
        <Card className="xl:col-span-7">
          <CardHeader title="My pending actions" subtitle="Items assigned to you, most urgent first" icon={<ListTodo />} />
          <ul className="divide-y divide-border">
            <li>
              <button type="button" onClick={() => navigate('/capa')} className="group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-danger/25 bg-danger-soft text-danger">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold text-text-primary">Resolve Overdue Ventilation CAPA</span>
                    <StatusBadge status="OVERDUE" />
                  </span>
                  <span className="mt-0.5 block text-[12px] text-text-secondary">Submit evidence of ducting repair (Due: 3 days ago)</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-disabled transition-colors group-hover:text-amber" />
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/evidence')} className="group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-warning/25 bg-warning-soft text-[15px] font-semibold text-warning kd-num">2</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-text-primary">Verify Inspection Evidence</span>
                  <span className="mt-0.5 block text-[12px] text-text-secondary">Validate KD-E102 and KD-E103</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-disabled transition-colors group-hover:text-amber" />
              </button>
            </li>
          </ul>
        </Card>

        {/* AI Insight */}
        <Card className="flex flex-col xl:col-span-5">
          <CardHeader title="Mine AI prediction" subtitle="Generated from telemetry and inspection evidence" icon={<Brain />} actions={<StatusBadge status="CRITICAL" />} />
          <CardContent className="flex flex-1 flex-col justify-between gap-5">
            <p className="text-[15px] leading-6 text-text-primary">
              “Ventilation failure risk is <strong className="font-semibold text-danger">CRITICAL</strong>. Methane levels will likely exceed 1.25% threshold within 18 hours if
              ducting remains unrepaired.”
            </p>
            <div className="rounded-lg border border-border bg-inset px-4 py-3">
              <div className="kd-overline">Recommendation</div>
              <div className="mt-0.5 text-[13px] font-semibold text-amber">Immediate Panel 3B Evacuation</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentInspectionsCard mineId="mine-wcl-04" title="Recent inspections — WCL-04" />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Regulatory Authority
// ────────────────────────────────────────────────────────────
type WatchRow = { id: string; mineCode: string; score: number; riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'; lastInspection: string }

function RegulatoryDashboard() {
  const navigate = useNavigate()

  const reports = [
    { title: 'WCL-04 Monthly Compliance', meta: 'Submitted: 2026-09-20', pending: false },
    { title: 'Q3 Inspection Summary - SECL', meta: 'Submitted: 2026-09-15', pending: false },
    { title: 'DGMS Annual Return (Pending)', meta: 'Due: 2026-09-30', pending: true },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Regulatory authority · DGMS"
        title="Regulatory Oversight Dashboard"
        description="National compliance, statutory reporting, and inspection oversight for DGMS."
      />

      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        <KPICard label="Mines Under Watch" value={8} subtitle="Targeted monitoring" icon={<Database />} trend="up" trendValue="High priority" trendPositive={false} variant="danger" />
        <KPICard label="Inspections Planned" value={14} subtitle="This quarter" icon={<ClipboardCheck />} />
        <KPICard label="Statutory Returns" value={1} subtitle="Overdue across network" icon={<FileCheck />} variant="warning" />
        <KPICard label="Avg. Compliance" value="76%" subtitle="National baseline" icon={<ShieldAlert />} trend="neutral" trendValue="Stable" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="overflow-hidden xl:col-span-8">
          <CardHeader
            title="Compliance watchlist"
            subtitle="Mines below the national compliance baseline"
            icon={<ShieldAlert />}
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/compliance')}>
                View all <ArrowRight />
              </Button>
            }
          />
          <DataTable<WatchRow>
            getRowKey={(r) => r.id}
            columns={[
              { header: 'Mine', cell: (val) => <span className="font-mono text-[13px] font-semibold text-text-primary">{val.mineCode}</span> },
              {
                header: 'Compliance Score',
                cell: (val) => <span className={cn('font-semibold kd-num', val.score < 70 ? 'text-danger' : 'text-warning')}>{val.score}%</span>,
              },
              { header: 'Risk Status', cell: (val) => <StatusBadge status={val.riskLevel} /> },
              { header: 'Last Inspection', cell: (val) => <span className="kd-num">{formatDate(val.lastInspection)}</span> },
            ]}
            data={[
              { id: '1', mineCode: 'WCL-04', score: 65, riskLevel: 'HIGH', lastInspection: '2026-09-18' },
              { id: '2', mineCode: 'BCCL-06', score: 68, riskLevel: 'HIGH', lastInspection: '2026-09-16' },
              { id: '3', mineCode: 'ECL-03', score: 72, riskLevel: 'MEDIUM', lastInspection: '2026-09-12' },
            ]}
          />
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader
            title="Recent reports"
            subtitle="Statutory submissions"
            icon={<FileText />}
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
                Reports <ArrowRight />
              </Button>
            }
          />
          <ul className="divide-y divide-border">
            {reports.map((r) => (
              <li key={r.title}>
                <button type="button" onClick={() => navigate('/reports')} className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2">
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
                      r.pending ? 'border-danger/25 bg-danger-soft text-danger' : 'border-border bg-inset text-text-muted'
                    )}
                  >
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-text-primary">{r.title}</span>
                    <span className={cn('mt-0.5 block text-[12px] kd-num', r.pending ? 'font-medium text-danger' : 'text-text-muted')}>{r.meta}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-disabled group-hover:text-text-secondary" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <RecentInspectionsCard />
    </div>
  )
}
