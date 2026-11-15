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
  /** ชั้นใน rack 1–5 (เฉพาะห้อง -30°C) */
  level?: number | null
  /** ช่องในชั้น 1–20 (เฉพาะห้อง -30°C) */
  position?: number | null
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
  legacyKey?: string | null
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
  level?: number
  position?: number
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

// ── หน้ารายการกล่อง (/storage) ──

/** สถานะกล่องที่คำนวณจาก unit: เก็บอยู่ครบ / นำออกบางส่วน / นำออกหมดแล้ว */
export type BoxState = 'STORED' | 'PARTIAL' | 'EMPTY'
export type StorageTab = 'ALL' | BoxState

export interface StorageUnitItem {
  unitNumber: string
  status: 'stored' | 'withdrawn'
}

/** แถวของ GET /boxes?view=list */
export interface StorageListItem extends StorageBoxItem {
  unitItems: StorageUnitItem[]
  unitCount: number
  storedCount: number
  state: BoxState
  /** เลข unit ที่ตรงกับคำค้น (เมื่อค้นเจอจากเลข unit ไม่ใช่หมายเลข/ชื่อกล่อง) */
  matchedUnit: string | null
}

export interface StorageListFilter {
  search?: string
  dateFrom?: string
  dateTo?: string
  zoneId?: string
  type?: string
  blood?: string
}

export interface StorageListQuery extends StorageListFilter {
  state?: BoxState
  page: number
  pageSize: number
}

export interface PaginatedListResponse {
  data: StorageListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** GET /boxes/summary */
export interface StorageSummary {
  all: number
  stored: number
  partial: number
  empty: number
  unitsStored: number
}

/** PATCH /boxes/:id/location — ห้อง rack ต้องส่ง level + position */
export interface MoveBoxPayload {
  zoneId: string
  shelf: string
  level?: number
  position?: number
}

/** กล่องที่วางอยู่ในช่องของ rack: level → position → กล่อง */
export interface RackSlotBox {
  boxId: string
  boxLabel: string
}
export type RackSlotMap = Record<number, Record<number, RackSlotBox>>
