// src/lib/minStock.ts
// สต็อกขั้นต่ำแยกตาม ชนิดเลือด × หมู่เลือด — กติกาและการคำนวณสถานะ "ชุดเดียว"
// ใช้ร่วมกันโดย GET /stock/min-stock/status (แดชบอร์ด + กระดิ่ง) และ GET /notifications
// frontend มี helper คู่กันที่ frontend/src/helpers/minStock.ts — แก้เกณฑ์ต้องแก้ทั้งสองไฟล์

import type { Prisma, StockAlertStatus } from '@prisma/client'
import { prisma } from './prisma'

export type MinStatus = 'danger' | 'warning' | 'normal' | 'none'

/** ต่ำกว่าขั้นต่ำ = danger · 100–120% = warning · มากกว่า 120% = normal · ไม่ได้ตั้งค่า = none */
export const minStatus = (stock: number, min: number | null): MinStatus =>
  min == null ? 'none' : stock < min ? 'danger' : stock <= min * 1.2 ? 'warning' : 'normal'

/** % ของขั้นต่ำสำหรับแสดงผล — ปัดให้ไม่ขัดกับสถานะ (299/300 ไม่แสดงเป็น 100%, 361/300 ไม่แสดงเป็น 120%) */
export const pctLabel = (pct: number | null): string => {
  if (pct == null) return '—'
  const r = Math.round(pct * 100)
  return `${pct < 1 ? Math.min(r, 99) : pct > 1.2 ? Math.max(r, 121) : r}%`
}

export const cellKey = (type: string, group: string) => `${type}|${group}`

export interface MasterRef { id: string; code: string; name: string | null }

export interface MinStockStatusItem {
  type: string
  group: string
  stock: number
  minUnits: number | null
  status: MinStatus
  /** stock / minUnits (1 = 100%) — null เมื่อไม่ได้ตั้งค่าหรือขั้นต่ำเป็น 0 */
  pct: number | null
  /** จำนวนที่ขาดจากขั้นต่ำ (0 เมื่อไม่ขาด) */
  gap: number
  /** ถุงที่หมดอายุภายใน 7 วัน — ยังไม่มีข้อมูลวันหมดอายุของ unit ในระบบ จึงเป็น [] เสมอ */
  expiringSoon: { unitNumber: string; expiresAt: string }[]
  /** เวลาที่เข้าสู่สถานะปัจจุบัน — มีค่าเฉพาะ danger / warning */
  since: string | null
  /** id ของการแจ้งเตือน (ใช้กับ POST /notifications/:id/ack) — มีค่าเฉพาะ danger / warning */
  notificationId: string | null
  acknowledged: boolean
  acknowledgedBy: string | null
  acknowledgedAt: string | null
}

export interface MinStockStatus {
  types: { code: string; name: string | null }[]
  groups: string[]
  items: MinStockStatusItem[]
  /** unit คงเหลือทั้งระบบ (รวมชนิด/หมู่ที่ปิดใช้งานแล้วแต่ยังมีสต็อก) */
  totalStock: number
  /** มีค่าขั้นต่ำอย่างน้อย 1 คู่ */
  configured: boolean
}

export const NOTI_PREFIX = 'stock:'

/** ชนิด/หมู่เลือดที่ active เรียงตาม master */
export async function loadActiveMasters(db: Prisma.TransactionClient = prisma) {
  const order = [{ sort: 'asc' as const }, { code: 'asc' as const }]
  const [types, groups] = await Promise.all([
    db.masterPlasmaType.findMany({ where: { active: true }, orderBy: order, select: { id: true, code: true, name: true } }),
    db.masterBloodType.findMany({ where: { active: true }, orderBy: order, select: { id: true, code: true, name: true } }),
  ])
  return { types, groups }
}

const ALERT_STATUS: Record<'danger' | 'warning', StockAlertStatus> = { danger: 'DANGER', warning: 'WARNING' }

/**
 * คำนวณสถานะทุกคู่ ชนิด × หมู่ (เฉพาะที่ active) และ sync ตาราง stock_alerts ให้ตรงกับสถานะล่าสุด
 *   - เข้าสู่ danger/warning หรือสลับระหว่างสองสถานะ → since = ตอนนี้, ล้างการรับทราบ
 *   - กลับเป็น normal/none (หรือชนิด/หมู่ถูกปิดใช้งาน) → ลบแถว
 * สถานะคำนวณตอนมีคนเรียก (กระดิ่ง poll ทุก 60 วินาที) — since จึงเป็นเวลาที่ระบบ "เห็น" การเปลี่ยนสถานะครั้งแรก
 */
