// frontend/src/helpers/services/authService.ts
//
// Business domain: Authentication
// Component เรียกผ่านนี้เท่านั้น ไม่แตะ apiAdapter โดยตรง

import apiAdapter from '../http/apiAdapter'
import { setInstanceToken, clearInstanceToken } from '../http/axiosInstance'
import { POST_LOGIN } from '../url_helper'

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    role: 'ADMIN' | 'STAFF'
  }
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
  /**
   * Login — บันทึก token + user ลง sessionStorage
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await apiAdapter.post<LoginPayload, LoginResponse>(
      POST_LOGIN,
      payload,
    )

    sessionStorage.setItem('authToken', res.token)
    sessionStorage.setItem('authUser', JSON.stringify(res.user))
    setInstanceToken(res.token)

    return res
  },

  /**
   * Logout — ล้าง session และ token
   */
  logout: (): void => {
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('authUser')
    clearInstanceToken()
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
