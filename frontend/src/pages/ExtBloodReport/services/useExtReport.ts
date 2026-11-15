// frontend/src/pages/ExtBloodReport/services/useExtReport.ts
//
// state + logic ทั้งหมดของหน้ารายงานรับเลือดจากภายนอก
//  - ตัวกรองทั้งหมดเก็บใน URL query (แชร์ลิงก์ได้)
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

  // spKey เป็นตัวแทนของ searchParams — ใช้เป็น dependency เพื่อให้ filters คงที่เมื่อ URL ไม่เปลี่ยน
  const filters = useMemo(() => parseFilters(new URLSearchParams(spKey)), [spKey])
  const rawTab = searchParams.get('tab') as ReportTab | null
  const tab: ReportTab = rawTab && TABS.includes(rawTab) ? rawTab : 'source'
  const page = Math.max(1, Math.floor(Number(searchParams.get('page')) || 1))

  const rangeError = useMemo(() => validateRange(filters.from, filters.to), [filters.from, filters.to])
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
    if (rangeError) {
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
  }, [queryKey, rangeError, reload])

  /* ── รายการทั้งหมด (โหลดเมื่อเปิดแท็บ) ── */
  useEffect(() => {
    if (tab !== 'rows' || rangeError) return
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
  }, [tab, queryKey, page, rangeError, reload])

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

  const setPreset = useCallback(
    (preset: RangePreset) => {
      update((p) => {
        if (preset === DEFAULT_PRESET) p.delete('range')
        else p.set('range', preset)
        if (preset === 'custom') {
          // เริ่มจากช่วงที่แสดงอยู่ เพื่อให้ผู้ใช้ปรับต่อได้ทันที
          if (!p.get('from')) p.set('from', filters.from)
          if (!p.get('to')) p.set('to', filters.to)
        } else {
          p.delete('from')
          p.delete('to')
        }
      })
    },
    [update, filters.from, filters.to],
  )

  const setCustomDate = useCallback(
    (key: 'from' | 'to', iso: string) => {
      update((p) => {
        p.set('range', 'custom')
        if (iso) p.set(key, iso)
        else p.delete(key)
      })
    },
    [update],
  )

  const setDim = useCallback(
    (key: DimKey, value: string | undefined) => {
      update((p) => {
        if (value) p.set(key, value)
        else p.delete(key)
      })
    },
    [update],
  )

  /** คลิกกราฟ: เลือกค่าเดิมซ้ำ = ยกเลิกตัวกรองนั้น */
  const toggleDim = useCallback(
    (key: DimKey, value: string) => setDim(key, filters[key] === value ? undefined : value),
    [setDim, filters],
  )

  const setIncludePending = useCallback(
    (on: boolean) => update((p) => (on ? p.set('pending', '1') : p.delete('pending'))),
    [update],
  )

  /** ล้างตัวกรอง (คงช่วงวันที่และแท็บ) */
  const clearDims = useCallback(
    () => update((p) => ['sourceId', 'productId', 'abo', 'pending'].forEach((k) => p.delete(k))),
    [update],
  )

  /** ล้างทุกอย่างกลับค่าเริ่มต้น (รวมช่วงวันที่) */
  const resetAll = useCallback(
    () => update((p) => ['range', 'from', 'to', 'sourceId', 'productId', 'abo', 'pending'].forEach((k) => p.delete(k))),
    [update],
  )

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

  const hasDimFilter =
    !!filters.sourceId || !!filters.productId || !!filters.abo || filters.includePending
  const isEmpty = !!report && report.kpi.bags === 0

  return {
    filters, tab, page, rangeError,
    report, loading: fetching && !report, fetching, error, isEmpty,
    rows, rowsFetching, rowsError,
    sources, products, productColors, productCodes, hasDimFilter,
    setPreset, setCustomDate, setDim, toggleDim, setIncludePending,
    clearDims, resetAll, setTab, setPage, retry,
  }
}

export type ExtReportState = ReturnType<typeof useExtReport>
