import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@presentation/pages/HomePage'
import { DashboardPage } from '@presentation/pages/DashboardPage'
import { StationsPage } from '@presentation/pages/StationsPage'
import { AlertsPage } from '@presentation/pages/AlertsPage'
import { ReportsPage } from '@presentation/pages/ReportsPage'
import { ActivityReportPage } from '@presentation/pages/ActivityReportPage'
import { AdminPage } from '@presentation/pages/AdminPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/stations" element={<StationsPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/activity" element={<ActivityReportPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}