// ============================================================
//  frontend/src/Routes/allRoutes.tsx
// ============================================================

import { Navigate } from 'react-router-dom'

import DashboardPage from '../pages/dashboard'
import StoragePage from '../pages/storage'
import WithdrawPage from '../pages/withdraw'
import SearchPage from '../pages/search'
import MapPage from '../pages/map'
import RackPage from '../pages/rack'
import LogPage from '../pages/log'
import SettingsPage from '../pages/settings'
import ProfilePage from '../pages/profile'
import LoginPage from '../pages/auth/LoginPage'
import ReportPage from '../pages/report'
import DailyReportPage from '../pages/report-daily'
import ExtBloodPage from '../pages/ExtBlood'
import ExtBloodFormPage from '../pages/ExtBloodForm'
import ExtBloodReportPage from '../pages/ExtBloodReport'

export interface RouteConfig {
  path: string
  component: React.ReactNode
  exact?: boolean
  roles?: ('ADMIN' | 'STAFF')[]
}

const authProtectedRoutes: RouteConfig[] = [
  { path: '/', component: <DashboardPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/storage', component: <StoragePage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/withdraw', component: <WithdrawPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/search', component: <SearchPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/map', component: <MapPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/map/rack/:code', component: <RackPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/log', component: <LogPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/report', component: <ReportPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/report/daily', component: <DailyReportPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/profile', component: <ProfilePage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/ext-blood', component: <ExtBloodPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/ext-blood/create', component: <ExtBloodFormPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/ext-blood/:id/edit', component: <ExtBloodFormPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/ext-blood/report', component: <ExtBloodReportPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/ext-blood/settings', component: <Navigate to="/settings/forms?tab=extSources" replace />, roles: ['ADMIN'] },
  { path: '/settings', component: <Navigate to="/settings/system" replace />, roles: ['ADMIN'] },
  { path: '/settings/:group', component: <SettingsPage />, roles: ['ADMIN'] },
  { path: '*', component: <Navigate to="/" replace /> },
]

const publicRoutes: RouteConfig[] = [
  { path: '/login', component: <LoginPage /> },
]

export { authProtectedRoutes, publicRoutes }