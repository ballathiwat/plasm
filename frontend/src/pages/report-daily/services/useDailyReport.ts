// frontend/src/pages/report-daily/services/useDailyReport.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dailyReportService from './DailyReportService'
import type { MovementResponse, FilterDraft, PresetKey } from './DailyReportType'
import type { ToastState } from '../../../components/common/Toast'

/* ── Date helpers (Bangkok time) ── */
const bkkToday = (): string => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
const addDays = (iso: string, n: number): string => {
  const d = new Date(`${iso}T00:00:00+07:00`); d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
}
const diffDays = (a: string, b: string): number => {
  const da = new Date(`${a}T00:00:00+07:00`), db = new Date(`${b}T00:00:00+07:00`)
  return Math.round((db.getTime() - da.getTime()) / 86400000) + 1
}

export const presetRange = (key: Exclude<PresetKey, 'custom'>): { from: string; to: string } => {
  const today = bkkToday(); const [y, m] = today.split('-').map(Number)
  switch (key) {
    case 'today': return { from: today, to: today }
    case '7d': return { from: addDays(today, -6), to: today }
    case '30d': return { from: addDays(today, -29), to: today }
    case 'this-month': return { from: `${y}-${String(m).padStart(2,'0')}-01`, to: today }
    case 'last-month': {
      const pm = m===1?12:m-1, py = m===1?y-1:y, ld = new Date(py,pm,0).getDate()
      return { from: `${py}-${String(pm).padStart(2,'0')}-01`, to: `${py}-${String(pm).padStart(2,'0')}-${String(ld).padStart(2,'0')}` }
    }
    case 'this-year': return { from: `${y}-01-01`, to: today }
  }
}

/* ── Validation (เฉพาะ custom) ── */
export const validateFilters = (d: FilterDraft): string | null => {
  if (d.preset !== 'custom') return null
  if (!d.from || !d.to) return 'กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด'
  const from = new Date(`${d.from}T00:00:00+07:00`), to = new Date(`${d.to}T00:00:00+07:00`)
  if (isNaN(from.getTime())||isNaN(to.getTime())) return null
  if (to < from) return 'วันสิ้นสุดต้องไม่ก่อนวันเริ่ม'
  if (to > new Date(`${bkkToday()}T00:00:00+07:00`)) return 'เลือกวันในอนาคตไม่ได้'
  if (diffDays(d.from, d.to) > 366) return 'เลือกช่วงได้ไม่เกิน 1 ปี — ลองแบ่งดูทีละช่วง'
  return null
}

