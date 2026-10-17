// frontend/src/Routes/index.tsx

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { authProtectedRoutes, publicRoutes } from './allRoutes'
import { AuthProtected, PublicGuard, useAuth } from './AuthProtected'
import MainLayout from '../components/layout/MainLayout'

const PATH_TO_MODULE: Record<string, string> = {
  '/': 'dashboard',
  '/storage': 'storage',
  '/withdraw': 'withdraw',
  '/search': 'search',
  '/map': 'map',
  '/log': 'log',
  '/settings': 'settings',
}

const MODULE_TO_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(PATH_TO_MODULE).map(([path, mod]) => [mod, path]),
)

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const activeModule = PATH_TO_MODULE[location.pathname] || 'dashboard'

  const handleNavigate = (key: string) => {
    const path = MODULE_TO_PATH[key]
    if (path) navigate(path)
  }

  return (
    <MainLayout
      activeModule={activeModule}
      onNavigate={handleNavigate}
      role={user.role}
      userName={user.name}
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
