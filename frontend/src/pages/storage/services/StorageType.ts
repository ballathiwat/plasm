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

export interface PaginatedBoxResponse {
  data: StorageBoxItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** ผลตรวจเลข unit ซ้ำในระบบ (GET /units/check) */
export interface UnitCheckResult {
  exists: boolean
  unitNumber?: string
  status?: 'stored' | 'withdrawn'
  boxId?: string
  boxLabel?: string
}

/** หมายเหตุการลบ unit (ส่งไปกับ PUT /boxes/:id/units) */
export interface UnitRemovalInput {
  unitNumber: string
  reasonId: string
  detail?: string
}

/** ตัวเลือกหมายเหตุการลบ (GET /master/removal-reasons — กำหนดในเมนูตั้งค่า) */
export interface RemovalReasonOption {
  id: string
  name: string
  active: boolean
}

/** ประวัติการลบ unit (GET /boxes/:id/removals) */
export interface UnitRemovalRecord {
  id: string
  unitNumber: string
  boxLabel: string
  note: string
  userName: string | null
  removedAt: string
}
