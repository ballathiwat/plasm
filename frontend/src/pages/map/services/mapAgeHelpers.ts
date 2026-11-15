// ============================================================
//  src/pages/map/services/mapAgeHelpers.ts
//  ฟังก์ชันล้วน (ไม่มี state) ของแท็บ "เก่าสุด / ใหม่สุด"
// ============================================================

import { positionLabel } from '../../../helpers/rack'
import type { AgeBox, AgeRow, ExtStockRaw, MapBoxRaw, MapSource } from './MapType'

/** กล่อง 1 ใบ + คีย์จัดกลุ่ม */
export interface AgeItem extends AgeBox {
  type: string
  blood: string
}

export const SOURCE_UNIT: Record<MapSource, string> = { in: 'units', ex: 'ถุง' }
export const SOURCE_DATE_LABEL: Record<MapSource, string> = { in: 'วันที่เก็บ', ex: 'วันที่รับ' }

export const boxToAgeItem = (b: MapBoxRaw, zoneNames: Record<string, string>): AgeItem => ({
  type: b.type,
  blood: b.blood,
  boxLabel: b.boxLabel,
  place: b.zoneName || zoneNames[b.zoneId] || '',
  location: positionLabel(b),
  qty: Array.isArray(b.units) ? b.units.length : 0,
  date: b.collectionDate,
})

export const extToAgeItem = (d: ExtStockRaw): AgeItem => ({
  type: d.type,
  blood: d.blood,
  boxLabel: d.boxLabel,
  docNumber: d.docNumber,
  place: d.source,
  location: d.location,
  qty: d.bags,
  date: d.receivedDate,
})

const BASE_ORDER = ['A', 'B', 'O', 'AB']

/** ลำดับหมู่เลือด: A, B, O, AB · ไม่มี Rh → + → −  (หมู่อื่นต่อท้าย) */
const bloodRank = (blood: string): number => {
  const code = blood.toUpperCase().replace(/−/g, '-')
  const rh = code.endsWith('+') ? 1 : code.endsWith('-') ? 2 : 0
  const i = BASE_ORDER.indexOf(code.replace(/[+-]$/, ''))
  return (i === -1 ? BASE_ORDER.length : i) * 3 + rh
}

const isOlder = (a: AgeItem, b: AgeItem) =>
  a.date < b.date || (a.date === b.date && a.boxLabel < b.boxLabel)

const toBox = (i: AgeItem): AgeBox => ({
  boxLabel: i.boxLabel,
  docNumber: i.docNumber,
  place: i.place,
  location: i.location,
  qty: i.qty,
  date: i.date,
})

/**
 * จัดกลุ่ม "ชนิดเลือด + หมู่เลือด" → หากล่องเก่าสุด / ใหม่สุด + คงคลังของกลุ่ม
 * เรียงตาม master ชนิดเลือด → หมู่เลือด (ค่าที่ไม่อยู่ใน master ต่อท้าย)
 */
export function buildAgeRows(items: AgeItem[], typeOrder: string[]): AgeRow[] {
  const groups = new Map<string, { type: string; blood: string; boxes: number; qty: number; oldest: AgeItem; newest: AgeItem }>()

  for (const item of items) {
    const key = `${item.type}|${item.blood}`
    const g = groups.get(key)
    if (!g) {
      groups.set(key, { type: item.type, blood: item.blood, boxes: 1, qty: item.qty, oldest: item, newest: item })
      continue
    }
    g.boxes += 1
    g.qty += item.qty
    if (isOlder(item, g.oldest)) g.oldest = item
    if (isOlder(g.newest, item)) g.newest = item
  }

  const typeRank = (t: string) => {
    const i = typeOrder.indexOf(t)
    return i === -1 ? typeOrder.length : i
  }

  return [...groups.values()]
    .sort(
      (x, y) =>
        typeRank(x.type) - typeRank(y.type) ||
        x.type.localeCompare(y.type) ||
        bloodRank(x.blood) - bloodRank(y.blood) ||
        x.blood.localeCompare(y.blood),
    )
    .map((g) => ({
      type: g.type,
      blood: g.blood,
      boxes: g.boxes,
      qty: g.qty,
      oldest: toBox(g.oldest),
      newest: g.boxes > 1 ? toBox(g.newest) : null,
    }))
}

const DAY_MS = 86_400_000

/** "yyyy-MM-dd" → "วันนี้" / "12 วันที่แล้ว" (นับตามวันปฏิทินของเครื่อง) */
export function daysAgoLabel(isoDate: string, now: Date = new Date()): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return ''
  const days = Math.round(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(y, m - 1, d).getTime()) / DAY_MS,
  )
  if (days < 0) return ''
  return days === 0 ? 'วันนี้' : `${days.toLocaleString('th-TH')} วันที่แล้ว`
}
