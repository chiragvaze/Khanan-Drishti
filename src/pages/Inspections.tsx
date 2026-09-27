import { useState, useMemo } from 'react'
import { ClipboardCheck, AlertTriangle, Brain, X, CheckCircle2, CalendarClock, Paperclip, Scale, SearchX, XCircle } from 'lucide-react'
import { StatusBadge } from '../components/shared/StatusBadge'
import { KPICard } from '../components/shared/KPICard'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, SearchInput, Select } from '../components/ui/Field'
import { EmptyState } from '../components/ui/States'
import { SideSheet, SheetSection, DetailItem } from '../components/ui/SideSheet'
import { inspections } from '../data/inspections'
import type { Inspection } from '../data/types'
import { formatDate, cn } from '../lib/utils'
import { useIsMobile } from '../lib/useIsMobile'

export default function Inspections() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [riskFilter, setRiskFilter] = useState<string>('ALL')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const filtered = useMemo(() => {
    return inspections.filter((i) => {
      const matchSearch =
        i.mineName.toLowerCase().includes(search.toLowerCase()) ||
        i.mineCode.toLowerCase().includes(search.toLowerCase()) ||
        i.inspector.toLowerCase().includes(search.toLowerCase()) ||
        i.id.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === 'ALL' || i.type === typeFilter
      const matchStatus = statusFilter === 'ALL' || i.status === statusFilter
      const matchRisk = riskFilter === 'ALL' || i.riskLevel === riskFilter
      const matchDate = dateFilter === '' || i.date === dateFilter
      return matchSearch && matchType && matchStatus && matchRisk && matchDate
    })
  }, [search, typeFilter, statusFilter, riskFilter, dateFilter])

  const completed = inspections.filter((i) => i.status === 'COMPLETED').length
  const inProgress = inspections.filter((i) => i.status === 'IN_PROGRESS').length
  const scheduled = inspections.filter((i) => i.status === 'SCHEDULED').length
  const totalHighRisk = inspections.reduce((sum, i) => sum + i.highRiskCount, 0)

  const selectedData = inspections.find((i) => i.id === selectedInspection)
  const hasFilters = search || typeFilter !== 'ALL' || statusFilter !== 'ALL' || riskFilter !== 'ALL' || dateFilter

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('ALL')
    setStatusFilter('ALL')
    setRiskFilter('ALL')
    setDateFilter('')
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Inspections" description="Field inspections, findings and AI verification across monitored mines." />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <KPICard label="Total Inspections" value={inspections.length} icon={<ClipboardCheck />} />
        <KPICard label="Completed" value={completed} subtitle="this month" variant="success" icon={<CheckCircle2 />} />
        <KPICard label="In Progress / Scheduled" value={inProgress + scheduled} icon={<CalendarClock />} />
        <KPICard label="High-Risk Findings" value={totalHighRisk} variant="danger" icon={<AlertTriangle />} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchInput value={search} onValueChange={setSearch} placeholder="Search by mine, inspector, or ID..." wrapperClassName="lg:w-80" />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Select aria-label="Inspection type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="sm:w-[150px]">
            <option value="ALL">All Types</option>
            <option value="ROUTINE">Routine</option>
            <option value="SPECIAL">Special</option>
            <option value="FOLLOW_UP">Follow-Up</option>
            <option value="DGMS_DIRECTED">DGMS Directed</option>
          </Select>
          <Select aria-label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-[140px]">
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SCHEDULED">Scheduled</option>
          </Select>
          <Select aria-label="Risk" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="sm:w-[120px]">
            <option value="ALL">All Risks</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </Select>
          <Input type="date" aria-label="Inspection date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="sm:w-[150px]" />
        </div>
        <div className="flex items-center justify-between gap-2 lg:ml-auto">
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
          <span className="text-[12px] text-text-muted kd-num">
            {filtered.length} of {inspections.length}
          </span>
        </div>
      </div>

      {/* Table + Detail */}
      <div className="flex items-start gap-4">
        <Card className="min-w-0 flex-1 overflow-hidden">
          <div className="kd-table-wrap">
            <table className="kd-table min-w-[780px] whitespace-nowrap">
              <thead>
                <tr>
                  <th scope="col">Date / Type</th>
                  <th scope="col">Mine</th>
                  <th scope="col">Inspector</th>
                  <th scope="col">Findings</th>
                  <th scope="col">Risk</th>
                  <th scope="col" className="kd-cell-num">Evidence</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((insp) => (
                  <tr
                    key={insp.id}
                    data-clickable="true"
                    data-selected={selectedInspection === insp.id}
                    tabIndex={0}
                    aria-label={`${insp.id}: ${insp.mineCode} inspection on ${formatDate(insp.date)}`}
                    onClick={() => setSelectedInspection(selectedInspection === insp.id ? null : insp.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelectedInspection(selectedInspection === insp.id ? null : insp.id)
                    }}
                  >
                    <td title={insp.id}>
                      <div className="font-medium text-text-primary kd-num">{formatDate(insp.date)}</div>
                      <div className="text-[11px] text-text-muted">{insp.type.replace(/_/g, ' ')}</div>
                    </td>
                    <td>
                      <div className="font-mono text-[12px] font-semibold text-amber">{insp.mineCode}</div>
                      <div className="max-w-[170px] truncate text-[11px] text-text-muted">{insp.mineName}</div>
                    </td>
                    <td>
                      <div className="text-text-primary">{insp.inspector}</div>
                      <div className="max-w-[170px] truncate text-[11px] text-text-muted">{insp.inspectorDesignation}</div>
                    </td>
                    <td className="kd-num">
                      <span className="text-text-primary">{insp.observationsCount} obs.</span>
                      {insp.highRiskCount > 0 && <span className="ml-1.5 font-medium text-danger">· {insp.highRiskCount} high</span>}
                    </td>
                    <td>
                      <StatusBadge status={insp.riskLevel} />
                    </td>
                    <td className="kd-cell-num text-text-primary">{insp.evidenceCount || 0}</td>
                    <td>
                      <StatusBadge status={insp.status} hideDot />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <EmptyState compact icon={SearchX} title="No inspections found" description="No inspections match the selected filters." actionLabel="Clear filters" onAction={clearFilters} />
            )}
          </div>
        </Card>

        {selectedData && !isMobile && (
          <Card className="sticky top-0 w-[380px] shrink-0 overflow-hidden animate-fade-in">
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <div className="kd-overline">Inspection detail</div>
                <h3 className="mt-0.5 text-[15px] font-semibold text-text-primary">
                  {selectedData.mineCode} · {selectedData.type.replace(/_/g, ' ')}
                </h3>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setSelectedInspection(null)} aria-label="Close inspection detail" className="-mr-1.5">
                <X />
              </Button>
            </div>
            <div className="max-h-[calc(100dvh-220px)] overflow-y-auto p-4">
              <InspectionDetail data={selectedData} />
            </div>
          </Card>
        )}
      </div>

      {isMobile && (
        <SideSheet
          open={!!selectedData}
          onClose={() => setSelectedInspection(null)}
          eyebrow="Inspection detail"
          title={selectedData ? `${selectedData.mineCode} · ${selectedData.type.replace(/_/g, ' ')}` : ''}
        >
          {selectedData && (
            <div className="p-5">
              <InspectionDetail data={selectedData} />
            </div>
          )}
        </SideSheet>
      )}
    </div>
  )
}

