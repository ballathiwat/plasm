// ============================================================
//  src/pages/map/services/MapType.ts
// ============================================================

import { ROOM_LEGACY_KEY } from '../../../helpers/rack'
export { ROOM_LEGACY_KEY }

// ── ข้อมูลดิบจาก backend ──
export interface MapBoxRaw {
  id: string
  boxLabel: string          
  type: string
  blood: string
  zoneId: string
  zoneName?: string
  shelf: string
  units: string[]
  status: string
  /** ชั้นใน rack 1–5 / ช่อง 1–20 — เฉพาะห้อง -30°C */
  level?: number | null
  position?: number | null
  collectionDate: string
  storedAt: string
}

/** GET /ext/stock — เลือดจากภายนอกที่ยังอยู่ในคลัง (1 แถว = 1 เอกสาร/กล่อง) */
export interface ExtStockRaw {
  id: string
  boxLabel: string
  docNumber: string
  /** รหัสชนิดเลือดจาก master_plasma_types เช่น "LDRC" */
  type: string
  /** หมู่เลือด (มี Rh ได้) เช่น "A+" */
  blood: string
  source: string
  location: string
  /** จำนวนถุงคงเหลือ (IN_STOCK) */
  bags: number
  /** yyyy-MM-dd */
  receivedDate: string
}

/** คลังของแท็บ "เก่าสุด / ใหม่สุด": in = กล่องพลาสมา, ex = รับจากภายนอก */
export type MapSource = 'in' | 'ex'

export interface MapZoneRaw {
  id: string
  name: string
  legacyKey: string | null
  active: boolean
  shelves: { id: string; code: string; active: boolean }[]
}

// ── ตัวกรองของแท็บ "เก่าสุด / ใหม่สุด" (ค่าว่าง = ทั้งหมด) ──
export interface MapFilters {
  /** รหัสหมู่เลือดจาก master เช่น "A", "AB" */
  blood: string
  /** รหัสชนิดเลือดจาก master_plasma_types เช่น "FFP" */
  type: string
}

export const EMPTY_MAP_FILTERS: MapFilters = { blood: '', type: '' }

// ── ข้อมูลที่สรุปแล้วสำหรับแสดงผล ──
export interface ShelfSummary {
  shelf: string
  totalBoxes: number
  totalUnits: number
  /** จำนวน units แยกหมู่เลือด */
  byBlood: Record<string, number>
  /** จำนวนกล่องแยกหมู่เลือด — ใช้กับป้ายสีในแผนผัง */
  byBloodBoxes: Record<string, number>
}

export interface ZoneSummary {
  id: string
  name: string
  /** 'ROOM' → ใช้ผังพื้นห้อง (ROOM_LAYOUT), อื่น ๆ → แสดงเป็นรายการชั้น */
  legacyKey: string | null
  active: boolean
  shelves: ShelfSummary[]
  totalBoxes: number
  totalUnits: number
}

// ผังพื้นห้อง -30°C เดิม (3x3) — ใช้เฉพาะสถานที่ legacyKey = 'ROOM'
// ชั้นที่ไม่อยู่ในผังนี้ (เช่น R4 ที่เพิ่มใหม่) จะถูกแสดงแยกต่อท้ายอัตโนมัติ
export const ROOM_LAYOUT: { shelf: string; row: number; col: number; label: string }[] = [
  { shelf: 'L3', row: 0, col: 0, label: 'L3' },
  { shelf: 'M1', row: 0, col: 1, label: 'M1' },
  { shelf: 'R3', row: 0, col: 2, label: 'R3' },
  { shelf: 'L2', row: 1, col: 0, label: 'L2' },
  { shelf: '',   row: 1, col: 1, label: '' },       // empty center
  { shelf: 'R2', row: 1, col: 2, label: 'R2' },
  { shelf: 'L1', row: 2, col: 0, label: 'L1' },
  { shelf: '',   row: 2, col: 1, label: 'ประตู' },  // door
  { shelf: 'R1', row: 2, col: 2, label: 'R1' },
]

/** กล่อง 1 ใบในช่อง เก่าสุด / ใหม่สุด (ใช้ร่วมกันทั้งภายใน/ภายนอก) */
export interface AgeBox {
  boxLabel: string
  /** เลขเอกสาร — เฉพาะภายนอก */
  docNumber?: string
  /** ภายใน: ชื่อสถานที่จัดเก็บ · ภายนอก: แหล่งที่มา */
  place: string
  /** ภายใน: ชั้น/ช่อง · ภายนอก: ตำแหน่งจัดเก็บ */
  location: string
  /** ภายใน: จำนวน units · ภายนอก: จำนวนถุงคงเหลือ */
  qty: number
  /** ภายใน: วันที่เก็บ · ภายนอก: วันที่รับ (yyyy-MM-dd) */
  date: string
}

/** 1 แถว = ชนิดเลือด + หมู่เลือด (ไม่ปนกล่องต่างชนิดกัน) */
export interface AgeRow {
  type: string
  blood: string
  /** คงคลังของกลุ่ม */
  boxes: number
  qty: number
  oldest: AgeBox
  /** null = กลุ่มนี้มีกล่องเดียว */
  newest: AgeBox | null
}

export interface ExtStockTotals {
  boxes: number
  bags: number
}
