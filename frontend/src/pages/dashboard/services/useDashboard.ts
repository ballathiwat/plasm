// ============================================================
//  src/pages/dashboard/services/useDashboard.ts
//  สต็อกเทียบขั้นต่ำมาจาก useMinStockStatus (cache เดียวกับกระดิ่งแจ้งเตือน)
//  การ์ด "สต็อกเทียบขั้นต่ำ" = accordion ชนิดเลือดละ 1 แถว (แบบ D — พับได้ เน้นที่มีปัญหา)
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import dashboardService from './DashboardService'
import type { DailyData, LogEntryItem } from './DashboardType'
import useMinStockStatus from '../../../helpers/useMinStockStatus'
import {
  aboOf, cellKey, matchesGroup, parseCell, rhRank, sortByCritical,
  type MinStockStatusItem, type MinStockType,
} from '../../../helpers/minStock'

export interface MinFilters { type: string; group: string; onlyDanger: boolean }
const NO_FILTERS: MinFilters = { type: '', group: '', onlyDanger: false }

/** กลุ่ม ABO ของ 1 ชนิด เช่น A · A+ · A− */
export interface MinGroup { abo: string; cells: MinStockStatusItem[] }
/** 1 แถวของ accordion = 1 ชนิดเลือด (ตัวเลขนับเฉพาะหมู่ที่อยู่ในตัวกรองหมู่เลือด) */
export interface MinRow {
  type: MinStockType
  groups: MinGroup[]
  danger: number
  warning: number
  /** คงเหลือรวม (unit) */
  total: number
  /** ยังไม่ได้ตั้งค่าขั้นต่ำทั้งแถว */
  unset: boolean
}

const HIGHLIGHT_MS = 3000

