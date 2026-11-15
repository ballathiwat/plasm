// ============================================================
//  frontend/src/pages/storage/services/useStorageList.ts
//  state + logic ของหน้ารายการกล่อง (/storage)
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import storageService from './StorageService'
import type {
  BoxState, MasterCode, MasterZone, MoveBoxPayload, RemovalReasonOption,
  StorageListFilter, StorageListItem, StorageSummary, StorageTab, UnitRemovalInput,
} from './StorageType'
import type { ToastState } from '../../../components/common/Toast'
import type { BarcodeLabelData } from '../components/BarcodeLabel'
import type { ApiError } from '../../../helpers/http/types'
import { positionLabel } from '../../../helpers/rack'

export const STORAGE_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300
const EMPTY_SUMMARY: StorageSummary = { all: 0, stored: 0, partial: 0, empty: 0, unitsStored: 0 }

const errorMessage = (err: unknown, fallback: string) =>
  (err as Partial<ApiError> | null)?.message || fallback

/** มีตัวกรองใดถูกใช้อยู่หรือไม่ (รวมคำค้น) */
export const hasActiveFilter = (f: StorageListFilter) =>
  Boolean(f.search || f.dateFrom || f.dateTo || f.zoneId || f.type || f.blood)

export interface StorageListMaster {
  zones: MasterZone[]
  plasmaTypes: MasterCode[]
  bloodTypes: MasterCode[]
}

