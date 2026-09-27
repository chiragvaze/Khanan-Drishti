import { useState, useMemo, useEffect } from 'react'
import { Camera, Image, Film, FileText, Radio, Mic, Brain, X, LayoutGrid, Rows3, Flag, ShieldCheck, MapPin, User, Link2, SearchX, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StatusBadge, Tag } from '../components/shared/StatusBadge'
import { KPICard } from '../components/shared/KPICard'
import DemoHighlight from '../components/shared/DemoHighlight'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SearchInput, Select } from '../components/ui/Field'
import { SegmentedControl } from '../components/ui/Tabs'
import { EmptyState } from '../components/ui/States'
import { SideSheet, SheetSection, DetailItem } from '../components/ui/SideSheet'
import { useDemo } from '../contexts/DemoContext'
import { evidence } from '../data/evidence'
import { formatDateTime, cn } from '../lib/utils'
import type { Evidence, EvidenceType } from '../data/types'
import { useIsMobile } from '../lib/useIsMobile'

const typeMeta: Record<EvidenceType, { Icon: LucideIcon; label: string }> = {
  PHOTO: { Icon: Image, label: 'Photo' },
  VIDEO: { Icon: Film, label: 'Video' },
  DOCUMENT: { Icon: FileText, label: 'Document' },
  SENSOR_DATA: { Icon: Radio, label: 'Sensor data' },
  AUDIO: { Icon: Mic, label: 'Audio' },
}

