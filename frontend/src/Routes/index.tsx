// frontend/src/Routes/index.tsx

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { authProtectedRoutes, publicRoutes } from './allRoutes'
import { AuthProtected, PublicGuard, useAuth } from './AuthProtected'
import MainLayout from '../components/layout/MainLayout'
import authService from '../helpers/services/authService'
import useBloodColors from '../helpers/useBloodColors'

const PATH_TO_MODULE: Record<string, string> = {
  '/': 'dashboard',
  '/storage': 'storage',
  '/withdraw': 'withdraw',
  '/search': 'search',
  '/map': 'map',
  '/log': 'log',
  '/report': 'report-summary',
  '/report/daily': 'report-daily',
  '/settings': 'settings',
}

const MODULE_TO_PATH: Record<string, string> = {
  dashboard: '/',
  storage: '/storage',
  withdraw: '/withdraw',
  search: '/search',
  map: '/map',
  log: '/log',
  'report-summary': '/report',
  'report-daily': '/report/daily',
  settings: '/settings',
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  useBloodColors()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // ต้อง match path ที่ยาวกว่าก่อน (เช่น /report/daily ก่อน /report)
  const activeModule =
    Object.entries(PATH_TO_MODULE)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => location.pathname === path)?.[1] || 'dashboard'

  const handleNavigate = (key: string) => {
    const path = MODULE_TO_PATH[key]
    if (path) navigate(path)
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login', { replace: true })
  }

  return (
    <MainLayout
      activeModule={activeModule}
      onNavigate={handleNavigate}
      role={user.role}
      userName={user.name}
      onLogout={handleLogout}
    >
      {children}
    </MainLayout>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <PublicGuard>
              {route.component}
            </PublicGuard>
          }
        />
      ))}

      {authProtectedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <AuthProtected roles={route.roles}>
              <LayoutWrapper>
                {route.component}
              </LayoutWrapper>
            </AuthProtected>
          }
        />
      ))}
    </Routes>
  )
}