/* ── Format Thai range ── */
const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
export const formatThaiDay = (iso: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '-'
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${THAI_MONTHS[m - 1]} ${y + 543}`
}
export const formatThaiRange = (from: string, to: string): string =>
  from === to ? formatThaiDay(from) : `${formatThaiDay(from)} – ${formatThaiDay(to)}`

/* ── Session storage ── */
const STORAGE_KEY = 'plasm-daily-range'
const DEFAULT: FilterDraft = { preset: '7d', ...presetRange('7d'), types: [], blood: '' }

const loadSession = (): Partial<FilterDraft> | null => {
  try { const r = sessionStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null } catch { return null }
}
const saveSession = (d: FilterDraft) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ from: d.from, to: d.to, preset: d.preset, types: d.types, blood: d.blood })) } catch {}
}

const arrEq = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i])

/* ── Hook ── */
export default function useDailyReport() {
  const [masterTypes, setMasterTypes] = useState<string[]>([])
  const [draft, setDraftState] = useState<FilterDraft>(() => {
    const s = loadSession()
    if (s?.from && s?.to && s?.preset) {
      return {
        from: s.from,
        to: s.to,
        preset: (s.preset as PresetKey) ?? '7d',
        types: Array.isArray(s.types) ? s.types : [],
        blood: typeof s.blood === 'string' ? s.blood : '',
      }
    }
    return { ...DEFAULT }
  })
  const [applied, setApplied] = useState<FilterDraft>(draft)
  const [rangeError, setRangeError] = useState<string | null>(null)
  const [data, setData] = useState<MovementResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const init = useRef(false)

  useEffect(() => {
    dailyReportService.getPlasmaTypes().then(setMasterTypes).catch(() => {})
  }, [])

  const fetchData = useCallback(async (f: FilterDraft, all: string[]) => {
    setLoading(true); setToast(null)
    try {
      const p: Record<string, string> = { from: f.from, to: f.to }
      // ส่ง types เฉพาะเมื่อเลือกบางชนิด (ไม่ส่งเมื่อว่างหรือเลือกครบ)
      if (f.types.length > 0 && f.types.length < all.length) p.types = f.types.join(',')
      // ส่ง blood เฉพาะเมื่อไม่ว่าง
      if (f.blood) p.blood = f.blood
      setData(await dailyReportService.getMovements(p)); saveSession(f)
    } catch (e: unknown) {
      setToast({ type: 'error', msg: (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'เกิดข้อผิดพลาด' })
    } finally { setLoading(false) }
  }, [])

  // Initial fetch after masterTypes loaded
  useEffect(() => {
    if (masterTypes.length > 0 && !init.current) {
      init.current = true
      fetchData(applied, masterTypes)
    }
  }, [masterTypes, applied, fetchData])

  /** แก้ค่าใน draft — ไม่ยิง API */
  const setDraft = useCallback((patch: Partial<FilterDraft>) => {
    setDraftState(prev => {
      const next = { ...prev, ...patch }
      // เปลี่ยน preset ที่ไม่ใช่ custom → ตั้ง from/to ตาม presetRange ทันที
      if (patch.preset && patch.preset !== 'custom') {
        Object.assign(next, presetRange(patch.preset))
      }
      // เปลี่ยน from/to ตรง → เป็น custom
      if (patch.from !== undefined || patch.to !== undefined) {
        if (!patch.preset) next.preset = 'custom'
      }
      return next
    })
    if ('preset' in patch || 'from' in patch || 'to' in patch) setRangeError(null)
  }, [])

  /** ค้นหา: ถ้า validate ไม่ผ่าน → ตั้ง rangeError, ไม่ค้นหา */
  const search = useCallback(() => {
    const err = validateFilters(draft)
    setRangeError(err)
    if (err) return
    setApplied({ ...draft })
    fetchData(draft, masterTypes)
  }, [draft, masterTypes, fetchData])

  /** อัปเดตทั้ง draft และ applied แล้ว fetch ทันที (chip x, ปุ่ม "ดู 30 วัน", คลิกตาราง) */
  const applyNow = useCallback((patch: Partial<FilterDraft>) => {
    setDraftState(prev => {
      const next = { ...prev, ...patch }
      if (patch.preset && patch.preset !== 'custom') Object.assign(next, presetRange(patch.preset))
      setApplied(next)
      fetchData(next, masterTypes)
      return next
    })
    setRangeError(null)
  }, [masterTypes, fetchData])

  /** ล้างทั้งหมด → กลับ DEFAULT แล้ว fetch */
  const resetAll = useCallback(() => {
    const d: FilterDraft = { ...DEFAULT, ...presetRange('7d') }
    setDraftState(d)
    setApplied(d)
    setRangeError(null)
    fetchData(d, masterTypes)
  }, [masterTypes, fetchData])

  /** เพิ่ม/ลบชนิดใน applied+draft แล้ว fetch ทันที (chip x, คลิกชื่อชนิดในตาราง) */
  const toggleTypeNow = useCallback((code: string) => {
    setDraftState(prev => {
      const types = prev.types.includes(code)
        ? prev.types.filter(x => x !== code)
        : masterTypes.filter(x => prev.types.includes(x) || x === code)
      const next = { ...prev, types }
      setApplied(next)
      fetchData(next, masterTypes)
      return next
    })
  }, [masterTypes, fetchData])

  const isDirty = useMemo(() =>
    draft.preset !== applied.preset ||
    (draft.preset === 'custom' && (draft.from !== applied.from || draft.to !== applied.to)) ||
    draft.blood !== applied.blood ||
    !arrEq(draft.types, applied.types),
  [draft, applied])

  const isNonDefault = useMemo(() => {
    const d = applied
    return d.preset !== DEFAULT.preset || d.types.length > 0 || d.blood !== '' ||
      draft.preset !== DEFAULT.preset || draft.types.length > 0 || draft.blood !== ''
  }, [applied, draft])

  return {
    masterTypes, draft, applied, data, loading, toast, setToast,
    isDirty, isNonDefault, rangeError,
    setDraft, search, applyNow, resetAll, toggleTypeNow,
  }
}
