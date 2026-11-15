// backend/src/lib/extReport.ts
// รายงานรับเลือดจากภายนอก — validate query (zod) + SQL รวม (parameterized ผ่าน Prisma.sql เท่านั้น)

import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from './prisma'

/* ----------------------------------------------------------
   Date helpers (YYYY-MM-DD, คำนวณแบบ UTC — received_date เป็น DATE ไม่มี timezone)
---------------------------------------------------------- */
const DAY_MS = 24 * 60 * 60 * 1000
const MAX_RANGE_DAYS = 366
const AUTO_WEEK_MAX_DAYS = 62

const parseDay = (s: string): Date => new Date(`${s}T00:00:00.000Z`)
const fmtDay = (d: Date): string => d.toISOString().slice(0, 10)
const addDays = (s: string, n: number): string => fmtDay(new Date(parseDay(s).getTime() + n * DAY_MS))
const diffDays = (from: string, to: string): number =>
  Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / DAY_MS)

const isRealDay = (s: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = parseDay(s)
  return !Number.isNaN(d.getTime()) && fmtDay(d) === s
}

/* ----------------------------------------------------------
   Query schema
---------------------------------------------------------- */
const dayString = z.string().refine(isRealDay, 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD')
const idString = z.string().trim().min(1).max(64)
// "+" ใน query string ที่ไม่ได้ encode จะถูกอ่านเป็นช่องว่าง — รับไว้ให้เป็น "+"
const rhValue = z.preprocess((v) => (v === ' ' ? '+' : v), z.enum(['+', '-']))
const boolValue = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1')

const reportQueryBase = z.object({
  from: dayString,
  to: dayString,
  sourceId: idString.optional(),
  productId: idString.optional(),
  abo: z.enum(['A', 'B', 'O', 'AB']).optional(),
  rh: rhValue.optional(),
  includePending: boolValue.optional().default(false),
  granularity: z.enum(['auto', 'week', 'month']).optional().default('auto'),
})

const checkRange = (v: { from: string; to: string }, ctx: z.RefinementCtx): void => {
  if (v.from > v.to) {
    ctx.addIssue({ code: 'custom', path: ['from'], message: 'วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด' })
    return
  }
  if (diffDays(v.from, v.to) + 1 > MAX_RANGE_DAYS) {
    ctx.addIssue({ code: 'custom', path: ['to'], message: `ช่วงวันที่ต้องไม่เกิน ${MAX_RANGE_DAYS} วัน` })
  }
}

export const reportQuerySchema = reportQueryBase.superRefine(checkRange)

export const reportRowsQuerySchema = reportQueryBase
  .extend({
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  })
  .superRefine(checkRange)

export type ReportQuery = z.infer<typeof reportQuerySchema>
export type ReportRowsQuery = z.infer<typeof reportRowsQuerySchema>

/* ----------------------------------------------------------
   Response types
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
  /** วันแรกของช่วง (YYYY-MM-DD) — สัปดาห์เริ่มวันจันทร์ */
  bucket: string
  bags: number
  volumeMl: number
  /** จำนวนถุงแยกตาม code ชนิดเลือด */
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

export interface ReceiptRow {
  id: string
  docNumber: string
  receivedDate: string
  sourceName: string
  productCode: string
  productName: string | null
  bloodGroup: string
  status: string
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
   SQL building blocks
---------------------------------------------------------- */
// สถานะที่นับในรายงาน — ไม่นับ DRAFT, REJECTED, CANCELLED
const COUNTED_STATUSES = ['APPROVED', 'EXPORTED']

type Filters = Pick<ReportQuery, 'sourceId' | 'productId' | 'abo' | 'rh' | 'includePending'>
type Dimension = 'source' | 'product' | 'abo'

/** COUNT/SUM ของ PostgreSQL กลับมาเป็น bigint → แปลงเป็น number ก่อนส่ง JSON */
const num = (v: bigint | number | null | undefined): number => (v == null ? 0 : Number(v))

/**
 * CTE กลาง: 1 แถว = 1 ถุง ของเอกสารที่อยู่ในช่วงวันที่ + สถานะที่นับ (+ Rh ถ้ากรอง)
 * blood_group เก็บรวม เช่น "A+", "AB-" → แยกเป็น abo / rh
 */
const baseCte = (from: string, to: string, f: Filters): Prisma.Sql => {
  const statuses = f.includePending ? [...COUNTED_STATUSES, 'PENDING'] : COUNTED_STATUSES
  const rhCond = f.rh ? Prisma.sql`AND right(d.blood_group, 1) = ${f.rh}` : Prisma.empty
  return Prisma.sql`
    base AS (
      SELECT
        d.id                AS doc_id,
        d.doc_number        AS doc_number,
        d.received_date     AS received_date,
        d.status::text      AS status,
        d.blood_group       AS blood_group,
        d.source_id         AS source_id,
        s.name              AS source_name,
        p.id                AS product_id,
        p.code              AS product_code,
        p.name              AS product_name,
        p.color             AS product_color,
        p.sort              AS product_sort,
        regexp_replace(d.blood_group, '[+-]$', '') AS abo,
        CASE WHEN right(d.blood_group, 1) IN ('+', '-') THEN right(d.blood_group, 1) END AS rh,
        COALESCE(b.volume_ml, p.default_volume_ml, 0) AS volume_ml
      FROM ext_documents d
      JOIN ext_bags b            ON b.document_id = d.id
      JOIN ext_sources s         ON s.id = d.source_id
      JOIN master_plasma_types p ON p.id = d.blood_product_id
      WHERE d.received_date BETWEEN ${from}::date AND ${to}::date
        AND d.status::text = ANY(${statuses})
        ${rhCond}
    )`
}

/**
 * เงื่อนไข cross-filter — `skip` = มิติของกราฟนั้นเอง
 * (เช่น โดนัทหมู่เลือดไม่กรอง abo เพื่อให้ยังเห็นทุกชิ้น แล้วให้ frontend ทำชิ้นที่ไม่ได้เลือกจางลง)
 */
const dimWhere = (f: Filters, skip?: Dimension): Prisma.Sql => {
  const conds: Prisma.Sql[] = []
  if (f.sourceId && skip !== 'source') conds.push(Prisma.sql`source_id = ${f.sourceId}`)
  if (f.productId && skip !== 'product') conds.push(Prisma.sql`product_id = ${f.productId}`)
  if (f.abo && skip !== 'abo') conds.push(Prisma.sql`abo = ${f.abo}`)
  return conds.length ? Prisma.sql`WHERE ${Prisma.join(conds, ' AND ')}` : Prisma.empty
}

interface KpiRow { bags: bigint; volume_ml: bigint | null; sources: bigint; receipts: bigint }

const queryKpi = async (from: string, to: string, f: Filters): Promise<ReportKpi> => {
  const rows = await prisma.$queryRaw<KpiRow[]>`
    WITH ${baseCte(from, to, f)}
    SELECT
      COUNT(*)                  AS bags,
      SUM(volume_ml)            AS volume_ml,
      COUNT(DISTINCT source_id) AS sources,
      COUNT(DISTINCT doc_id)    AS receipts
    FROM base
    ${dimWhere(f)}`
  const r = rows[0]
  return { bags: num(r?.bags), volumeMl: num(r?.volume_ml), sources: num(r?.sources), receipts: num(r?.receipts) }
}

/* ----------------------------------------------------------
   Trend buckets (เติมช่วงที่ไม่มีข้อมูลเป็น 0)
---------------------------------------------------------- */
const bucketStart = (day: string, g: Granularity): string => {
  if (g === 'month') return `${day.slice(0, 7)}-01`
  const dow = parseDay(day).getUTCDay() // 0 = อาทิตย์
  return addDays(day, -((dow + 6) % 7)) // ย้อนไปวันจันทร์ (ตรงกับ date_trunc('week'))
}

const nextBucket = (start: string, g: Granularity): string => {
  if (g === 'week') return addDays(start, 7)
  const d = parseDay(start)
  return fmtDay(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)))
}

