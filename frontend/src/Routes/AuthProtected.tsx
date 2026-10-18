// frontend/src/Routes/AuthProtected.tsx

import { Navigate } from 'react-router-dom'
import type { UserRole } from '../types/navigation'

interface AuthUser {
  id: string
  name: string
  role: UserRole
}

// ===== Simple auth hook =====
export function useAuth(): { isAuthenticated: boolean; user: AuthUser } {
  const token = sessionStorage.getItem('authToken')
  const userStr = sessionStorage.getItem('authUser')

  if (token && userStr) {
    try {
      return { isAuthenticated: true, user: JSON.parse(userStr) }
    } catch {
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('authUser')
    }
  }

  // ไม่มี token → ไม่ authenticated
  return {
    isAuthenticated: false,
    user: { id: '', name: '', role: 'STAFF' },
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

// ===== Public guard =====
export function PublicGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/" replace />

  return <>{children}</>
}