export async function buildMinStockStatus(): Promise<MinStockStatus> {
  return prisma.$transaction(async (tx) => {
    const [{ types, groups }, minRows, stockRows] = await Promise.all([
      loadActiveMasters(tx),
      tx.minStock.findMany({ select: { plasmaTypeId: true, bloodTypeId: true, minUnits: true } }),
      tx.$queryRaw<{ plasma_type_id: string; blood_type_id: string; count: bigint }[]>`
        SELECT b.plasma_type_id, b.blood_type_id, COUNT(u.id) AS count
        FROM units u JOIN boxes b ON u.box_id = b.id
        WHERE u.status = 'STORED' AND b.status = 'STORED'
        GROUP BY b.plasma_type_id, b.blood_type_id`,
    ])

    const idKey = (t: string, g: string) => `${t}|${g}`
    const minMap = new Map(minRows.map((r) => [idKey(r.plasmaTypeId, r.bloodTypeId), r.minUnits]))
    const stockMap = new Map(stockRows.map((r) => [idKey(r.plasma_type_id, r.blood_type_id), Number(r.count)]))
    const totalStock = stockRows.reduce((s, r) => s + Number(r.count), 0)

    const pairs = types.flatMap((t) => groups.map((g) => {
      const k = idKey(t.id, g.id)
      const stock = stockMap.get(k) ?? 0
      const minUnits = minMap.get(k) ?? null
      return { t, g, k, stock, minUnits, status: minStatus(stock, minUnits) }
    }))

    // ── sync stock_alerts ──
    const now = new Date()
    const existing = await tx.stockAlert.findMany()
    const byKey = new Map(existing.map((a) => [idKey(a.plasmaTypeId, a.bloodTypeId), a]))
    const wanted = new Map<string, StockAlertStatus>()
    for (const p of pairs) if (p.status === 'danger' || p.status === 'warning') wanted.set(p.k, ALERT_STATUS[p.status])

    const stale = existing.filter((a) => !wanted.has(idKey(a.plasmaTypeId, a.bloodTypeId))).map((a) => a.id)
    if (stale.length) await tx.stockAlert.deleteMany({ where: { id: { in: stale } } })

    const toCreate: Prisma.StockAlertCreateManyInput[] = []
    for (const p of pairs) {
      const want = wanted.get(p.k)
      if (!want) continue
      const cur = byKey.get(p.k)
      if (!cur) toCreate.push({ plasmaTypeId: p.t.id, bloodTypeId: p.g.id, status: want, since: now })
      else if (cur.status !== want) {
        await tx.stockAlert.update({
          where: { id: cur.id },
          data: { status: want, since: now, acknowledgedAt: null, acknowledgedById: null },
        })
      }
    }
    // skipDuplicates — กันสองคำขอพร้อมกันสร้างแถวคู่เดียวกัน (unique plasma_type_id + blood_type_id)
    if (toCreate.length) await tx.stockAlert.createMany({ data: toCreate, skipDuplicates: true })

    const alerts = wanted.size
      ? await tx.stockAlert.findMany({ include: { acknowledgedBy: { select: { name: true } } } })
      : []
    const alertMap = new Map(alerts.map((a) => [idKey(a.plasmaTypeId, a.bloodTypeId), a]))

    const items: MinStockStatusItem[] = pairs.map((p) => {
      const a = wanted.has(p.k) ? alertMap.get(p.k) : undefined
      return {
        type: p.t.code,
        group: p.g.code,
        stock: p.stock,
        minUnits: p.minUnits,
        status: p.status,
        pct: p.minUnits != null && p.minUnits > 0 ? p.stock / p.minUnits : null,
        gap: p.minUnits != null ? Math.max(p.minUnits - p.stock, 0) : 0,
        expiringSoon: [],
        since: a ? a.since.toISOString() : null,
        notificationId: a ? `${NOTI_PREFIX}${a.id}` : null,
        acknowledged: !!a?.acknowledgedAt,
        acknowledgedBy: a?.acknowledgedBy?.name ?? null,
        acknowledgedAt: a?.acknowledgedAt ? a.acknowledgedAt.toISOString() : null,
      }
    })

    return {
      types: types.map((t) => ({ code: t.code, name: t.name })),
      groups: groups.map((g) => g.code),
      items,
      totalStock,
      configured: items.some((i) => i.minUnits != null),
    }
  })
}

const RANK: Record<MinStatus, number> = { danger: 0, warning: 1, normal: 2, none: 3 }
/** วิกฤตที่สุดก่อน: danger → warning → normal → none แล้วเรียง % ของขั้นต่ำน้อยสุด */
export const sortByCritical = (a: MinStockStatusItem, b: MinStockStatusItem) =>
  RANK[a.status] - RANK[b.status] || (a.pct ?? 9) - (b.pct ?? 9)

/** ข้อความแจ้งเตือน (ใช้ทั้งกระดิ่งและ GET /notifications) */
export const alertDetail = (i: MinStockStatusItem): string =>
  i.status === 'danger'
    ? `${i.type} หมู่ ${i.group} คงเหลือ ${i.stock} unit ต่ำกว่าขั้นต่ำ ${i.minUnits} unit (ขาด ${i.gap} unit)`
    : `${i.type} หมู่ ${i.group} คงเหลือ ${i.stock} unit ใกล้ขั้นต่ำ ${i.minUnits} unit (${i.pct == null ? '100%' : pctLabel(i.pct)} ของขั้นต่ำ)`