const listBuckets = (from: string, to: string, g: Granularity): string[] => {
  const out: string[] = []
  for (let b = bucketStart(from, g); b <= to; b = nextBucket(b, g)) out.push(b)
  return out
}

/* ----------------------------------------------------------
   Endpoint 1: สรุปรายงาน
---------------------------------------------------------- */
interface TrendRow { bucket: string; product_code: string; bags: bigint; volume_ml: bigint | null }
interface GroupRow { abo: string; bags: bigint; volume_ml: bigint | null; rh_neg: bigint }
interface SourceRow {
  source_id: string; source_name: string; product_code: string
  receipts: bigint; bags: bigint; volume_ml: bigint | null
}
interface SourceReceiptRow { source_id: string; receipts: bigint }
interface ProductRow {
  product_id: string; code: string; name: string | null; color: string | null
  bags: bigint; volume_ml: bigint | null
}
interface MatrixRow { abo: string; product_code: string; bags: bigint }

export async function getReceiptsReport(q: ReportQuery): Promise<ReceiptsReport> {
  const { from, to } = q
  const days = diffDays(from, to) + 1
  const prevTo = addDays(from, -1)
  const prevFrom = addDays(from, -days)
  const granularity: Granularity =
    q.granularity === 'auto' ? (days <= AUTO_WEEK_MAX_DAYS ? 'week' : 'month') : q.granularity
  // unit ของ date_trunc มาจาก whitelist 2 ค่านี้เท่านั้น และส่งเป็น parameter
  const truncUnit: string = granularity

  const base = baseCte(from, to, q)

  const [kpi, prev, trendRows, groupRows, sourceRows, sourceReceipts, productRows, matrixRows] =
    await Promise.all([
      queryKpi(from, to, q),
      queryKpi(prevFrom, prevTo, q),

      prisma.$queryRaw<TrendRow[]>`
        WITH ${base}
        SELECT
          to_char(date_trunc(${truncUnit}, received_date::timestamp), 'YYYY-MM-DD') AS bucket,
          product_code,
          COUNT(*)       AS bags,
          SUM(volume_ml) AS volume_ml
        FROM base
        ${dimWhere(q)}
        GROUP BY 1, 2
        ORDER BY 1, 2`,

      prisma.$queryRaw<GroupRow[]>`
        WITH ${base}
        SELECT
          abo,
          COUNT(*)                          AS bags,
          SUM(volume_ml)                    AS volume_ml,
          COUNT(*) FILTER (WHERE rh = '-')  AS rh_neg
        FROM base
        ${dimWhere(q, 'abo')}
        GROUP BY abo
        ORDER BY COUNT(*) DESC, abo`,

      prisma.$queryRaw<SourceRow[]>`
        WITH ${base}
        SELECT
          source_id, source_name, product_code,
          COUNT(DISTINCT doc_id) AS receipts,
          COUNT(*)               AS bags,
          SUM(volume_ml)         AS volume_ml
        FROM base
        ${dimWhere(q, 'source')}
        GROUP BY source_id, source_name, product_code`,

      // ครั้งที่รับต่อแหล่ง (นับเอกสารไม่ซ้ำ — รวมจากแถวแยกชนิดไม่ได้ จึง query แยก)
      prisma.$queryRaw<SourceReceiptRow[]>`
        WITH ${base}
        SELECT source_id, COUNT(DISTINCT doc_id) AS receipts
        FROM base
        ${dimWhere(q, 'source')}
        GROUP BY source_id`,

      prisma.$queryRaw<ProductRow[]>`
        WITH ${base}
        SELECT
          product_id,
          product_code  AS code,
          product_name  AS name,
          product_color AS color,
          COUNT(*)       AS bags,
          SUM(volume_ml) AS volume_ml
        FROM base
        ${dimWhere(q, 'product')}
        GROUP BY product_id, product_code, product_name, product_color, product_sort
        ORDER BY COUNT(*) DESC, product_sort, product_code`,

      prisma.$queryRaw<MatrixRow[]>`
        WITH ${base}
        SELECT abo, product_code, COUNT(*) AS bags
        FROM base
        ${dimWhere(q)}
        GROUP BY abo, product_code
        ORDER BY abo, product_code`,
    ])

  // trend: เติม bucket ที่ไม่มีข้อมูลเป็น 0
  const trendMap = new Map<string, TrendBucket>(
    listBuckets(from, to, granularity).map((b) => [b, { bucket: b, bags: 0, volumeMl: 0, products: {} }]),
  )
  for (const r of trendRows) {
    const t = trendMap.get(r.bucket)
    if (!t) continue
    t.bags += num(r.bags)
    t.volumeMl += num(r.volume_ml)
    t.products[r.product_code] = num(r.bags)
  }

  // bySource: รวมแถวแยกชนิดเป็นแหล่งละ 1 รายการ เรียงมาก → น้อย
  const receiptsBySource = new Map(sourceReceipts.map((r) => [r.source_id, num(r.receipts)]))
  const sourceMap = new Map<string, SourceItem>()
  for (const r of sourceRows) {
    let s = sourceMap.get(r.source_id)
    if (!s) {
      s = {
        sourceId: r.source_id,
        sourceName: r.source_name,
        receipts: receiptsBySource.get(r.source_id) ?? 0,
        bags: 0,
        volumeMl: 0,
        products: {},
      }
      sourceMap.set(r.source_id, s)
    }
    s.bags += num(r.bags)
    s.volumeMl += num(r.volume_ml)
    s.products[r.product_code] = num(r.bags)
  }
  const bySource = [...sourceMap.values()].sort(
    (a, b) => b.bags - a.bags || a.sourceName.localeCompare(b.sourceName, 'th'),
  )

  return {
    range: { from, to, days, prevFrom, prevTo, granularity, includePending: q.includePending },
    kpi,
    prev,
    trend: [...trendMap.values()],
    byGroup: groupRows.map((r) => ({
      abo: r.abo, bags: num(r.bags), volumeMl: num(r.volume_ml), rhNegBags: num(r.rh_neg),
    })),
    bySource,
    byProduct: productRows.map((r) => ({
      productId: r.product_id, code: r.code, name: r.name, color: r.color,
      bags: num(r.bags), volumeMl: num(r.volume_ml),
    })),
    matrix: matrixRows.map((r) => ({ abo: r.abo, productCode: r.product_code, bags: num(r.bags) })),
  }
}

