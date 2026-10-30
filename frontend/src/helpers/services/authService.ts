// frontend/src/helpers/services/authService.ts
//
// Business domain: Authentication
// Component เรียกผ่านนี้เท่านั้น ไม่แตะ apiAdapter โดยตรง

import apiAdapter from '../http/apiAdapter'
import { setInstanceToken, clearInstanceToken } from '../http/axiosInstance'
import { POST_LOGIN, POST_LOGOUT } from '../url_helper'

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
}

export interface AuthUser {
  id: string
  name: string
  role: 'ADMIN' | 'STAFF'
}

/* ----------------------------------------------------------
   Service
---------------------------------------------------------- */
const authService = {
    login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await apiAdapter.post<LoginPayload, LoginResponse>(POST_LOGIN, payload)
    sessionStorage.setItem('authUser', JSON.stringify(res.user))
    return res
  },

  logout: async (): Promise<void> => {
    try {
      await apiAdapter.post<Record<string, never>, { message: string }>(POST_LOGOUT, {})
    } finally {
      sessionStorage.removeItem('authUser')
    }
  },
  /**
   * Get current user จาก session
   */
  getCurrentUser: (): AuthUser | null => {
    const raw = sessionStorage.getItem('authUser')
    return raw ? (JSON.parse(raw) as AuthUser) : null
  },
}

export default authService
