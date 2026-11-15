// frontend/src/pages/ExtBloodReport/services/useExtReport.ts
//
// state + logic ทั้งหมดของหน้ารายงานรับเลือดจากภายนอก
//  - ตัวกรองแบบ "กรอกก่อน แล้วกดค้นหา": draft = ค่าที่กำลังเลือกในแผง · filters = ค่าที่ใช้ดึง API
//  - filters เก็บใน URL query (แชร์ลิงก์ได้) — draft ไม่ลง URL
//  - cache ผลลัพธ์ตาม query 60 วินาที และคงข้อมูลเดิมไว้ระหว่างโหลดชุดใหม่

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import reportService from './ReportService'
import { buildProductColors, presetRange, validateRange } from './reportHelpers'
import type {
  DimKey, FilterOption, ProductColorMap, RangePreset, ReceiptRowsResult,
  ReceiptsReport, ReportFilters, ReportQuery, ReportTab,
} from './ReportType'

export const ROWS_PAGE_SIZE = 10
const DEFAULT_PRESET: RangePreset = '6m'
const PRESETS: RangePreset[] = ['month', '3m', '6m', 'fy', 'custom']
const TABS: ReportTab[] = ['source', 'matrix', 'rows']

/* ----------------------------------------------------------
   Cache (อายุ 60 วินาที)
---------------------------------------------------------- */
const STALE_MS = 60_000
const CACHE_LIMIT = 40
const cache = new Map<string, { at: number; data: unknown }>()

async function loadCached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < STALE_MS) return hit.data as T
  const data = await loader()
  cache.delete(key)
  cache.set(key, { at: Date.now(), data })
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  return data
}

const errorMessage = (e: unknown): string => {
  const msg = (e as { message?: unknown } | null)?.message
  return typeof msg === 'string' && msg ? msg : 'โหลดรายงานไม่สำเร็จ'
}

/* ----------------------------------------------------------
   URL query ↔ filters
   range=month|3m|6m|fy|custom · from,to (เฉพาะ custom) · sourceId · productId
   abo=<code หมู่เลือดจาก master เช่น A, A-> · pending=1 · tab=source|matrix|rows · page
---------------------------------------------------------- */
const parseFilters = (sp: URLSearchParams): ReportFilters => {
  const rawPreset = sp.get('range') as RangePreset | null
  const preset = rawPreset && PRESETS.includes(rawPreset) ? rawPreset : DEFAULT_PRESET
  const range =
    preset === 'custom'
      ? { from: sp.get('from') ?? '', to: sp.get('to') ?? '' }
      : presetRange(preset)
  return {
    preset,
    ...range,
    sourceId: sp.get('sourceId') || undefined,
    productId: sp.get('productId') || undefined,
    abo: sp.get('abo')?.trim() || undefined,
    includePending: sp.get('pending') === '1',
  }
}

/** เขียน filters ลง URL (ค่าเริ่มต้นไม่ต้องมีใน URL) */
const writeFilters = (p: URLSearchParams, f: ReportFilters): void => {
  const put = (key: string, value: string | undefined) => (value ? p.set(key, value) : p.delete(key))
  put('range', f.preset === DEFAULT_PRESET ? undefined : f.preset)
  put('from', f.preset === 'custom' ? f.from : undefined)
  put('to', f.preset === 'custom' ? f.to : undefined)
  put('sourceId', f.sourceId)
  put('productId', f.productId)
  put('abo', f.abo)
  put('pending', f.includePending ? '1' : undefined)
}

const defaultFilters = (): ReportFilters => ({
  preset: DEFAULT_PRESET,
  ...presetRange(DEFAULT_PRESET),
  includePending: false,
})

/**
 * รวม patch เข้ากับค่าเดิม
 *  - เปลี่ยน preset (ไม่ใช่กำหนดเอง) → คำนวณ from/to ใหม่ · เลือก "กำหนดเอง" → เริ่มจากช่วงที่แสดงอยู่
 *  - แก้ from/to ตรง ๆ → เป็นช่วงกำหนดเอง
 */
const mergeFilters = (base: ReportFilters, patch: Partial<ReportFilters>): ReportFilters => {
  const next: ReportFilters = { ...base, ...patch }
  // patch ส่ง includePending: undefined (ลบ chip) = ปิด
  next.includePending = 'includePending' in patch ? !!patch.includePending : base.includePending
  if (patch.preset && patch.preset !== 'custom') Object.assign(next, presetRange(patch.preset))
  else if (patch.from !== undefined || patch.to !== undefined) next.preset = 'custom'
  return next
}