export default function useDashboard() {
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [logEntries, setLogEntries] = useState<LogEntryItem[]>([])
  const [loadingOther, setLoadingOther] = useState(true)
  const { status, loading: loadingStatus, error: statusError } = useMinStockStatus()

  useEffect(() => {
    // กราฟรายวันและกิจกรรมล่าสุดเป็นส่วนเสริม — ดึงไม่ได้ให้แสดงส่วนอื่นของแดชบอร์ดต่อ (ค่าเริ่มต้น = ว่าง)
    Promise.allSettled([dashboardService.getStockDaily(7), dashboardService.getRecentLog()])
      .then(([daily, log]) => {
        if (daily.status === 'fulfilled') setDailyData(daily.value)
        if (log.status === 'fulfilled') setLogEntries(log.value)
      })
      .finally(() => setLoadingOther(false))
  }, [])

  const items = useMemo(() => status?.items ?? [], [status])
  const types = useMemo(() => status?.types ?? [], [status])
  const groups = useMemo(() => status?.groups ?? [], [status])

  // ── ตัวกรอง: draft (กำลังเลือก) → กด "ค้นหา" จึงมีผล (filters) ──
  const [draft, setDraft] = useState<MinFilters>(NO_FILTERS)
  const [filters, setFilters] = useState<MinFilters>(NO_FILTERS)
  const patchDraft = useCallback((p: Partial<MinFilters>) => setDraft((d) => ({ ...d, ...p })), [])
  const search = useCallback(() => setFilters(draft), [draft])
  /** ลบ chip = มีผลทันที (แก้ทั้งค่าที่ใช้อยู่และ draft ของตัวกรองนั้น) */
  const applyNow = useCallback((p: Partial<MinFilters>) => {
    setFilters((f) => ({ ...f, ...p }))
    setDraft((d) => ({ ...d, ...p }))
  }, [])
  const resetFilters = useCallback(() => { setDraft(NO_FILTERS); setFilters(NO_FILTERS) }, [])
  const isDirty = draft.type !== filters.type || draft.group !== filters.group || draft.onlyDanger !== filters.onlyDanger
  const isFiltered = !!filters.type || !!filters.group || filters.onlyDanger

  const inScope = useCallback((i: MinStockStatusItem) =>
    (!filters.type || i.type === filters.type) && matchesGroup(i.group, filters.group),
  [filters.type, filters.group])
  const passes = useCallback((i: MinStockStatusItem) =>
    inScope(i) && (!filters.onlyDanger || i.status === 'danger'),
  [inScope, filters.onlyDanger])

  // ── สรุป: นับ 1 รายการต่อ 1 คู่ ชนิด × หมู่ (ทั้งระบบ ไม่ขึ้นกับตัวกรอง) ──
  const counts = useMemo(() => {
    const c = { danger: 0, warning: 0, normal: 0, none: 0 }
    for (const i of items) c[i.status] += 1
    return c
  }, [items])

  const dangerItems = useMemo(() => items.filter((i) => i.status === 'danger').sort(sortByCritical), [items])

  /** ชนิดที่ยังไม่ตั้งค่าทั้งแถวและไม่มีสต็อก — ซ่อนไว้จนกว่าจะกด "แสดงชนิดที่ยังไม่ตั้งค่า" */
  const idleTypes = useMemo(() => new Set(
    types
      .filter((t) => items.filter((i) => i.type === t.code).every((i) => i.status === 'none' && i.stock === 0))
      .map((t) => t.code),
  ), [types, items])
  const [showIdle, setShowIdle] = useState(false)

  // ── แถว accordion: ชนิดละ 1 แถว เรียงตามช่องที่วิกฤตที่สุดของแถว ──
  const allRows = useMemo<MinRow[]>(() => {
    const aboOrder = [...new Set(groups.map(aboOf))]
    return types
      .map((t, idx) => ({ t, idx, cells: items.filter((i) => i.type === t.code && inScope(i)) }))
      // แถวที่ไม่มีช่องไหนผ่านตัวกรองเลยไม่ต้องแสดง
      .filter((r) => r.cells.some(passes))
      .map((r) => ({ ...r, worst: [...r.cells].sort(sortByCritical)[0] }))
      .sort((a, b) => sortByCritical(a.worst, b.worst) || a.idx - b.idx)
      .map(({ t, cells }) => ({
        type: t,
        groups: aboOrder
          .map((abo) => ({
            abo,
            cells: cells
              .filter((c) => aboOf(c.group) === abo)
              .sort((a, b) => rhRank(a.group) - rhRank(b.group) || groups.indexOf(a.group) - groups.indexOf(b.group)),
          }))
          // กลุ่มที่ไม่มีช่องไหนผ่านตัวกรองไม่ต้องแสดง (ช่องที่ไม่ผ่านในกลุ่มที่ยังแสดง = กรอบเส้นประ)
          .filter((g) => g.cells.some(passes)),
        danger: cells.filter((c) => c.status === 'danger').length,
        warning: cells.filter((c) => c.status === 'warning').length,
        total: cells.reduce((s, c) => s + c.stock, 0),
        unset: cells.every((c) => c.status === 'none'),
      }))
  }, [types, groups, items, inScope, passes])

  // เลือกชนิดนั้นในตัวกรองโดยตรง = แสดงเสมอ
  const isHidden = useCallback(
    (code: string) => !showIdle && idleTypes.has(code) && filters.type !== code,
    [showIdle, idleTypes, filters.type],
  )
  const rows = useMemo(() => allRows.filter((r) => !isHidden(r.type.code)), [allRows, isHidden])
  const idleCodes = useMemo(
    () => allRows.filter((r) => idleTypes.has(r.type.code) && filters.type !== r.type.code).map((r) => r.type.code),
    [allRows, idleTypes, filters.type],
  )

  // ── กาง/พับ: ค่าเริ่มต้น = กางทุกแถว (เห็นข้อมูลทุกชนิดทันที) · ผู้ใช้กดเองแล้วจำค่าที่กดไว้ ──
  const [openOverride, setOpenOverride] = useState<Record<string, boolean>>({})
  const isOpen = useCallback((r: MinRow) => openOverride[r.type.code] ?? true, [openOverride])
  const toggleRow = useCallback((r: MinRow) => {
    setOpenOverride((o) => ({ ...o, [r.type.code]: !(o[r.type.code] ?? true) }))
  }, [])
  const setAllOpen = useCallback((open: boolean) => {
    setOpenOverride(Object.fromEntries(types.map((t) => [t.code, open])))
  }, [types])

  // ── modal รายละเอียด ──
  const [detailKey, setDetailKey] = useState<string | null>(null)
  const detail = useMemo(
    () => (detailKey ? items.find((i) => cellKey(i.type, i.group) === detailKey) ?? null : null),
    [detailKey, items],
  )
  const openDetail = useCallback((i: MinStockStatusItem) => setDetailKey(cellKey(i.type, i.group)), [])
  const closeDetail = useCallback(() => setDetailKey(null), [])

  // ── ?cell=FFP|A (มาจากการแจ้งเตือน) → ล้างตัวกรอง, กางแถวของชนิดนั้น, ไฮไลต์ช่อง 3 วินาที ──
  const [sp] = useSearchParams()
  const cellParam = sp.get('cell')
  const cardRef = useRef<HTMLDivElement>(null)
  const [highlight, setHighlight] = useState<string | null>(null)
  const handled = useRef<string | null>(null)
  // รอทั้งสถานะและส่วนอื่นของหน้า — ก่อนหน้านั้นหน้า render เป็น null จึงยังไม่มีการ์ดให้ scroll
  const ready = !!status && !loadingOther

  const scrollToCard = useCallback(() => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    const c = parseCell(cellParam)
    if (!c) { handled.current = null; return }
    if (!ready || handled.current === cellParam) return
    handled.current = cellParam
    const key = cellKey(c.type, c.group)
    setDraft(NO_FILTERS); setFilters(NO_FILTERS)
    setShowIdle(true) // เผื่อชนิดนั้นถูกซ่อนเพราะยังไม่ตั้งค่า
    setOpenOverride((o) => ({ ...o, [c.type]: true }))
    setHighlight(key)
    // รอให้ตัวกรองถูกล้างและแถวกางเสร็จก่อน scroll
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = Array.from(cardRef.current?.querySelectorAll<HTMLElement>('[data-cell]') ?? [])
          .find((x) => x.dataset.cell === key)
        ;(el ?? cardRef.current)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    })
    const t = window.setTimeout(() => setHighlight(null), HIGHLIGHT_MS)
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); window.clearTimeout(t) }
  }, [cellParam, ready])

  return {
    loading: loadingOther || loadingStatus,
    statusError: statusError && !status,
    dailyData, logEntries,
    status, types, groups,
    total: status?.totalStock ?? 0,
    configured: status?.configured ?? false,
    counts, dangerItems, rows, passes,
    draft, filters, patchDraft, search, applyNow, resetFilters, isDirty, isFiltered,
    idleCodes, showIdle, setShowIdle,
    isOpen, toggleRow, setAllOpen,
    detail, openDetail, closeDetail,
    cardRef, highlight, scrollToCard,
  }
}

export type DashboardState = ReturnType<typeof useDashboard>
