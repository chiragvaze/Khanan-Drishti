import { useState, useEffect } from 'react'
import { Download, Eye, Plus, ChevronLeft, ShieldCheck, AlertTriangle, FileText, HardHat, FileCheck, AlertOctagon, CalendarDays, User, HardDrive, SearchX } from 'lucide-react'
import { StatusBadge } from '../components/shared/StatusBadge'
import { formatDate } from '../lib/utils'
import { useDemo } from '../contexts/DemoContext'
import DemoHighlight from '../components/shared/DemoHighlight'
import KhananLogo from '../components/shared/KhananLogo'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Field, Input, Select } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/States'

const reportTypeLabels: Record<string, string> = {
  COMPLIANCE: 'Compliance',
  RISK_ASSESSMENT: 'Risk Assessment',
  INSPECTION_SUMMARY: 'Inspection Summary',
  CAPA_STATUS: 'CAPA Status',
  MONTHLY_REVIEW: 'Monthly Review',
  DGMS_RETURN: 'DGMS Return',
  CONTRACTOR_COMPLIANCE: 'Contractor Compliance',
  MINE_RISK: 'Mine Risk',
}

export default function Reports() {
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const { isActive: demoActive, currentStep } = useDemo()

  useEffect(() => {
    if (demoActive && currentStep === 8 && !previewMode) {
      setPreviewMode(true)
    }
  }, [demoActive, currentStep, previewMode])

  // Inject requested reports into the list for the UI
  const displayReports = [
    { id: 'r1', name: 'Monthly Compliance Report', type: 'COMPLIANCE', period: 'September 2026', generatedDate: '2026-09-20', generatedBy: 'System', status: 'DRAFT', mineName: 'WCL-04', fileSize: '2.4 MB' },
    { id: 'r2', name: 'Inspection Summary', type: 'INSPECTION_SUMMARY', period: 'Q3 2026', generatedDate: '2026-09-15', generatedBy: 'Compliance Cell', status: 'APPROVED', mineName: 'SECL-07', fileSize: '5.1 MB' },
    { id: 'r3', name: 'CAPA Status Report', type: 'CAPA_STATUS', period: 'Week 38', generatedDate: '2026-09-19', generatedBy: 'System', status: 'GENERATED', mineName: 'All Mines', fileSize: '1.2 MB' },
    { id: 'r4', name: 'Contractor Compliance Report', type: 'CONTRACTOR_COMPLIANCE', period: 'September 2026', generatedDate: '2026-09-21', generatedBy: 'Audit Team', status: 'GENERATED', mineName: 'WCL-04', fileSize: '1.8 MB' },
    { id: 'r5', name: 'Mine Risk Report', type: 'MINE_RISK', period: 'September 2026', generatedDate: '2026-09-18', generatedBy: 'AI Analysis', status: 'GENERATED', mineName: 'WCL-04', fileSize: '3.1 MB' },
  ]

  const filtered = typeFilter === 'ALL' ? displayReports : displayReports.filter((r) => r.type === typeFilter)

  if (previewMode) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div role="note" className="flex items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-4 py-2 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-danger">
          <AlertOctagon className="h-4 w-4 shrink-0" />
          PROTOTYPE / DEMO DATA — Not an official statutory report
        </div>

        {/* Viewer toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPreviewMode(false)} className="-ml-2">
              <ChevronLeft /> Back to Reports
            </Button>
            <span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-[13px] font-semibold text-text-primary">Monthly Compliance Report</div>
              <div className="text-[11px] text-text-muted">WCL-04 · September 2026 · Draft</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary">
              <Eye /> Generate Report
            </Button>
            <Button variant="primary">
              <Download /> Export PDF
            </Button>
          </div>
        </div>

        <DemoHighlight step={8} tooltip="Generate statutory compliance reports with a single click, integrating field evidence, risk factors, and contractor performance.">
          {/* Document viewer canvas */}
          <div className="rounded-lg border border-border bg-inset p-2 sm:p-6">
            {/* Report Document (always printed on white) */}
            <article className="mx-auto min-h-[800px] max-w-[860px] overflow-hidden rounded-sm bg-white text-gray-900 shadow-[0_1px_3px_rgb(16_24_40/0.12),0_12px_32px_-12px_rgb(16_24_40/0.25)]">
              <div className="h-1.5 bg-brand-amber" aria-hidden="true" />
              <div className="p-5 sm:p-10">
                {/* Header */}
                <header className="mb-8 border-b border-gray-200 pb-6">
                  <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">Khanan Drishti · Compliance Report</p>
                      <h1 className="mt-1 text-[22px] font-bold uppercase tracking-wide text-gray-900 sm:text-[26px]">Monthly Compliance Report</h1>
                      <p className="mt-1 font-mono text-sm text-gray-600">WCL-04 — Wani Opencast Extension</p>
                      <p className="mt-1 text-sm text-gray-500">Period: September 2026</p>
                    </div>
                    <div className="flex items-start justify-between gap-4 sm:flex-col sm:items-end">
                      <KhananLogo variant="full" tone="onLight" className="h-16 w-16" />
                      <div className="text-right">
                        <div className="inline-block rounded bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">DRAFT</div>
                        <p className="mt-2 text-xs text-gray-400">Generated: 2026-09-20</p>
                      </div>
                    </div>
                  </div>
                </header>

                <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Compliance Score</p>
                    <p className="mt-1 text-3xl font-bold text-amber-600">72%</p>
                  </div>
                  <div className="rounded border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Open CAPA</p>
                    <p className="mt-1 text-3xl font-bold text-red-600">4</p>
                  </div>
                  <div className="rounded border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Inspections</p>
                    <p className="mt-1 text-3xl font-bold text-gray-800">2</p>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                  {/* Risk Findings & Observations */}
                  <section>
                    <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 text-lg font-bold text-gray-800">
                      <span className="text-sm font-semibold text-gray-400">1.</span>
                      <AlertTriangle className="h-5 w-5 text-red-600" /> Risk Findings & Open Observations
                    </h2>
                    <div className="space-y-4">
                      <div className="rounded border border-red-200 bg-red-50 p-4">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <h3 className="text-sm font-bold text-red-900">Torn ventilation ducting in Panel 3B</h3>
                          <span className="shrink-0 rounded bg-red-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-800">High Risk</span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase text-gray-500">Applicable Obligation</p>
                            <p className="mt-0.5 font-mono font-medium text-gray-800">CMR 2017: Reg 153</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500">Status / CAPA</p>
                            <p className="mt-0.5 font-mono text-amber-700">CAPA-2026-0042 (Overdue)</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 border-t border-red-200 pt-3">
                          <FileText className="h-4 w-4 shrink-0 text-red-700" />
                          <span className="text-xs font-medium text-red-800">Evidence Attached: KD-E102 (Photo - 94% AI Confidence)</span>
                        </div>
                      </div>

                      <div className="rounded border border-amber-200 bg-amber-50 p-4">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <h3 className="text-sm font-bold text-amber-900">Aux fan vibration abnormal</h3>
                          <span className="shrink-0 rounded bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">Medium Risk</span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase text-gray-500">Applicable Obligation</p>
                            <p className="mt-0.5 font-mono font-medium text-gray-800">CMR 2017: Reg 160</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-500">Status / CAPA</p>
                            <p className="mt-0.5 font-mono text-gray-700">Under Review</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 border-t border-amber-200 pt-3">
                          <FileText className="h-4 w-4 shrink-0 text-amber-700" />
                          <span className="text-xs font-medium text-amber-800">Evidence Attached: KD-E103 (Video)</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Statutory Obligations Status */}
                  <section>
                    <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 text-lg font-bold text-gray-800">
                      <span className="text-sm font-semibold text-gray-400">2.</span>
                      <ShieldCheck className="h-5 w-5 text-gray-700" /> Statutory Obligations Status
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-200 p-2 font-semibold text-gray-600">Obligation</th>
                            <th className="border border-gray-200 p-2 font-semibold text-gray-600">Description</th>
                            <th className="border border-gray-200 p-2 text-center font-semibold text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-200 p-2 font-mono text-gray-800">CMR Reg 153</td>
                            <td className="border border-gray-200 p-2 text-gray-600">Standard of ventilation</td>
                            <td className="border border-gray-200 p-2 text-center">
                              <span className="font-bold text-red-600">FAIL</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-2 font-mono text-gray-800">CMR Reg 158</td>
                            <td className="border border-gray-200 p-2 text-gray-600">Velocity of air current</td>
                            <td className="border border-gray-200 p-2 text-center">
                              <span className="font-bold text-red-600">FAIL</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-2 font-mono text-gray-800">CMR Reg 134</td>
                            <td className="border border-gray-200 p-2 text-gray-600">Inspection of workings</td>
                            <td className="border border-gray-200 p-2 text-center">
                              <span className="font-bold text-green-700">PASS</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Contractor Summary */}
                  <section>
                    <h2 className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 text-lg font-bold text-gray-800">
                      <span className="text-sm font-semibold text-gray-400">3.</span>
                      <HardHat className="h-5 w-5 text-gray-700" /> Contractor Summary
                    </h2>
                    <div className="rounded border border-gray-200 bg-gray-50 p-4 text-sm">
                      <p className="mb-3 leading-relaxed text-gray-700">
                        <strong>Sharma Mining Services</strong>: Active at Panel 3B. Received 1 high-risk observation this period related to ventilation maintenance. Registration valid
                        until Dec 2027.
                      </p>
                      <div className="flex flex-col gap-4 border-t border-gray-200 pt-3 sm:flex-row">
                        <div className="flex-1">
                          <span className="block text-xs uppercase text-gray-500">Active Personnel</span>
                          <span className="font-bold text-gray-800">45</span>
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs uppercase text-gray-500">Open CAPAs</span>
                          <span className="font-bold text-red-600">1</span>
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs uppercase text-gray-500">Compliance Rating</span>
                          <span className="font-bold text-amber-600">78%</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <footer className="mt-12 flex flex-col gap-1 border-t border-gray-200 pt-4 text-[11px] text-gray-400 sm:flex-row sm:justify-between">
                  <span>Khanan Drishti — Smart Governance & Compliance Monitoring (Prototype)</span>
                  <span>Page 1 of 1</span>
                </footer>
              </div>
            </article>
          </div>
        </DemoHighlight>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description="Generate, review and export clause-linked compliance reports.">
        <Button onClick={() => setShowGenerateModal(true)}>
          <Plus /> New Report
        </Button>
      </PageHeader>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select aria-label="Report type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} wrapperClassName="w-full sm:w-auto" className="sm:w-[220px]">
          <option value="ALL">All Report Types</option>
          {Object.entries(reportTypeLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <span className="text-[12px] text-text-muted kd-num">
          {filtered.length} report{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Report library */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={SearchX} title="No reports of this type" description="Generate a new report or choose a different report type." actionLabel="New Report" onAction={() => setShowGenerateModal(true)} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-4">
          {filtered.map((report) => (
            <article key={report.id} className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition-colors hover:border-border-strong">
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-inset text-text-muted">
                      <FileCheck className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="kd-overline truncate">{reportTypeLabels[report.type]}</div>
                      <h3 className="line-clamp-2 text-[14px] font-semibold leading-5 text-text-primary">{report.name}</h3>
                      <p className="font-mono text-[12px] text-amber">{report.mineName}</p>
                    </div>
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-[12px]">
                  <div>
                    <dt className="flex items-center gap-1 text-[11px] text-text-muted">
                      <CalendarDays className="h-3 w-3" /> Period
                    </dt>
                    <dd className="text-text-primary">{report.period}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-text-muted">Generated</dt>
                    <dd className="text-text-primary kd-num">{formatDate(report.generatedDate)}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-[11px] text-text-muted">
                      <User className="h-3 w-3" /> Prepared by
                    </dt>
                    <dd className="text-text-primary">{report.generatedBy}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 text-[11px] text-text-muted">
                      <HardDrive className="h-3 w-3" /> Size
                    </dt>
                    <dd className="text-text-primary kd-num">{report.fileSize}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex gap-2 border-t border-border bg-surface-2 px-4 py-2.5">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setPreviewMode(true)}>
                  <Eye /> Preview
                </Button>
                <Button variant="ghost" size="sm" className="flex-1" aria-label={`Download ${report.name} as PDF`}>
                  <Download /> PDF
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Generate Report Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate new report"
        description="Compile evidence, risk findings and contractor performance into a clause-linked report."
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowGenerateModal(false)
                setPreviewMode(true)
              }}
            >
              <FileCheck /> Generate
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Report Type" htmlFor="kd-report-type">
            <Select id="kd-report-type">
              {Object.entries(reportTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Period" htmlFor="kd-report-period" helper="Month, quarter or week — e.g. September 2026">
            <Input id="kd-report-period" defaultValue="September 2026" />
          </Field>
          <Field label="Mine (Optional)" htmlFor="kd-report-mine">
            <Select id="kd-report-mine">
              <option value="">All Mines</option>
              <option value="mine-wcl-04">WCL-04 — Wani Opencast Extension</option>
              <option value="mine-secl-07">SECL-07 — Gevra Opencast Project</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
