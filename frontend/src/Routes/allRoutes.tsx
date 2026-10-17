// frontend/src/Routes/allRoutes.tsx

import { Navigate } from 'react-router-dom'

// Pages
import DashboardPage from '../pages/dashboard/DashboardPage'
import StoragePage from '../pages/storage/StoragePage'
import WithdrawPage from '../pages/withdraw/WithdrawPage'
import SearchPage from '../pages/search/SearchPage'
import MapPage from '../pages/map/MapPage'
import LogPage from '../pages/log/LogPage'
import SettingsPage from '../pages/settings/SettingsPage'

// Auth
import LoginPage from '../pages/auth/LoginPage'

// ===== Route Type =====
export interface RouteConfig {
  path: string
  component: React.ReactNode
  exact?: boolean
  roles?: ('ADMIN' | 'STAFF')[]
}

// ===== Private Routes (ต้อง login + มี Layout) =====
const authProtectedRoutes: RouteConfig[] = [
  { path: '/', component: <DashboardPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/storage', component: <StoragePage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/withdraw', component: <WithdrawPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/search', component: <SearchPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/map', component: <MapPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/log', component: <LogPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/settings', component: <SettingsPage />, roles: ['ADMIN'] },
  { path: '*', component: <Navigate to="/" replace /> },
]

// ===== Public Routes =====
const publicRoutes: RouteConfig[] = [
  { path: '/login', component: <LoginPage /> },
]

export { authProtectedRoutes, publicRoutes }
