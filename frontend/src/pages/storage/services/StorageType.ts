// ============================================================
//  src/pages/storage/services/StorageType.ts
// ============================================================

import type { BoxStatus } from '../../../types/models'

/** ชนิดของค่าที่เพิ่มได้ทันทีจากฟอร์มจัดเก็บ */
export type QuickAddKind = 'type' | 'blood' | 'zone' | 'shelf'

export interface StorageBoxItem {
  id: string
  boxLabel: string
  boxName?: string | null
  type: string
  blood: string
  year?: number
  location: string
  zoneId?: string
  zoneName?: string
  shelf: string
  collectionDate: string
  units: string[]
  status: BoxStatus
  storedAt: string
}

export interface StorageFormData {
  boxName: string
  type: string
  blood: string
  collectionDate: string
  zoneId: string
  shelf: string
}

export interface ToastState {
  type: 'success' | 'error'
  msg: string
}

// ── Master data ที่ฟอร์มใช้ ──
export interface MasterCode {
  id: string
  code: string
  active: boolean
}

export interface MasterShelf {
  id: string
  code: string
  active: boolean
}

export interface MasterZone {
  id: string
  name: string
  active: boolean
  shelves: MasterShelf[]
}

export interface MasterOptions {
  plasmaTypes: MasterCode[]
  bloodTypes: MasterCode[]
  zones: MasterZone[]
}

export interface CreateBoxPayload {
  boxName?: string
  type: string
  blood: string
  zoneId: string
  shelf: string
  collectionDate: string
  units: string[]
}