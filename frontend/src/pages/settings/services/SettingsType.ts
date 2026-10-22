// ============================================================
//  src/pages/settings/services/SettingsType.ts
// ============================================================


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

export interface CodeItem {
  id: string
  code: string
  name: string | null
  active: boolean
  sort: number
}

export interface ShelfItem {
  id: string
  code: string
  active: boolean
}

export interface ZoneItem {
  id: string
  name: string
  active: boolean
  shelves: ShelfItem[]
}
