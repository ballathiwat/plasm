// ============================================================
//  src/pages/dashboard/services/useDashboard.ts
//  สต็อกเทียบขั้นต่ำมาจาก useMinStockStatus (cache เดียวกับกระดิ่งแจ้งเตือน)
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import dashboardService from './DashboardService'
import type { DailyData, LogEntryItem } from './DashboardType'
import useMinStockStatus from '../../../helpers/useMinStockStatus'
import {
  cellKey, parseCell, sortByCritical, MIN_STATUS,
  type MinStockStatusItem, type MinStockType,
} from '../../../helpers/minStock'

export interface MatrixRow { type: MinStockType; cells: MinStockStatusItem[] }

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

  // ── ตัวกรอง (กรองทันที) ──
  const [typeFilter, setTypeFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [onlyDanger, setOnlyDanger] = useState(false)

  const passes = useCallback((i: MinStockStatusItem) =>
    (!typeFilter || i.type === typeFilter) &&
    (!groupFilter || i.group === groupFilter) &&
    (!onlyDanger || i.status === 'danger'),
  [typeFilter, groupFilter, onlyDanger])

  // ── สรุป: นับ 1 รายการต่อ 1 คู่ ชนิด × หมู่ ──
  const counts = useMemo(() => {
    const c = { danger: 0, warning: 0, normal: 0, none: 0 }
    for (const i of items) c[i.status] += 1
    return c
  }, [items])

  const dangerItems = useMemo(() => items.filter((i) => i.status === 'danger').sort(sortByCritical), [items])

  // ── matrix: แถว = ชนิด เรียงตามช่องที่วิกฤตที่สุดของแถว ──
  const rows = useMemo<MatrixRow[]>(() => {
    const worst = (cells: MinStockStatusItem[]) => [...cells].sort(sortByCritical)[0]
    return types
      .filter((t) => !typeFilter || t.code === typeFilter)
      .map((t, idx) => ({ type: t, idx, cells: items.filter((i) => i.type === t.code) }))
      // แถวที่ไม่มีช่องไหนผ่านตัวกรองเลยไม่ต้องแสดง (ช่องที่ไม่ผ่านในแถวที่ยังแสดง = กรอบเส้นประ)
      .filter((r) => r.cells.some(passes))
      .sort((a, b) => sortByCritical(worst(a.cells), worst(b.cells)) || a.idx - b.idx)
      .map(({ type, cells }) => ({ type, cells }))
  }, [types, items, typeFilter, passes])
  const columns = useMemo(() => groups.filter((g) => !groupFilter || g === groupFilter), [groups, groupFilter])
  const anyVisible = useMemo(() => items.some(passes), [items, passes])

  // ── ต้องเติมก่อน: danger + warning ที่ผ่านตัวกรอง เรียง % ของขั้นต่ำน้อยสุด ──
  const refill = useMemo(() => items
    .filter((i) => (i.status === 'danger' || i.status === 'warning') && passes(i))
    .sort((a, b) => (a.pct ?? 9) - (b.pct ?? 9) || MIN_STATUS[a.status].rank - MIN_STATUS[b.status].rank),
  [items, passes])

  // ── modal รายละเอียด ──
  const [detailKey, setDetailKey] = useState<string | null>(null)
  const detail = useMemo(
    () => (detailKey ? items.find((i) => cellKey(i.type, i.group) === detailKey) ?? null : null),
    [detailKey, items],
  )
  const openDetail = useCallback((i: MinStockStatusItem) => setDetailKey(cellKey(i.type, i.group)), [])
  const closeDetail = useCallback(() => setDetailKey(null), [])

  // ── ?cell=FFP|A (มาจากการแจ้งเตือน) → ล้างตัวกรอง, scroll ไป matrix, ไฮไลต์ช่อง 3 วินาที ──
  const [sp] = useSearchParams()
  const cellParam = sp.get('cell')
  const matrixRef = useRef<HTMLDivElement>(null)
  const [highlight, setHighlight] = useState<string | null>(null)
  const handled = useRef<string | null>(null)
  // รอทั้งสถานะและส่วนอื่นของหน้า — ก่อนหน้านั้นหน้า render เป็น null จึงยังไม่มี matrix ให้ scroll
  const ready = !!status && !loadingOther

  const scrollToMatrix = useCallback(() => {
    matrixRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    const c = parseCell(cellParam)
    if (!c) { handled.current = null; return }
    if (!ready || handled.current === cellParam) return
    handled.current = cellParam
    const key = cellKey(c.type, c.group)
    setTypeFilter(''); setGroupFilter(''); setOnlyDanger(false)
    setHighlight(key)
    // รอให้ตัวกรองถูกล้างและ matrix วาดครบก่อน scroll
    const raf = requestAnimationFrame(() => {
      const el = Array.from(matrixRef.current?.querySelectorAll<HTMLElement>('[data-cell]') ?? [])
        .find((x) => x.dataset.cell === key)
      ;(el ?? matrixRef.current)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    const t = window.setTimeout(() => setHighlight(null), HIGHLIGHT_MS)
    return () => { cancelAnimationFrame(raf); window.clearTimeout(t) }
  }, [cellParam, ready])

  return {
    loading: loadingOther || loadingStatus,
    statusError: statusError && !status,
    dailyData, logEntries,
    status, types, groups,
    total: status?.totalStock ?? 0,
    configured: status?.configured ?? false,
    counts, dangerItems, rows, columns, refill, anyVisible, passes,
    typeFilter, setTypeFilter, groupFilter, setGroupFilter, onlyDanger, setOnlyDanger,
    detail, openDetail, closeDetail,
    matrixRef, highlight, scrollToMatrix,
  }
}

export type DashboardState = ReturnType<typeof useDashboard>
