import { createBrowserRouter, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import CommandCenter from './pages/CommandCenter'
import Mines from './pages/Mines'
import MineDetail from './pages/MineDetail'
import ComplianceRisk from './pages/ComplianceRisk'
import CAPAPage from './pages/CAPA'
import Contractors from './pages/Contractors'
import Inspections from './pages/Inspections'
import EvidencePage from './pages/Evidence'
import AIInsightsPage from './pages/AIInsights'
import Reports from './pages/Reports'
import SettingsPage from './pages/Settings'
// Lazily loaded (heavy MapLibre dependency); <Suspense> boundary lives in DashboardLayout
import GISRiskMap from './pages/GISRiskMap.lazy'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <CommandCenter /> },
      { path: 'mines', element: <Mines /> },
      { path: 'mines/:id', element: <MineDetail /> },
      { path: 'map', element: <GISRiskMap /> },
      { path: 'compliance', element: <ComplianceRisk /> },
      { path: 'capa', element: <CAPAPage /> },
      { path: 'contractors', element: <Contractors /> },
      { path: 'inspections', element: <Inspections /> },
      { path: 'evidence', element: <EvidencePage /> },
      { path: 'ai-insights', element: <AIInsightsPage /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'help', element: <SettingsPage /> },
    ],
  },
])