export default function useStorageList() {
  const [tab, setTabState] = useState<StorageTab>('ALL')
  const [filter, setFilterState] = useState<StorageListFilter>({})
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const [items, setItems] = useState<StorageListItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** ตัวเลขการ์ดสรุป (ทั้งระบบ) และ badge ของแท็บ (ตามตัวกรองปัจจุบัน) */
  const [summary, setSummary] = useState<StorageSummary>(EMPTY_SUMMARY)
  const [tabCounts, setTabCounts] = useState<StorageSummary>(EMPTY_SUMMARY)

  const [master, setMaster] = useState<StorageListMaster>({ zones: [], plasmaTypes: [], bloodTypes: [] })
  const [removalReasons, setRemovalReasons] = useState<RemovalReasonOption[]>([])

  const [toast, setToast] = useState<ToastState | null>(null)
  const [printData, setPrintData] = useState<BarcodeLabelData | null>(null)
  const [detailBox, setDetailBox] = useState<StorageListItem | null>(null)
  const [editBox, setEditBox] = useState<StorageListItem | null>(null)
  const [moveBox, setMoveBox] = useState<StorageListItem | null>(null)

  // ── ค้นหา: debounce 300ms แล้วค่อยส่งเป็นตัวกรอง ──
  useEffect(() => {
    const next = searchInput.trim() || undefined
    const t = window.setTimeout(() => {
      setFilterState((f) => (f.search === next ? f : { ...f, search: next }))
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [searchInput])

  // ── เปลี่ยนตัวกรอง/แท็บ → กลับหน้า 1 ──
  const setFilter = useCallback((patch: Partial<StorageListFilter>) => {
    setFilterState((f) => ({ ...f, ...patch }))
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchInput('')
    setFilterState({})
    setPage(1)
  }, [])

  const setTab = useCallback((t: StorageTab) => {
    setTabState(t)
    setPage(1)
  }, [])

  // ── โหลดรายการ (กัน response เก่าทับ response ใหม่) ──
  const requestId = useRef(0)
  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const state: BoxState | undefined = tab === 'ALL' ? undefined : tab
      const filtered = hasActiveFilter(filter)
      const [list, global, scoped] = await Promise.all([
        storageService.listBoxes({ ...filter, state, page, pageSize: STORAGE_PAGE_SIZE }),
        storageService.getBoxSummary(),
        filtered ? storageService.getBoxSummary(filter) : null,
      ])
      if (id !== requestId.current) return
      setItems(list.data)
      setTotal(list.total)
      setTotalPages(list.totalPages)
      setSummary(global)
      setTabCounts(scoped ?? global)
    } catch (err) {
      if (id !== requestId.current) return
      setItems([])
      setTotal(0)
      setTotalPages(0)
      setError(errorMessage(err, 'โหลดรายการกล่องไม่สำเร็จ'))
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [tab, filter, page])

  useEffect(() => {
    load()
  }, [load])

  // ── ข้อมูลหลักสำหรับตัวกรองและ modal ──
  useEffect(() => {
    Promise.all([
      storageService.listZones(),
      storageService.listPlasmaTypes(),
      storageService.listBloodTypes(),
      storageService.listRemovalReasons(),
    ])
      .then(([zones, plasmaTypes, bloodTypes, reasons]) => {
        setMaster({ zones, plasmaTypes, bloodTypes })
        setRemovalReasons(reasons.filter((r) => r.active))
      })
      .catch((err: unknown) => {
        setToast({ type: 'error', msg: errorMessage(err, 'โหลดข้อมูลหลักไม่สำเร็จ') })
      })
  }, [])

  /** ห้อง/ตู้ที่เปิดใช้งาน + ชั้นวางที่เปิดใช้งาน (ปลายทางของการย้ายกล่อง) */
  const activeZones = useMemo(
    () => master.zones
      .filter((z) => z.active)
      .map((z) => ({ ...z, shelves: z.shelves.filter((s) => s.active) })),
    [master.zones],
  )

  // ── พิมพ์ฉลาก ──
  const handlePrint = useCallback((box: StorageListItem) => {
    setPrintData({
      boxLabel: box.boxLabel,
      type: box.type,
      blood: box.blood,
      location: box.zoneName || String(box.location),
      shelf: box.level != null && box.position != null
        ? `${box.shelf}-${box.level} ช่อง ${box.position}`
        : box.shelf,
      collectionDate: box.collectionDate,
      unitCount: box.storedCount > 0 ? box.storedCount : box.unitCount,
    })
  }, [])

  // ── เปิด modal (เปิดแก้ไข/ย้ายจากหน้ารายละเอียด → ปิดรายละเอียดก่อน) ──
  const openEdit = useCallback((box: StorageListItem) => {
    setDetailBox(null)
    setEditBox(box)
  }, [])
  const openMove = useCallback((box: StorageListItem) => {
    setDetailBox(null)
    setMoveBox(box)
  }, [])

  /** บันทึกการแก้ไข units — คืน null เมื่อสำเร็จ / ข้อความ error (modal แสดงและไม่ปิด) */
  const handleSaveUnits = useCallback(async (
    box: StorageListItem,
    units: string[],
    removals: UnitRemovalInput[],
    addedCount: number,
  ): Promise<string | null> => {
    try {
      await storageService.updateBoxUnits(box.id, units, removals)
      const parts = [
        addedCount > 0 ? `เพิ่ม ${addedCount}` : '',
        removals.length > 0 ? `ลบ ${removals.length}` : '',
      ].filter(Boolean)
      setToast({ type: 'success', msg: `แก้ไข ${box.boxLabel} แล้ว — ${parts.join(' · ')}` })
      setEditBox(null)
      load()
      return null
    } catch (err) {
      return errorMessage(err, 'บันทึกการแก้ไขไม่สำเร็จ')
    }
  }, [load])

  /** ย้ายกล่อง — คืน null เมื่อสำเร็จ / ข้อความ error */
  const handleMove = useCallback(async (
    box: StorageListItem,
    target: MoveBoxPayload,
    zoneName: string,
  ): Promise<string | null> => {
    try {
      await storageService.moveBox(box.id, target)
      setToast({
        type: 'success',
        msg: `ย้าย ${box.boxLabel} ไป ${zoneName} · ${positionLabel(target)} แล้ว`,
      })
      setMoveBox(null)
      load()
      return null
    } catch (err) {
      return errorMessage(err, 'ย้ายกล่องไม่สำเร็จ')
    }
  }, [load])

  return {
    // รายการ
    items, total, totalPages, page, loading, error,
    setPage, reload: load,
    // แท็บ + ตัวกรอง
    tab, setTab, summary, tabCounts,
    filter, setFilter, searchInput, setSearchInput, clearFilters,
    // ข้อมูลหลัก
    master, activeZones, removalReasons,
    // modal
    detailBox, setDetailBox, editBox, setEditBox, moveBox, setMoveBox,
    openEdit, openMove,
    // actions
    printData, handlePrint, closePrint: () => setPrintData(null),
    handleSaveUnits, handleMove,
    toast, dismissToast: () => setToast(null),
  }
}
