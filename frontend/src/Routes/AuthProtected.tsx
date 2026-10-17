// frontend/src/Routes/AuthProtected.tsx

import { Navigate } from 'react-router-dom'
import type { UserRole } from '../types/navigation'

interface AuthUser {
  id: string
  name: string
  role: UserRole
}

// ===== Simple auth hook (เหมือน dormitory) =====
export function useAuth(): { isAuthenticated: boolean; user: AuthUser } {
  const token = sessionStorage.getItem('authToken')
  const userStr = sessionStorage.getItem('authUser')

  if (token && userStr) {
    return { isAuthenticated: true, user: JSON.parse(userStr) }
  }

  // Default: auto-login as admin (dev mode)
  return {
    isAuthenticated: true,
    user: { id: '1', name: 'ผู้ดูแลระบบ', role: 'ADMIN' },
  }
}

// ===== Auth guard =====
export function AuthProtected({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole[]
}) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return <>{children}</>
}

// ===== Public guard (ถ้า login แล้ว redirect ไป dashboard) =====
export function PublicGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/" replace />

  return <>{children}</>
}
