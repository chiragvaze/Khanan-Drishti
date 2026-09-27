import { User, Bell, Shield, Info, Palette, LayoutDashboard, Brain, ShieldCheck, ClipboardCheck, Map as MapIcon, Camera, FlaskConical } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/utils'
import { useLocation } from 'react-router-dom'
import { useRole } from '../contexts/RoleContext'
import KhananLogo from '../components/shared/KhananLogo'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { ThemeSegmented } from '../components/ui/ThemeToggle'
import { DetailItem } from '../components/ui/SideSheet'

export default function SettingsPage() {
  const location = useLocation()
  const { role } = useRole()
  const isHelp = location.pathname === '/help'
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyDashboard, setNotifyDashboard] = useState(true)
  const [notifySMS, setNotifySMS] = useState(false)

  const profiles = {
    MINE_OFFICIAL: { name: 'A.K. Sharma', title: 'Mine Manager, WCL-04', email: 'ak.sharma@wcl.coalindia.in', phone: '+91-712-2XXXXXX' },
    CORPORATE_MANAGEMENT: { name: 'Shri V.K. Patel', title: 'Director (Technical), CIL', email: 'vk.patel@coalindia.in', phone: '+91-33-2248-XXXX' },
    REGULATORY_AUTHORITY: { name: 'Dr. R. Singh', title: 'Director General, DGMS', email: 'dg@dgms.gov.in', phone: '+91-326-2XXXXXX' },
  }
  const profile = profiles[role]

  if (isHelp) {
    const features = [
      { Icon: LayoutDashboard, title: 'Command Center', text: 'Real-time operational dashboard with KPIs and alerts' },
      { Icon: Brain, title: 'AI-Powered Insights', text: 'Automated risk detection with confidence scores' },
      { Icon: ShieldCheck, title: 'Compliance Tracking', text: 'CMR 2017 and DGMS regulation monitoring' },
      { Icon: ClipboardCheck, title: 'CAPA Management', text: 'Corrective actions with SLA tracking' },
      { Icon: MapIcon, title: 'GIS Risk Map', text: 'Geographical risk visualization' },
      { Icon: Camera, title: 'Evidence Management', text: 'AI-analyzed field evidence' },
    ]

    return (
      <div className="max-w-4xl space-y-5">
        <PageHeader title="Help & Support" description="About the platform, its capabilities and the prototype environment." />

        <Card className="overflow-hidden">
          <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:items-center">
            <KhananLogo variant="full" size="md" className="shrink-0" />
            <div>
              <h2 className="text-[16px] font-semibold text-text-primary">About Khanan Drishti</h2>
              <p className="mt-1.5 text-[13px] leading-6 text-text-secondary">
                Khanan Drishti is an AI-based Smart Governance and Compliance Monitoring System for Indian coal mines. The platform connects field-level inspections and evidence
                with a centralized governance dashboard, enabling real-time compliance monitoring, risk assessment, and corrective action tracking.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Key Features" icon={<Info />} />
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-b-lg bg-border sm:grid-cols-2">
            {features.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3 bg-surface p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-inset text-amber">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-[13px] font-semibold text-text-primary">{title}</h3>
                  <p className="mt-0.5 text-[12px] text-text-secondary">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex items-start gap-3 rounded-lg border border-amber/30 bg-amber-soft p-4">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <div>
            <h3 className="text-[13px] font-semibold text-amber">Smart India Hackathon — Prototype</h3>
            <p className="mt-1 text-[12px] leading-5 text-text-secondary">
              This is a prototype developed for the Smart India Hackathon. All data shown is sample/demo data and does not represent actual government statistics or real mine
              operations.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader title="Settings" description="Profile, appearance and notification preferences." />

      {/* User Profile */}
      <Card>
        <CardHeader title="User profile" icon={<User />} />
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Name">{profile.name}</DetailItem>
            <DetailItem label="Role">{profile.title}</DetailItem>
            <DetailItem label="Email">{profile.email}</DetailItem>
            <DetailItem label="Phone">
              <span className="kd-num">{profile.phone}</span>
            </DetailItem>
          </dl>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader title="Appearance" subtitle="Your choice is saved on this device." icon={<Palette />} />
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-medium text-text-primary">Colour theme</p>
            <p className="text-[12px] text-text-muted">Dark is optimised for control rooms; light for bright offices and printing.</p>
          </div>
          <ThemeSegmented className="w-full sm:w-[220px]" />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader title="Notification preferences" icon={<Bell />} />
        <ul className="divide-y divide-border">
          <ToggleRow label="Email Notifications" description="Receive alerts and reports via email" checked={notifyEmail} onChange={setNotifyEmail} />
          <ToggleRow label="Dashboard Notifications" description="Show real-time alerts on dashboard" checked={notifyDashboard} onChange={setNotifyDashboard} />
          <ToggleRow label="SMS Notifications" description="Receive critical alerts via SMS" checked={notifySMS} onChange={setNotifySMS} />
        </ul>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader title="System information" icon={<Shield />} />
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <DetailItem label="Version">
              <span className="font-mono text-[12px]">1.0.0-beta (SIH Demo)</span>
            </DetailItem>
            <DetailItem label="Environment">
              <span className="font-mono text-[12px]">Demo / Prototype</span>
            </DetailItem>
            <DetailItem label="AI Engine">
              <span className="font-mono text-[12px]">KD-AI v2.1</span>
            </DetailItem>
            <DetailItem label="Last Updated">
              <span className="font-mono text-[12px]">21 Sep 2026</span>
            </DetailItem>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-text-primary">{label}</p>
        <p className="text-[12px] text-text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full border transition-colors', checked ? 'border-transparent bg-accent' : 'border-border-strong bg-neutral')}
      >
        <span
          className={cn(
            'absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.3)] transition-all duration-200',
            checked ? 'left-[22px]' : 'left-[2px]'
          )}
        />
      </button>
    </li>
  )
}
