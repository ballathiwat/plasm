// frontend/src/pages/ExtBloodReport/services/ReportType.ts
//
// types ของหน้ารายงานรับเลือดจากภายนอก
// response ตรงกับ backend/src/lib/extReport.ts

import type { ExtDocStatus } from '../../ExtBlood/services/ExtBloodType'

/* ----------------------------------------------------------
   Filters (เก็บใน URL query)
---------------------------------------------------------- */
export type RangePreset = 'month' | '3m' | '6m' | 'fy' | 'custom'
export type Abo = 'A' | 'B' | 'O' | 'AB'
export type Rh = '+' | '-'
export type ReportTab = 'source' | 'matrix' | 'rows'
export type DimKey = 'sourceId' | 'productId' | 'abo' | 'rh'

export interface ReportFilters {
  preset: RangePreset
  /** YYYY-MM-DD */
  from: string
  to: string
  sourceId?: string
  productId?: string
  abo?: Abo
  rh?: Rh
  includePending: boolean
}

/** query ที่ส่งให้ API */
export interface ReportQuery {
  [key: string]: string | number | undefined
  from: string
  to: string
  sourceId?: string
  productId?: string
  abo?: string
  rh?: string
  includePending?: string
}

/* ----------------------------------------------------------
   GET /ext/reports/receipts
---------------------------------------------------------- */
export type Granularity = 'week' | 'month'

export interface ReportKpi {
  bags: number
  volumeMl: number
  sources: number
  receipts: number
}

export interface ReportRange {
  from: string
  to: string
  days: number
  prevFrom: string
  prevTo: string
  granularity: Granularity
  includePending: boolean
}

export interface TrendBucket {
  /** วันแรกของช่วง (YYYY-MM-DD) */
  bucket: string
  bags: number
  volumeMl: number
  products: Record<string, number>
}

export interface GroupItem {
  abo: string
  bags: number
  volumeMl: number
  rhNegBags: number
}

export interface SourceItem {
  sourceId: string
  sourceName: string
  receipts: number
  bags: number
  volumeMl: number
  products: Record<string, number>
}

export interface ProductItem {
  productId: string
  code: string
  name: string | null
  color: string | null
  bags: number
  volumeMl: number
}

export interface MatrixCell {
  abo: string
  productCode: string
  bags: number
}

export interface ReceiptsReport {
  range: ReportRange
  kpi: ReportKpi
  prev: ReportKpi
  trend: TrendBucket[]
  byGroup: GroupItem[]
  bySource: SourceItem[]
  byProduct: ProductItem[]
  matrix: MatrixCell[]
}

/* ----------------------------------------------------------
   GET /ext/reports/receipts/rows
---------------------------------------------------------- */
export interface ReceiptRow {
  id: string
  docNumber: string
  receivedDate: string
  sourceName: string
  productCode: string
  productName: string | null
  bloodGroup: string
  status: ExtDocStatus
  bags: number
  volumeMl: number
}

export interface ReceiptRowsResult {
  rows: ReceiptRow[]
  total: number
  page: number
  pageSize: number
  sum: { bags: number; volumeMl: number }
}

/* ----------------------------------------------------------
   UI helpers
---------------------------------------------------------- */
export interface FilterOption {
  id: string
  label: string
}

/** สีของชนิดเลือดแต่ละ code (hex จาก master หรือค่า fallback) */
export type ProductColorMap = Record<string, string>