const isDefault = (f: ReportFilters): boolean =>
  f.preset === DEFAULT_PRESET && !f.sourceId && !f.productId && !f.abo && !f.includePending

const sameFilters = (a: ReportFilters, b: ReportFilters): boolean =>
  a.preset === b.preset &&
  // preset สำเร็จรูปคำนวณ from/to จากวันนี้เสมอ — เทียบวันที่เฉพาะช่วงกำหนดเอง
  (a.preset !== 'custom' || (a.from === b.from && a.to === b.to)) &&
  a.sourceId === b.sourceId &&
  a.productId === b.productId &&
  a.abo === b.abo &&
  a.includePending === b.includePending

const toQuery = (f: ReportFilters): ReportQuery => ({
  from: f.from,
  to: f.to,
  sourceId: f.sourceId,
  productId: f.productId,
  abo: f.abo,
  includePending: f.includePending ? 'true' : undefined,
})

/* ----------------------------------------------------------
   Hook
---------------------------------------------------------- */
export default function useExtReport() {
  const [searchParams, setSearchParams] = useSearchParams()
  const spKey = searchParams.toString()

  // filters = ค่าที่ค้นหาแล้ว (อ่านจาก URL) — เปลี่ยนเมื่อ search / applyNow / resetAll เท่านั้น
  // spKey เป็นตัวแทนของ searchParams — ใช้เป็น dependency เพื่อให้ filters คงที่เมื่อ URL ไม่เปลี่ยน
  const filters = useMemo(() => parseFilters(new URLSearchParams(spKey)), [spKey])
  // draft = ค่าที่กำลังเลือกในแผงตัวกรอง — ไม่ยิง API และไม่ลง URL
  const [draft, setDraftState] = useState<ReportFilters>(filters)
  // ข้อความ error ของช่วงวันที่ใน draft (ขึ้นตอนกดค้นหา)
  const [draftError, setDraftError] = useState<string | null>(null)
  const rawTab = searchParams.get('tab') as ReportTab | null
  const tab: ReportTab = rawTab && TABS.includes(rawTab) ? rawTab : 'source'
  const page = Math.max(1, Math.floor(Number(searchParams.get('page')) || 1))

  // ช่วงวันที่ของ filters ไม่ถูกต้อง (เช่น แก้ URL เอง) → ไม่ดึงข้อมูล
  const filtersError = useMemo(() => validateRange(filters.from, filters.to), [filters.from, filters.to])
  const rangeError = draftError ?? filtersError
  const query = useMemo(() => toQuery(filters), [filters])
  const queryKey = JSON.stringify(query)

  const [report, setReport] = useState<ReceiptsReport | null>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<ReceiptRowsResult | null>(null)
  const [rowsFetching, setRowsFetching] = useState(false)
  const [rowsError, setRowsError] = useState<string | null>(null)
  const [sources, setSources] = useState<FilterOption[]>([])
  const [products, setProducts] = useState<(FilterOption & { code: string; color?: string | null })[]>([])
  const [reload, setReload] = useState(0)

  /* ── master data ของ dropdown (รวมรายการที่ปิดใช้งาน เพราะเอกสารเก่ายังอ้างอิง) ── */
  useEffect(() => {
    let alive = true
    Promise.all([reportService.getSources(), reportService.getProducts()])
      .then(([s, p]) => {
        if (!alive) return
        setSources(s.map((x) => ({ id: x.id, label: x.name })))
        setProducts(
          p.map((x) => ({
            id: x.id,
            code: x.code,
            color: x.color,
            label: x.name ? `${x.code} — ${x.name}` : x.code,
          })),
        )
      })
      .catch((e: unknown) => {
        // dropdown ว่าง แต่รายงานยังใช้ได้ — แจ้งให้ผู้ใช้ทราบ
        if (alive) setError(`โหลดตัวเลือกตัวกรองไม่สำเร็จ: ${errorMessage(e)}`)
      })
    return () => {
      alive = false
    }
  }, [])

  /* ── รายงานสรุป ── */
  useEffect(() => {
    if (filtersError) {
      setFetching(false)
      return
    }
    let alive = true
    setFetching(true)
    setError(null)
    loadCached(`report:${queryKey}`, () => reportService.getReceipts(JSON.parse(queryKey) as ReportQuery))
      .then((data) => {
        if (alive) setReport(data)
      })
      .catch((e: unknown) => {
        if (alive) setError(errorMessage(e))
      })
      .finally(() => {
        if (alive) setFetching(false)
      })
    return () => {
      alive = false
    }
  }, [queryKey, filtersError, reload])

  /* ── รายการทั้งหมด (โหลดเมื่อเปิดแท็บ) ── */
  useEffect(() => {
    if (tab !== 'rows' || filtersError) return
    let alive = true
    setRowsFetching(true)
    setRowsError(null)
    loadCached(
      `rows:${queryKey}:${page}`,
      () => reportService.getReceiptRows(JSON.parse(queryKey) as ReportQuery, page, ROWS_PAGE_SIZE),
    )
      .then((data) => {
        if (alive) setRows(data)
      })
      .catch((e: unknown) => {
        if (alive) setRowsError(errorMessage(e))
      })
      .finally(() => {
        if (alive) setRowsFetching(false)
      })
    return () => {
      alive = false
    }
  }, [tab, queryKey, page, filtersError, reload])

  /* ── เขียน URL ── */
  const update = useCallback(
    (mutate: (p: URLSearchParams) => void, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          mutate(next)
          if (resetPage) next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  /** แก้ค่าในแผงตัวกรอง — ยังไม่ดึงข้อมูลจนกว่าจะกดค้นหา */
  const setDraft = useCallback((patch: Partial<ReportFilters>) => {
    setDraftState((d) => mergeFilters(d, patch))
    if ('preset' in patch || 'from' in patch || 'to' in patch) setDraftError(null)
  }, [])

  /** ค้นหา: filters = draft แล้วกลับไปหน้าแรกของตาราง (ช่วงวันที่ไม่ถูกต้อง → แสดง error และไม่ค้นหา) */
  const search = useCallback(() => {
    const err = validateRange(draft.from, draft.to)
    setDraftError(err)
    if (err) return
    update((p) => writeFilters(p, draft))
  }, [update, draft])

  /** กรองทันที (คลิกกราฟ / ปุ่ม x บน chip): อัปเดตทั้ง filters และ draft */
  const applyNow = useCallback(
    (patch: Partial<ReportFilters>) => {
      setDraftState((d) => mergeFilters(d, patch))
      update((p) => writeFilters(p, mergeFilters(filters, patch)))
    },
    [update, filters],
  )

  /** คลิกกราฟ: เลือกค่าเดิมซ้ำ = ยกเลิกตัวกรองนั้น */
  const toggleDim = useCallback(
    (key: DimKey, value: string) => applyNow({ [key]: filters[key] === value ? undefined : value }),
    [applyNow, filters],
  )

  /** ล้างทุกอย่างกลับค่าเริ่มต้น (รวมช่วงวันที่) ทั้ง draft และ filters */
  const resetAll = useCallback(() => {
    const init = defaultFilters()
    setDraftState(init)
    setDraftError(null)
    update((p) => writeFilters(p, init))
  }, [update])

  const setTab = useCallback(
    (t: ReportTab) => update((p) => (t === 'source' ? p.delete('tab') : p.set('tab', t))),
    [update],
  )

  const setPage = useCallback(
    (n: number) => update((p) => (n <= 1 ? p.delete('page') : p.set('page', String(n))), false),
    [update],
  )

  /** โหลดใหม่โดยไม่ใช้ cache */
  const retry = useCallback(() => {
    cache.clear()
    setReload((n) => n + 1)
  }, [])

  /* ── ค่าที่คำนวณจากข้อมูล ── */
  // ลำดับ/สีของชนิดเลือดในกราฟ: ตามจำนวนถุง (byProduct) แล้วตามด้วย master
  const productColors: ProductColorMap = useMemo(
    () => buildProductColors([...(report?.byProduct ?? []), ...products]),
    [report, products],
  )
  const productCodes = useMemo(() => (report?.byProduct ?? []).map((p) => p.code), [report])

  const isDirty = !sameFilters(draft, filters)
  const isNonDefault = !isDefault(filters) || !isDefault(draft)
  const isEmpty = !!report && report.kpi.bags === 0

  return {
    filters, draft, tab, page, rangeError,
    /** ช่วงวันที่ของ filters ใช้ไม่ได้ → ไม่มีข้อมูลให้แสดง */
    blocked: !!filtersError,
    isDirty, isNonDefault,
    report, loading: fetching && !report, fetching, error, isEmpty,
    rows, rowsFetching, rowsError,
    sources, products, productColors, productCodes,
    setDraft, search, applyNow, toggleDim, resetAll,
    setTab, setPage, retry,
  }
}

export type ExtReportState = ReturnType<typeof useExtReport>
