// ============================================================
//  src/pages/map/services/useMapAge.ts
//  state + logic ของแท็บ "เก่าสุด / ใหม่สุด" (ภายใน / ภายนอก)
//  - ภายใน/ภายนอก จำ draft และ filters แยกกัน
//  - เปลี่ยนค่าในฟอร์มยังไม่ค้นหา — ดึงข้อมูลเมื่อกด "ค้นหา" เท่านั้น
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import mapService from './MapService'
import usePlasmaTypes from '../../../helpers/usePlasmaTypes'
import { boxToAgeItem, buildAgeRows, extToAgeItem } from './mapAgeHelpers'
import type { AgeRow, ExtStockRaw, ExtStockTotals, MapBoxRaw, MapFilters, MapSource, MapZoneRaw } from './MapType'
import { EMPTY_MAP_FILTERS } from './MapType'

type PerSource<T> = Record<MapSource, T>

const hasValue = (f: MapFilters) => f.blood !== '' || f.type !== ''
const both = <T,>(v: T): PerSource<T> => ({ in: v, ex: v })

interface Params {
  /** กล่องภายในที่จัดเก็บอยู่ทั้งหมด (ไม่กรอง) จาก useMap */
  boxes: MapBoxRaw[]
  zones: MapZoneRaw[]
}

export default function useMapAge({ boxes, zones }: Params) {
  const [source, setSource] = useState<MapSource>('in')
  // draft   = ค่าที่เลือกอยู่ในฟอร์ม (ยังไม่เรียก API)
  // filters = ค่าที่กด "ค้นหา" แล้ว → ใช้ดึงข้อมูลและแสดงผล
  const [drafts, setDrafts] = useState<PerSource<MapFilters>>(both(EMPTY_MAP_FILTERS))
  const [filters, setFilters] = useState<PerSource<MapFilters>>(both(EMPTY_MAP_FILTERS))
  // เพิ่มค่าทุกครั้งที่กด "ค้นหา" → ค้นหาด้วยค่าเดิมซ้ำก็ดึงข้อมูลใหม่
  const [searchSeq, setSearchSeq] = useState<PerSource<number>>(both(0))
  const [busy, setBusy] = useState<PerSource<boolean>>({ in: false, ex: true })
  const [errors, setErrors] = useState<PerSource<string>>(both(''))

  const [inFiltered, setInFiltered] = useState<MapBoxRaw[]>([])
  // exAll = ภายนอกทั้งหมด (ไม่กรอง) → การ์ดสรุป + ตารางเมื่อไม่มีตัวกรอง
  const [exAll, setExAll] = useState<ExtStockRaw[] | null>(null)
  const [exFiltered, setExFiltered] = useState<ExtStockRaw[]>([])

  const masterTypes = usePlasmaTypes()

  const inFilters = filters.in
  const exFilters = filters.ex
  const inSeq = searchSeq.in
  const exSeq = searchSeq.ex

  // ภายใน: ไม่มีตัวกรองใช้ boxes ชุดเดิมจาก useMap ไม่ต้องยิงซ้ำ
  // alive กันผลลัพธ์ของคำขอเก่าเขียนทับคำขอล่าสุด
  useEffect(() => {
    if (!hasValue(inFilters)) {
      setBusy((b) => ({ ...b, in: false }))
      setErrors((e) => ({ ...e, in: '' }))
      return
    }
    let alive = true
    setBusy((b) => ({ ...b, in: true }))
    mapService
      .getStoredBoxes(inFilters)
      .then((rows) => {
        if (!alive) return
        setInFiltered(rows)
        setErrors((e) => ({ ...e, in: '' }))
      })
      .catch(() => {
        if (!alive) return
        setInFiltered([])
        setErrors((e) => ({ ...e, in: 'โหลดข้อมูลตามตัวกรองไม่สำเร็จ กรุณาลองใหม่' }))
      })
      .finally(() => {
        if (alive) setBusy((b) => ({ ...b, in: false }))
      })
    return () => {
      alive = false
    }
  }, [inFilters, inSeq])

  // ภายนอก: โหลดทั้งหมดครั้งแรก (ใช้กับการ์ดสรุปด้วย) · มีตัวกรอง → ดึงตามตัวกรอง
  useEffect(() => {
    let alive = true
    const filtered = hasValue(exFilters)
    setBusy((b) => ({ ...b, ex: true }))
    mapService
      .getExtStock(exFilters)
      .then((rows) => {
        if (!alive) return
        if (filtered) setExFiltered(rows)
        else setExAll(rows)
        setErrors((e) => ({ ...e, ex: '' }))
      })
      .catch(() => {
        if (!alive) return
        if (filtered) setExFiltered([])
        setErrors((e) => ({ ...e, ex: 'โหลดข้อมูลเลือดจากภายนอกไม่สำเร็จ กรุณาลองใหม่' }))
      })
      .finally(() => {
        if (alive) setBusy((b) => ({ ...b, ex: false }))
      })
    return () => {
      alive = false
    }
  }, [exFilters, exSeq])

  const draft = drafts[source]
  const applied = filters[source]
  const hasFilter = hasValue(applied)

  // เปลี่ยนค่าในฟอร์ม → เก็บใน draft ของคลังที่เลือกอยู่เท่านั้น
  const setBlood = (blood: string) =>
    setDrafts((d) => ({ ...d, [source]: { ...d[source], blood } }))
  const setType = (type: string) =>
    setDrafts((d) => ({ ...d, [source]: { ...d[source], type } }))
  /** กด "ค้นหา" → นำ draft ไปใช้จริง */
  const applyFilters = () => {
    setFilters((f) => ({ ...f, [source]: drafts[source] }))
    setSearchSeq((s) => ({ ...s, [source]: s[source] + 1 }))
  }
  /** กด "ล้างค่า" → ล้างทั้งฟอร์มและผลลัพธ์ของคลังที่เลือกอยู่ */
  const clearFilters = () => {
    setDrafts((d) => ({ ...d, [source]: EMPTY_MAP_FILTERS }))
    setFilters((f) => ({ ...f, [source]: EMPTY_MAP_FILTERS }))
  }

  const rows = useMemo<AgeRow[]>(() => {
    if (source === 'in') {
      const zoneNames: Record<string, string> = {}
      for (const z of zones) zoneNames[z.id] = z.name
      const list = hasValue(inFilters) ? inFiltered : boxes
      return buildAgeRows(list.map((b) => boxToAgeItem(b, zoneNames)), masterTypes)
    }
    const list = hasValue(exFilters) ? exFiltered : (exAll ?? [])
    return buildAgeRows(list.map(extToAgeItem), masterTypes)
  }, [source, boxes, zones, inFilters, inFiltered, exFilters, exFiltered, exAll, masterTypes])

  /** ยอดรวมภายนอกสำหรับการ์ดสรุป — null = ยังโหลดไม่สำเร็จ */
  const extTotals = useMemo<ExtStockTotals | null>(
    () => (exAll ? { boxes: exAll.length, bags: exAll.reduce((s, d) => s + d.bags, 0) } : null),
    [exAll],
  )

  return {
    source,
    setSource,
    rows,
    extTotals,
    draft,
    hasFilter,
    /** ฟอร์มมีค่าที่ยังไม่ได้กด "ค้นหา" */
    isDirty: draft.blood !== applied.blood || draft.type !== applied.type,
    canClear: hasFilter || hasValue(draft),
    busy: busy[source],
    error: errors[source],
    setBlood,
    setType,
    applyFilters,
    clearFilters,
  }
}
