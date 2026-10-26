// ============================================================
//  src/pages/map/services/MapType.ts
// ============================================================

// ── ข้อมูลดิบจาก backend ──
export interface MapBoxRaw {
  id: string
  boxLabel: string          
  blood: string
  zoneId: string
  zoneName?: string
  shelf: string
  units: string[]
  status: string
  collectionDate: string    
  storedAt: string          
}

export interface MapZoneRaw {
  id: string
  name: string
  legacyKey: string | null
  active: boolean
  shelves: { id: string; code: string; active: boolean }[]
}

// ── ข้อมูลที่สรุปแล้วสำหรับแสดงผล ──
export interface ShelfSummary {
  shelf: string
  totalBoxes: number
  totalUnits: number
  byBlood: Record<string, number>
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

export interface BloodGroupAgeInfo {
  blood: string
  oldest: { boxLabel: string; zoneName: string; shelf: string; collectionDate: string } | null
  newest: { boxLabel: string; zoneName: string; shelf: string; collectionDate: string } | null
}

export const ROOM_LEGACY_KEY = 'ROOM'