function InspectionDetail({ data }: { data: Inspection }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={data.status} size="md" hideDot />
        <StatusBadge status={data.riskLevel} size="md" />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <DetailItem label="ID">
          <span className="font-mono text-[12px]">{data.id}</span>
        </DetailItem>
        <DetailItem label="Date">
          <span className="kd-num">{formatDate(data.date)}</span>
        </DetailItem>
        <DetailItem label="Mine" className="col-span-2">
          <span className="font-mono">{data.mineCode}</span> — {data.mineName}
        </DetailItem>
        <DetailItem label="Inspector">{data.inspector}</DetailItem>
        <DetailItem label="Designation">{data.inspectorDesignation}</DetailItem>
        <DetailItem label="Type">{data.type.replace(/_/g, ' ')}</DetailItem>
        {data.evidenceCount !== undefined && (
          <DetailItem label="Evidence Attached" icon={<Paperclip />}>
            <span className="kd-num">{data.evidenceCount} files</span>
          </DetailItem>
        )}
      </dl>

      {data.checklist && (
        <SheetSection title="Checklist">
          <ul className="divide-y divide-border rounded-lg border border-border">
            {data.checklist.map((item) => (
              <li key={item.item} className="flex items-start justify-between gap-3 px-3 py-2 text-[12px]">
                <span className="flex items-start gap-2 text-text-secondary">
                  {item.status === 'PASS' ? (
                    <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-success" />
                  ) : (
                    <XCircle className="mt-px h-3.5 w-3.5 shrink-0 text-danger" />
                  )}
                  {item.item}
                </span>
                <StatusBadge status={item.status} hideDot />
              </li>
            ))}
          </ul>
        </SheetSection>
      )}

      {data.observationsList ? (
        <SheetSection title={`Observations (${data.observationsCount})`}>
          <ul className="space-y-1.5">
            {data.observationsList.map((obs) => (
              <li key={obs.title} className="flex items-center justify-between gap-3 rounded-md border border-border bg-inset px-3 py-2">
                <span className="text-[12px] text-text-primary">{obs.title}</span>
                <StatusBadge status={obs.risk} />
              </li>
            ))}
          </ul>
        </SheetSection>
      ) : (
        <SheetSection title="Findings">
          <p className="text-[13px] leading-5 text-text-secondary">{data.findings}</p>
        </SheetSection>
      )}

      {data.aiVerification && (
        <SheetSection title="AI Verification" icon={<Brain />}>
          <p className="rounded-md border border-info/25 bg-info-soft px-3 py-2.5 text-[12px] leading-[18px] text-text-primary">{data.aiVerification}</p>
        </SheetSection>
      )}

      {data.applicableObligations && (
        <SheetSection title="Applicable Obligations" icon={<Scale />}>
          <ul className="space-y-1.5">
            {data.applicableObligations.map((ob) => (
              <li key={ob} className={cn('flex items-start gap-2 text-[12px] text-text-secondary')}>
                <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-text-muted" aria-hidden="true" />
                {ob}
              </li>
            ))}
          </ul>
        </SheetSection>
      )}
    </div>
  )
}
