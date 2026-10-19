// ============================================================
//  src/pages/settings/services/SettingsType.ts
// ============================================================

import type { BloodGroup } from '../../../types/models'

export interface MinimumStock {
  A: number
  B: number
  O: number
  AB: number
}

export interface UserItem {
  id: string
  username: string
  name: string
  role: 'admin' | 'staff'
  active: boolean
  createdAt: string
}

export interface UserFormData {
  username: string
  name: string
  password: string
  role: 'admin' | 'staff'
}

export interface ToastState {
  type: 'success' | 'error'
  msg: string
}
