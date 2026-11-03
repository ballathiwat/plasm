// frontend/src/pages/report-daily/services/useDailyReport.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dailyReportService from './DailyReportService'
import type { MovementResponse, FilterDraft, PresetKey } from './DailyReportType'
import type { ToastState } from '../../../components/common/Toast'

// ── Date helpers ──
const bkkToday = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })

const addDays = (iso: string, n: number): string => {
  const d = new Date(`${iso}T00:00:00+07:00`)
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
}

const diffDays = (from: string, to: string): number => {
  const a = new Date(`${from}T00:00:00+07:00`)
  const b = new Date(`${to}T00:00:00+07:00`)
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1
}

export const presetRange = (key: PresetKey): { from: string; to: string } => {
  const today = bkkToday()
  const [y, m] = today.split('-').map(Number)
  switch (key) {
    case 'today': return { from: today, to: today }
    case '7d': return { from: addDays(today, -6), to: today }
    case '30d': return { from: addDays(today, -29), to: today }
    case 'this-month': return { from: `${y}-${String(m).padStart(2, '0')}-01`, to: today }
    case 'last-month': {
      const pm = m === 1 ? 12 : m - 1
      const py = m === 1 ? y - 1 : y
      const ld = new Date(py, pm, 0).getDate()
      return { from: `${py}-${String(pm).padStart(2, '0')}-01`, to: `${py}-${String(pm).padStart(2, '0')}-${String(ld).padStart(2, '0')}` }
    }
    case 'this-year': return { from: `${y}-01-01`, to: today }
    case 'last-year': return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31` }
  }
}

// ── Validation ──
export interface ValidationError { field: 'to' | 'from'; message: string }

export const validateFilters = (draft: FilterDraft): ValidationError | null => {
  if (!draft.from || !draft.to) return null
  const from = new Date(`${draft.from}T00:00:00+07:00`)
  const to = new Date(`${draft.to}T00:00:00+07:00`)
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null
  if (to < from) return { field: 'to', message: 'วันสิ้นสุดต้องไม่ก่อนวันเริ่ม' }
  const today = new Date(`${bkkToday()}T00:00:00+07:00`)
  if (to > today) return { field: 'to', message: 'วันสิ้นสุดต้องไม่เกินวันนี้' }
  if (diffDays(draft.from, draft.to) > 366) return { field: 'to', message: 'เลือกช่วงได้ไม่เกิน 1 ปี — ลองแบ่งดูทีละช่วง' }
  return null
}

// ── Session storage ──
const STORAGE_KEY = 'plasm-daily-range'
const loadSession = (): Partial<FilterDraft> | null => {
  try { const r = sessionStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null } catch { return null }
}
const saveSession = (d: FilterDraft) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ from: d.from, to: d.to, preset: d.preset })) } catch { /* */ }
}

// ── Types comparison ──
const arrEq = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i])

// ── Hook ──
export default function useDailyReport() {
  const [masterTypes, setMasterTypes] = useState<string[]>([])
  const [draft, setDraft] = useState<FilterDraft>(() => {
    const saved = loadSession()
    const range = saved?.from && saved?.to ? { from: saved.from, to: saved.to } : presetRange('7d')
    return { ...range, preset: (saved?.preset as PresetKey) ?? '7d', types: [], group: 'all' }
  })
  const [applied, setApplied] = useState<FilterDraft>(draft)
  const [data, setData] = useState<MovementResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const initialFetch = useRef(false)

  // Load master types
  useEffect(() => {
    dailyReportService.getPlasmaTypes().then(setMasterTypes).catch(() => {})
  }, [])

  // Fetch
  const fetchData = useCallback(async (filters: FilterDraft, allTypes: string[]) => {
    setLoading(true); setToast(null)
    try {
      const params: Record<string, string> = { from: filters.from, to: filters.to }
      const effectiveTypes = filters.types.length === 0 ? allTypes : filters.types
      if (effectiveTypes.length > 0 && effectiveTypes.length < allTypes.length) {
        params.types = effectiveTypes.join(',')
      }
      if (filters.group !== 'all') params.group = filters.group
      const res = await dailyReportService.getMovements(params)
      setData(res)
      saveSession(filters)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      setToast({ type: 'error', msg })
    } finally { setLoading(false) }
  }, [])

  // Auto-fetch on mount (after master loaded)
  useEffect(() => {
    if (masterTypes.length > 0 && !initialFetch.current) {
      initialFetch.current = true
      fetchData(applied, masterTypes)
    }
  }, [masterTypes, applied, fetchData])

  // Actions
  const search = useCallback(() => {
    setApplied({ ...draft })
    fetchData(draft, masterTypes)
  }, [draft, masterTypes, fetchData])

  const setPreset = useCallback((key: PresetKey) => {
    const range = presetRange(key)
    setDraft((prev) => ({ ...prev, ...range, preset: key }))
  }, [])

  const setFrom = useCallback((v: string) => setDraft((p) => ({ ...p, from: v, preset: null })), [])
  const setTo = useCallback((v: string) => setDraft((p) => ({ ...p, to: v, preset: null })), [])
  const setGroup = useCallback((v: string) => setDraft((p) => ({ ...p, group: v })), [])

  // Type toggle logic
  const toggleType = useCallback((code: string) => {
    setDraft((prev) => {
      const isAll = prev.types.length === 0
      if (code === 'all') return { ...prev, types: [] }
      if (isAll) return { ...prev, types: [code] }
      const has = prev.types.includes(code)
      let next: string[]
      if (has) {
        next = prev.types.filter((c) => c !== code)
        if (next.length === 0) return { ...prev, types: [] } // back to all
      } else {
        next = [...prev.types, code].sort((a, b) => {
          const ai = masterTypes.indexOf(a), bi = masterTypes.indexOf(b)
          return ai - bi
        })
      }
      return { ...prev, types: next }
    })
  }, [masterTypes])

  const jumpTo30Days = useCallback(() => {
    const range = presetRange('30d')
    const f: FilterDraft = { ...range, preset: '30d', types: [], group: 'all' }
    setDraft(f); setApplied(f); fetchData(f, masterTypes)
  }, [masterTypes, fetchData])

  // Dirty check
  const isDirty = useMemo(() =>
    draft.from !== applied.from || draft.to !== applied.to ||
    draft.group !== applied.group || !arrEq(draft.types, applied.types),
  [draft, applied])

  const validationError = useMemo(() => validateFilters(draft), [draft])

  // Effective types label for display
  const effectiveTypesLabel = useMemo(() => {
    if (draft.types.length === 0) return 'ทุกชนิด'
    return draft.types.join(', ')
  }, [draft.types])

  return {
    masterTypes, draft, applied, data, loading, toast, setToast,
    isDirty, validationError, effectiveTypesLabel,
    search, setPreset, setFrom, setTo, setGroup, toggleType, jumpTo30Days,
  }
}
