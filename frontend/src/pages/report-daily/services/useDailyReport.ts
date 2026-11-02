// frontend/src/pages/report-daily/services/useDailyReport.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dailyReportService from './DailyReportService'
import type { MovementResponse, FilterDraft, PresetKey } from './DailyReportType'
import type { ToastState } from '../../../components/common/Toast'

// ── Date helpers ──
const bkkToday = (): string => {
  const d = new Date()
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
}

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
    case 'today':
      return { from: today, to: today }
    case '7d':
      return { from: addDays(today, -6), to: today }
    case '30d':
      return { from: addDays(today, -29), to: today }
    case 'this-month':
      return { from: `${y}-${String(m).padStart(2, '0')}-01`, to: today }
    case 'last-month': {
      const pm = m === 1 ? 12 : m - 1
      const py = m === 1 ? y - 1 : y
      const lastDay = new Date(py, pm, 0).getDate()
      return {
        from: `${py}-${String(pm).padStart(2, '0')}-01`,
        to: `${py}-${String(pm).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
      }
    }
    case 'this-year':
      return { from: `${y}-01-01`, to: today }
    case 'last-year':
      return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31` }
  }
}

// ── Validation ──
export interface ValidationError {
  field: 'to' | 'from'
  message: string
}

export const validateFilters = (draft: FilterDraft): ValidationError | null => {
  if (!draft.from || !draft.to) return null
  const from = new Date(`${draft.from}T00:00:00+07:00`)
  const to = new Date(`${draft.to}T00:00:00+07:00`)
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null

  if (to < from) return { field: 'to', message: 'วันสิ้นสุดต้องไม่ก่อนวันเริ่ม' }

  const today = new Date(`${bkkToday()}T00:00:00+07:00`)
  if (to > today) return { field: 'to', message: 'วันสิ้นสุดต้องไม่เกินวันนี้' }

  const days = diffDays(draft.from, draft.to)
  if (days > 366) return { field: 'to', message: 'เลือกช่วงได้ไม่เกิน 1 ปี — ลองแบ่งดูทีละช่วง' }

  return null
}

// ── Session storage ──
const STORAGE_KEY = 'plasm-daily-range'

const loadSession = (): Partial<FilterDraft> | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const saveSession = (d: FilterDraft) => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ from: d.from, to: d.to, preset: d.preset }),
    )
  } catch { /* ignore */ }
}

// ── Initial default ──
const defaultDraft = (): FilterDraft => {
  const saved = loadSession()
  if (saved?.from && saved?.to) {
    return {
      from: saved.from,
      to: saved.to,
      preset: (saved.preset as PresetKey) ?? null,
      type: 'all',
      group: 'all',
    }
  }
  const range = presetRange('7d')
  return { ...range, preset: '7d', type: 'all', group: 'all' }
}

// ── Hook ──
export default function useDailyReport() {
  const [draft, setDraft] = useState<FilterDraft>(defaultDraft)
  const [applied, setApplied] = useState<FilterDraft>(defaultDraft)
  const [data, setData] = useState<MovementResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const initialFetch = useRef(false)

  // ── Fetch ──
  const fetchData = useCallback(async (filters: FilterDraft) => {
    setLoading(true)
    setToast(null)
    try {
      const params: Record<string, string> = {
        from: filters.from,
        to: filters.to,
      }
      if (filters.type !== 'all') params.type = filters.type
      if (filters.group !== 'all') params.group = filters.group
      const res = await dailyReportService.getMovements(params)
      setData(res)
      saveSession(filters)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      setToast({ type: 'error', msg })
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Auto-fetch on mount ──
  useEffect(() => {
    if (!initialFetch.current) {
      initialFetch.current = true
      fetchData(applied)
    }
  }, [applied, fetchData])

  // ── Actions ──
  const search = useCallback(() => {
    setApplied({ ...draft })
    fetchData(draft)
  }, [draft, fetchData])

  const setPreset = useCallback((key: PresetKey) => {
    const range = presetRange(key)
    setDraft((prev) => ({ ...prev, ...range, preset: key }))
  }, [])

  const setFrom = useCallback((v: string) => {
    setDraft((prev) => ({ ...prev, from: v, preset: null }))
  }, [])

  const setTo = useCallback((v: string) => {
    setDraft((prev) => ({ ...prev, to: v, preset: null }))
  }, [])

  const setType = useCallback((v: string) => {
    setDraft((prev) => ({ ...prev, type: v }))
  }, [])

  const setGroup = useCallback((v: string) => {
    setDraft((prev) => ({ ...prev, group: v }))
  }, [])

  const jumpTo30Days = useCallback(() => {
    const range = presetRange('30d')
    const newFilter: FilterDraft = { ...range, preset: '30d', type: 'all', group: 'all' }
    setDraft(newFilter)
    setApplied(newFilter)
    fetchData(newFilter)
  }, [fetchData])

  // ── Dirty check ──
  const isDirty = useMemo(
    () =>
      draft.from !== applied.from ||
      draft.to !== applied.to ||
      draft.type !== applied.type ||
      draft.group !== applied.group,
    [draft, applied],
  )

  const validationError = useMemo(() => validateFilters(draft), [draft])

  return {
    draft,
    applied,
    data,
    loading,
    toast,
    setToast,
    isDirty,
    validationError,
    search,
    setPreset,
    setFrom,
    setTo,
    setType,
    setGroup,
    jumpTo30Days,
  }
}
