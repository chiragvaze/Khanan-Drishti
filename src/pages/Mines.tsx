import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Factory, ArrowUpDown, ArrowUp, ArrowDown, ShieldAlert, Mountain, Layers, SearchX } from 'lucide-react'
import { StatusBadge, Tag } from '../components/shared/StatusBadge'
import { KPICard } from '../components/shared/KPICard'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { SearchInput, Select } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/States'
import { mines } from '../data/mines'
import { capas } from '../data/capas'
import { cn, complianceTone, formatDate, toneFill, toneText } from '../lib/utils'

const columns = [
  { key: 'code', label: 'Mine' },
  { key: 'subsidiaryCode', label: 'Subsidiary' },
  { key: 'location', label: 'Location' },
  { key: 'type', label: 'Mine Type' },
  { key: 'complianceScore', label: 'Compliance' },
  { key: 'riskLevel', label: 'Risk' },
  { key: 'openCapa', label: 'Open CAPA', numeric: true },
  { key: 'lastInspectionDate', label: 'Last Inspection' },
  { key: 'status', label: 'Status' },
]

export default function Mines() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [riskFilter, setRiskFilter] = useState<string>('ALL')
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string>('ALL')
  const [stateFilter, setStateFilter] = useState<string>('ALL')
  const [complianceFilter, setComplianceFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const [sortField, setSortField] = useState<string>('complianceScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const subsidiaries = Array.from(new Set(mines.map((m) => m.subsidiaryCode))).sort()
  const states = Array.from(new Set(mines.map((m) => m.state))).sort()

  const getOpenCapaCount = (mineId: string) => {
    return capas.filter((c) => c.mineId === mineId && c.status !== 'CLOSED').length
  }

  const filtered = useMemo(() => {
    const result = mines.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.code.toLowerCase().includes(search.toLowerCase()) ||
        m.subsidiary.toLowerCase().includes(search.toLowerCase()) ||
        m.location.toLowerCase().includes(search.toLowerCase())

      const matchType = typeFilter === 'ALL' || m.type === typeFilter
      const matchRisk = riskFilter === 'ALL' || m.riskLevel === riskFilter
      const matchSubsidiary = subsidiaryFilter === 'ALL' || m.subsidiaryCode === subsidiaryFilter
      const matchState = stateFilter === 'ALL' || m.state === stateFilter
      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter

      let matchCompliance = true
      if (complianceFilter === 'HIGH') matchCompliance = m.complianceScore >= 80
      else if (complianceFilter === 'MEDIUM') matchCompliance = m.complianceScore >= 60 && m.complianceScore < 80
      else if (complianceFilter === 'LOW') matchCompliance = m.complianceScore < 60

      return matchSearch && matchType && matchRisk && matchSubsidiary && matchState && matchStatus && matchCompliance
    })

    result.sort((a, b) => {
      let aVal: unknown = a[sortField as keyof typeof a]
      let bVal: unknown = b[sortField as keyof typeof b]

      if (sortField === 'openCapa') {
        aVal = getOpenCapaCount(a.id)
        bVal = getOpenCapaCount(b.id)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal))
    })

    return result
  }, [search, typeFilter, riskFilter, subsidiaryFilter, stateFilter, statusFilter, complianceFilter, sortField, sortDir])

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const activeFilterCount = [typeFilter, riskFilter, subsidiaryFilter, stateFilter, complianceFilter, statusFilter].filter((f) => f !== 'ALL').length + (search ? 1 : 0)
  const clearFilters = () => {
    setSearch('')
    setTypeFilter('ALL')
    setRiskFilter('ALL')
    setSubsidiaryFilter('ALL')
    setStateFilter('ALL')
    setComplianceFilter('ALL')
    setStatusFilter('ALL')
  }

  const ocCount = mines.filter((m) => m.type === 'OPENCAST').length
  const ugCount = mines.filter((m) => m.type === 'UNDERGROUND').length
  const highRiskCount = mines.filter((m) => m.riskLevel === 'HIGH').length

  return (
    <div className="space-y-5">
      <PageHeader title="Mines" description="Monitor compliance, risk and operational status across monitored mines." />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <KPICard label="Total Monitored Mines" value={mines.length} icon={<Factory />} />
        <KPICard label="Opencast Mines" value={ocCount} icon={<Mountain />} />
        <KPICard label="Underground Mines" value={ugCount} icon={<Layers />} />
        <KPICard label="High Risk Mines" value={highRiskCount} icon={<ShieldAlert />} variant="danger" />
      </div>

      {/* Register */}
      <Card className="overflow-hidden">
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex flex-col gap-2 lg:flex-row">
            <SearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search mines by name, code, subsidiary, or location..."
              wrapperClassName="flex-1"
            />
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Select aria-label="Subsidiary" value={subsidiaryFilter} onChange={(e) => setSubsidiaryFilter(e.target.value)} className="sm:w-[160px]">
                <option value="ALL">All Subsidiaries</option>
                {subsidiaries.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <Select aria-label="State" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="sm:w-[160px]">
                <option value="ALL">All States</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Select aria-label="Mine type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="sm:w-[150px]">
              <option value="ALL">All Mine Types</option>
              <option value="OPENCAST">Opencast</option>
              <option value="UNDERGROUND">Underground</option>
              <option value="MIXED">Mixed</option>
            </Select>
            <Select aria-label="Risk level" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="sm:w-[150px]">
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </Select>
            <Select aria-label="Compliance level" value={complianceFilter} onChange={(e) => setComplianceFilter(e.target.value)} className="sm:w-[190px]">
              <option value="ALL">All Compliance Levels</option>
              <option value="HIGH">High (≥80%)</option>
              <option value="MEDIUM">Medium (60-79%)</option>
              <option value="LOW">Low (&lt;60%)</option>
            </Select>
            <Select aria-label="Operational status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-[170px]">
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
            <div className="col-span-2 flex items-center justify-between gap-3 sm:ml-auto">
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
              <span className="text-[12px] text-text-muted kd-num" aria-live="polite">
                Showing {filtered.length} of {mines.length}
              </span>
            </div>
          </div>
        </div>

        <div className="kd-table-wrap lg:max-h-[calc(100dvh-220px)]">
          <table className="kd-table kd-table--compact whitespace-nowrap">
            <thead>
              <tr>
                {columns.map((col) => {
                  const sorted = sortField === col.key
                  const SortIcon = !sorted ? ArrowUpDown : sortDir === 'asc' ? ArrowUp : ArrowDown
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={sorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className={cn(col.numeric && 'kd-cell-num')}
                    >
                      <button type="button" onClick={() => toggleSort(col.key)} className={cn('kd-th-button', sorted && 'text-text-primary')}>
                        {col.label}
                        <SortIcon className={cn('h-3 w-3', sorted ? 'text-amber' : 'opacity-50')} aria-hidden="true" />
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {filtered.map((mine) => {
                const tone = complianceTone(mine.complianceScore)
                const openCapa = getOpenCapaCount(mine.id)
                return (
                  <tr
                    key={mine.id}
                    data-clickable="true"
                    tabIndex={0}
                    onClick={() => navigate(`/mines/${mine.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') navigate(`/mines/${mine.id}`)
                    }}
                    aria-label={`${mine.code} ${mine.name}`}
                    className="group"
                  >
                    <td className="min-w-[180px] whitespace-normal">
                      <div className="flex max-w-[220px] flex-col">
                        <span className="text-[13px] font-medium leading-5 text-text-primary group-hover:text-amber">{mine.name}</span>
                        <span className="font-mono text-[11px] text-amber">{mine.code}</span>
                      </div>
                    </td>
                    <td className="font-medium">{mine.subsidiaryCode}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-text-secondary">{mine.location}</span>
                        <span className="text-[11px] text-text-muted">{mine.state}</span>
                      </div>
                    </td>
                    <td>
                      <Tag>{mine.type.replace('_', ' ')}</Tag>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-chart-track">
                          <div className={cn('h-full rounded-full', toneFill[tone])} style={{ width: `${mine.complianceScore}%` }} />
                        </div>
                        <span className={cn('w-9 text-[13px] font-semibold kd-num', toneText[tone])}>{mine.complianceScore}%</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={mine.riskLevel} />
                    </td>
                    <td className="kd-cell-num">
                      <span className={cn('font-semibold', openCapa > 0 ? 'text-warning' : 'text-text-muted')}>{openCapa}</span>
                    </td>
                    <td className="kd-num">{formatDate(mine.lastInspectionDate)}</td>
                    <td>
                      <StatusBadge status={mine.status} hideDot />
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      compact
                      icon={SearchX}
                      title="No mines found"
                      description="No mines found matching the selected filters."
                      actionLabel="Clear filters"
                      onAction={clearFilters}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