/* ----------------------------------------------------------
   Endpoint 2: รายการ (1 แถว = 1 เอกสาร) + ผลรวมทุกหน้า
---------------------------------------------------------- */
interface DocRow {
  id: string; doc_number: string; received_date: string; source_name: string
  product_code: string; product_name: string | null; blood_group: string; status: string
  bags: bigint; volume_ml: bigint | null
}
interface DocSumRow { total: bigint; bags: bigint | null; volume_ml: bigint | null }

export async function getReceiptRows(q: ReportRowsQuery): Promise<ReceiptRowsResult> {
  const { from, to, page, pageSize } = q
  const offset = (page - 1) * pageSize

  const docsCte = Prisma.sql`
    ${baseCte(from, to, q)},
    docs AS (
      SELECT
        doc_id, doc_number, received_date, source_name,
        product_code, product_name, blood_group, status,
        COUNT(*)       AS bags,
        SUM(volume_ml) AS volume_ml
      FROM base
      ${dimWhere(q)}
      GROUP BY doc_id, doc_number, received_date, source_name,
               product_code, product_name, blood_group, status
    )`

  const [rows, sums] = await Promise.all([
    prisma.$queryRaw<DocRow[]>`
      WITH ${docsCte}
      SELECT
        doc_id AS id, doc_number,
        to_char(received_date, 'YYYY-MM-DD') AS received_date,
        source_name, product_code, product_name, blood_group, status, bags, volume_ml
      FROM docs
      ORDER BY docs.received_date DESC, doc_number DESC
      LIMIT ${pageSize} OFFSET ${offset}`,
    prisma.$queryRaw<DocSumRow[]>`
      WITH ${docsCte}
      SELECT COUNT(*) AS total, SUM(bags)::bigint AS bags, SUM(volume_ml)::bigint AS volume_ml
      FROM docs`,
  ])

  const s = sums[0]
  return {
    rows: rows.map((r) => ({
      id: r.id,
      docNumber: r.doc_number,
      receivedDate: r.received_date,
      sourceName: r.source_name,
      productCode: r.product_code,
      productName: r.product_name,
      bloodGroup: r.blood_group,
      status: r.status,
      bags: num(r.bags),
      volumeMl: num(r.volume_ml),
    })),
    total: num(s?.total),
    page,
    pageSize,
    sum: { bags: num(s?.bags), volumeMl: num(s?.volume_ml) },
  }
}