export default function EvidencePage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [aiStatusFilter, setAiStatusFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null)

  const { isActive: demoActive, currentStep } = useDemo()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (demoActive && currentStep === 3 && !selectedEvidence) {
      const kdE102 = evidence.find((e) => e.id === 'KD-E102')
      if (kdE102) setSelectedEvidence(kdE102.id)
    }
  }, [demoActive, currentStep, selectedEvidence])

  const filtered = useMemo(() => {
    return evidence.filter((e) => {
      const matchSearch =
        e.fileName.toLowerCase().includes(search.toLowerCase()) || e.mineName.toLowerCase().includes(search.toLowerCase()) || e.tags.some((t) => t.includes(search.toLowerCase()))
      const matchType = typeFilter === 'ALL' || e.type === typeFilter
      const matchAI = aiStatusFilter === 'ALL' || e.aiAnalysisStatus === aiStatusFilter
      return matchSearch && matchType && matchAI
    })
  }, [search, typeFilter, aiStatusFilter])

  const selected = evidence.find((e) => e.id === selectedEvidence)
  const photoCount = evidence.filter((e) => e.type === 'PHOTO').length
  const flaggedCount = evidence.filter((e) => e.aiAnalysisStatus === 'FLAGGED').length

  const detail = selected && <EvidenceDetail ev={selected} />

  return (
    <div className="space-y-5">
      <PageHeader title="Evidence" description="Chain-of-custody repository for field evidence, with AI classification linked to obligations and CAPA." />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <KPICard label="Total Evidence" value={evidence.length} icon={<Camera />} />
        <KPICard label="Photos" value={photoCount} icon={<Image />} />
        <KPICard label="AI Flagged" value={flaggedCount} variant="danger" icon={<Flag />} />
        <KPICard label="AI Analyzed" value={evidence.filter((e) => e.aiAnalysisStatus !== 'PENDING').length} variant="success" icon={<Brain />} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput value={search} onValueChange={setSearch} placeholder="Search evidence..." wrapperClassName="sm:w-72" />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select aria-label="Evidence type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="sm:w-[140px]">
            <option value="ALL">All Types</option>
            <option value="PHOTO">Photos</option>
            <option value="VIDEO">Videos</option>
            <option value="DOCUMENT">Documents</option>
            <option value="SENSOR_DATA">Sensor Data</option>
          </Select>
          <Select aria-label="AI status" value={aiStatusFilter} onChange={(e) => setAiStatusFilter(e.target.value)} className="sm:w-[150px]">
            <option value="ALL">All AI Status</option>
            <option value="FLAGGED">Flagged</option>
            <option value="ANALYZED">Analyzed</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-3 sm:ml-auto">
          <span className="text-[12px] text-text-muted kd-num">
            {filtered.length} of {evidence.length} items
          </span>
          <SegmentedControl
            aria-label="View"
            value={viewMode}
            onChange={setViewMode}
            items={[
              { value: 'grid', label: 'Grid', icon: <LayoutGrid /> },
              { value: 'list', label: 'List', icon: <Rows3 /> },
            ]}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {filtered.length === 0 ? (
            <Card>
              <EmptyState icon={SearchX} title="No evidence found" description="No evidence matches the current search and filters." />
            </Card>
          ) : viewMode === 'grid' ? (
            <div className={cn('grid grid-cols-1 gap-3 min-[480px]:grid-cols-2', selected && !isMobile ? 'xl:grid-cols-2 2xl:grid-cols-3' : 'md:grid-cols-3 xl:grid-cols-4')}>
              {filtered.map((ev) => (
                <EvidenceCard key={ev.id} ev={ev} selected={selectedEvidence === ev.id} onSelect={() => setSelectedEvidence(ev.id)} />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="kd-table-wrap">
                <table className="kd-table min-w-[760px] whitespace-nowrap">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Type</th>
                      <th scope="col">Mine</th>
                      <th scope="col">Location</th>
                      <th scope="col">Time</th>
                      <th scope="col">AI Class.</th>
                      <th scope="col">Conf.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((ev) => {
                      const { Icon, label } = typeMeta[ev.type]
                      return (
                        <tr
                          key={ev.id}
                          data-clickable="true"
                          data-selected={selectedEvidence === ev.id}
                          tabIndex={0}
                          onClick={() => setSelectedEvidence(ev.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setSelectedEvidence(ev.id)
                          }}
                        >
                          <td className="font-mono text-[12px] font-medium text-amber">{ev.id}</td>
                          <td>
                            <span className="inline-flex items-center gap-1.5 text-text-secondary">
                              <Icon className="h-4 w-4 text-text-muted" /> {label}
                            </span>
                          </td>
                          <td className="text-text-primary">{ev.mineName}</td>
                          <td className="max-w-[180px] truncate">{ev.location || ev.geoTag}</td>
                          <td className="kd-num">{formatDateTime(ev.capturedDate)}</td>
                          <td>
                            <StatusBadge status={ev.aiAnalysisStatus} />
                          </td>
                          <td>{ev.confidence ? <Confidence value={ev.confidence} /> : <span className="text-text-muted">—</span>}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {selected && !isMobile && (
          <div className="sticky top-0 w-[380px] shrink-0">
            {selected.id === 'KD-E102' ? (
              <DemoHighlight step={3} tooltip="Field evidence is linked directly to the mine and inspection record.">
                <DetailCard onClose={() => setSelectedEvidence(null)}>{detail}</DetailCard>
              </DemoHighlight>
            ) : (
              <DetailCard onClose={() => setSelectedEvidence(null)}>{detail}</DetailCard>
            )}
          </div>
        )}
      </div>

      {isMobile && (
        <SideSheet open={!!selected} onClose={() => setSelectedEvidence(null)} closeOnEscape={!demoActive} eyebrow="Evidence record" title={selected?.id} subtitle={selected?.fileName}>
          {selected &&
            (selected.id === 'KD-E102' ? (
              <DemoHighlight step={3} tooltip="Field evidence is linked directly to the mine and inspection record.">
                <div className="p-5">{detail}</div>
              </DemoHighlight>
            ) : (
              <div className="p-5">{detail}</div>
            ))}
        </SideSheet>
      )}
    </div>
  )
}

function DetailCard({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h3 className="kd-overline">Evidence record</h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close evidence detail" className="-mr-1.5">
          <X />
        </Button>
      </div>
      <div className="max-h-[calc(100dvh-220px)] overflow-y-auto p-4">{children}</div>
    </Card>
  )
}

function Confidence({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`AI confidence ${value}%`}>
      <span className="h-1 w-10 overflow-hidden rounded-full bg-chart-track">
        <span className="block h-full rounded-full bg-info-solid" style={{ width: `${value}%` }} />
      </span>
      <span className="text-[12px] font-medium text-text-primary kd-num">{value}%</span>
    </span>
  )
}

/** Preview with graceful fallback when the asset is not available. */
function EvidencePreview({ ev, className, large = false }: { ev: Evidence; className?: string; large?: boolean }) {
  const [failed, setFailed] = useState(false)
  const { Icon, label } = typeMeta[ev.type]
  const showImage = ev.type === 'PHOTO' && !failed

  return (
    <div className={cn('relative overflow-hidden bg-inset', className)}>
      {showImage ? (
        <>
          <img src={`/evidence/${ev.fileName}`} alt={`Evidence ${ev.id}`} loading="lazy" className="h-full w-full object-cover" onError={() => setFailed(true)} />
          {large && (
            <span className="absolute right-2 top-2 rounded bg-brand-charcoal/85 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wide text-brand-sand">
              SIMULATED ASSET
            </span>
          )}
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-muted">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface">
            <Icon className="h-5 w-5" />
          </span>
          {large ? (
            <span className="text-center text-[12px]">
              <span className="block font-medium text-text-secondary">{ev.type === 'PHOTO' ? 'Evidence preview unavailable' : `${label} file`}</span>
              <span className="mt-0.5 block font-mono text-[10px] text-text-muted">{ev.fileName}</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium">{label}</span>
          )}
        </div>
      )}
    </div>
  )
}

function EvidenceCard({ ev, selected, onSelect }: { ev: Evidence; selected: boolean; onSelect: () => void }) {
  const { Icon, label } = typeMeta[ev.type]
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${ev.id} — ${label}, ${ev.mineName}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-surface text-left shadow-card transition-colors',
        selected ? 'border-amber/60 ring-1 ring-amber/40' : 'border-border hover:border-border-strong'
      )}
    >
      <div className="relative">
        <EvidencePreview ev={ev} className="aspect-[16/9] border-b border-border" />
        <span className="absolute left-2 top-2 inline-flex h-5 items-center gap-1 rounded-[5px] border border-border bg-surface/90 px-1.5 text-[10.5px] font-medium text-text-secondary backdrop-blur">
          <Icon className="h-3 w-3" /> {label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[12px] font-semibold text-amber">{ev.id}</span>
          <StatusBadge status={ev.aiAnalysisStatus} />
        </div>
        <p className="mt-1.5 truncate text-[12px] font-medium text-text-primary" title={ev.fileName}>
          {ev.fileName}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-text-muted">
          {ev.mineName} • {ev.location || ev.geoTag.split(' ')[0]}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
          <span className="flex items-center gap-1 text-[11px] text-text-muted kd-num">
            <Clock className="h-3 w-3" /> {formatDateTime(ev.capturedDate)}
          </span>
          {ev.confidence ? <Confidence value={ev.confidence} /> : null}
        </div>
      </div>
    </button>
  )
}

function EvidenceDetail({ ev }: { ev: Evidence }) {
  const { label } = typeMeta[ev.type]
  const custody = [
    { label: 'Captured', value: `${ev.capturedBy} · ${formatDateTime(ev.capturedDate)}`, done: true },
    { label: 'AI analysis', value: ev.aiAnalysisStatus.charAt(0) + ev.aiAnalysisStatus.slice(1).toLowerCase(), done: ev.aiAnalysisStatus !== 'PENDING' },
    { label: 'Observation linked', value: ev.associatedObservation, done: !!ev.associatedObservation },
    { label: 'CAPA linked', value: ev.associatedCAPA, done: !!ev.associatedCAPA },
  ]

  return (
    <div className="space-y-5">
      <EvidencePreview key={ev.id} ev={ev} large className={cn('rounded-lg border border-border', ev.type === 'PHOTO' ? 'aspect-[4/3]' : 'h-32')} />

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[14px] font-semibold text-text-primary">{ev.id}</span>
          <Tag>{label}</Tag>
        </div>
        <p className="mt-1 break-all font-mono text-[11px] text-text-muted">{ev.fileName}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <DetailItem label="Mine">{ev.mineName}</DetailItem>
        <DetailItem label="Inspection">
          <span className="break-all font-mono text-[12px]">{ev.inspectionId}</span>
        </DetailItem>
        <DetailItem label="Source" icon={<User />}>
          {ev.capturedBy}
        </DetailItem>
        <DetailItem label="Timestamp" icon={<Clock />}>
          <span className="kd-num">{formatDateTime(ev.capturedDate)}</span>
        </DetailItem>
        <DetailItem label="Location / GeoTag" icon={<MapPin />} className="col-span-2">
          <span className="font-mono text-[12px]">{ev.location || ev.geoTag}</span>
        </DetailItem>
      </dl>

      <SheetSection
        title="AI classification"
        icon={<Brain />}
        action={ev.confidence ? <Confidence value={ev.confidence} /> : undefined}
      >
        <div className="rounded-lg border border-border bg-inset p-3">
          <StatusBadge status={ev.aiAnalysisStatus} />
          {ev.aiFindings && <p className="mt-2 text-[12px] leading-[18px] text-text-secondary">{ev.aiFindings}</p>}
        </div>
      </SheetSection>

      {(ev.matchedObligation || ev.associatedObservation || ev.associatedCAPA) && (
        <SheetSection title="Linked records" icon={<Link2 />}>
          <dl className="space-y-2">
            {ev.matchedObligation && (
              <DetailItem label="Matched Obligation">
                <span className="inline-flex rounded-md border border-amber/30 bg-amber-soft px-2 py-0.5 font-mono text-[12px] text-amber">{ev.matchedObligation}</span>
              </DetailItem>
            )}
            {ev.associatedObservation && <DetailItem label="Associated Observation">{ev.associatedObservation}</DetailItem>}
            {ev.associatedCAPA && (
              <DetailItem label="Associated CAPA">
                <span className="font-mono text-[12px] font-semibold text-amber">{ev.associatedCAPA}</span>
              </DetailItem>
            )}
          </dl>
        </SheetSection>
      )}

      <SheetSection title="Chain of custody" icon={<ShieldCheck />}>
        <ol className="space-y-0">
          {custody.map((step, i) => (
            <li key={step.label} className="relative flex gap-3 pb-3 last:pb-0">
              {i < custody.length - 1 && <span aria-hidden="true" className="absolute left-[5px] top-4 h-full w-px bg-border" />}
              <span
                aria-hidden="true"
                className={cn('relative z-10 mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2', step.done ? 'border-success-solid bg-success-solid' : 'border-border-strong bg-surface')}
              />
              <div className="min-w-0">
                <p className={cn('text-[12px] font-medium', step.done ? 'text-text-primary' : 'text-text-muted')}>{step.label}</p>
                <p className="text-[11px] text-text-muted">{step.value || 'Not linked'}</p>
              </div>
            </li>
          ))}
        </ol>
      </SheetSection>

      {ev.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-4">
          {ev.tags.map((tag) => (
            <Tag key={tag}>#{tag}</Tag>
          ))}
        </div>
      )}
    </div>
  )
}
