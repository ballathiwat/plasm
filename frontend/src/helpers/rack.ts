// ============================================================
//  frontend/src/helpers/rack.ts
//  ตำแหน่ง rack ของห้อง -30°C: rack(shelf) → ชั้น(level 1–5, 1 = บนสุด) → ช่อง(position 1–20)
//
//  การนับช่องในคอลัมน์ c (1–5):
//    หน้า-ล่าง = 4c−3, หน้า-บน = 4c−2, หลัง-ล่าง = 4c−1, หลัง-บน = 4c
// ============================================================

export const RACK_LEVELS = 5
export const RACK_POSITIONS = 20
export const BOX_CAPACITY = 12
export const ROOM_LEGACY_KEY = 'ROOM'

export const LEVEL_LIST = Array.from({ length: RACK_LEVELS }, (_, i) => i + 1)
export const POSITION_LIST = Array.from({ length: RACK_POSITIONS }, (_, i) => i + 1)

export interface SlotInfo {
  col: number
  row: 'หน้า' | 'หลัง'
  tier: 'ล่าง' | 'บน'
}

export function slotInfo(p: number): SlotInfo {
  const k = (p - 1) % 4
  return {
    col: Math.ceil(p / 4),
    row: k < 2 ? 'หน้า' : 'หลัง',
    tier: k % 2 === 0 ? 'ล่าง' : 'บน',
  }
}

/** "ช่อง 5 · แถวหน้า · ล่าง" */
export function slotLabel(p: number): string {
  const s = slotInfo(p)
  return `ช่อง ${p} · แถว${s.row} · ${s.tier}`
}

type Positioned = { shelf: string; level?: number | null; position?: number | null }

export const hasRackPosition = (b: Positioned) => b.level != null && b.position != null

/** "L1-2 ช่อง 7" (ห้อง) หรือ "ชั้น C1" (ตู้) */
export function positionLabel(b: Positioned): string {
  return hasRackPosition(b) ? `${b.shelf}-${b.level} ช่อง ${b.position}` : `ชั้น ${b.shelf}`
}

/** URL หน้า rack (+ เลือกชั้น/ช่อง) */
export function rackUrl(shelf: string, level?: number | null, position?: number | null): string {
  const qs = new URLSearchParams()
  if (level) qs.set('level', String(level))
  if (position) qs.set('slot', String(position))
  const q = qs.toString()
  return `/map/rack/${encodeURIComponent(shelf)}${q ? `?${q}` : ''}`
}

/** ทำความสะอาดเลข unit จากเครื่องสแกน */
export const cleanUnit = (v: string) => v.trim().toUpperCase()
