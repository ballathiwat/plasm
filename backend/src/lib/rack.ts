// src/lib/rack.ts
// ตำแหน่งระดับ rack(shelf) → ชั้น(level) → ช่อง(position) ของห้อง -30°C (zone legacyKey = 'ROOM')

import type { Prisma } from '@prisma/client'

export const RACK_LEVELS = 5
export const RACK_POSITIONS = 20
export const BOX_CAPACITY = 12
export const LOCK_TTL_MS = 60_000
export const ROOM_KEY = 'ROOM'

type Tx = Prisma.TransactionClient

export class HttpError extends Error {
  constructor(public status: number, message: string, public extra?: object) {
    super(message)
  }
}

export const isRackZone = (z?: { legacyKey: string | null } | null) => z?.legacyKey === ROOM_KEY

/** ช่อง p (1–20) → คอลัมน์ / แถวหน้า-หลัง / บน-ล่าง */
export function slotInfo(p: number) {
  const k = (p - 1) % 4
  return {
    col: Math.ceil(p / 4),
    row: k < 2 ? 'หน้า' : 'หลัง',
    tier: k % 2 === 0 ? 'ล่าง' : 'บน',
  }
}

/** "L1-2 ช่อง 7" (rack) หรือ "ชั้น C1" (ตู้) */
export function positionLabel(b: { shelf: string; level?: number | null; position?: number | null }) {
  return b.level != null && b.position != null ? `${b.shelf}-${b.level} ช่อง ${b.position}` : `ชั้น ${b.shelf}`
}

/** แปลง + ตรวจช่วง level/position จาก body — undefined ถ้าไม่ส่งมา */
export function parseSlot(level: unknown, position: unknown): { level: number; position: number } | null {
  if (level === undefined && position === undefined) return null
  if (level === null && position === null) return null
  const l = Number(level)
  const p = Number(position)
  if (!Number.isInteger(l) || l < 1 || l > RACK_LEVELS) throw new HttpError(400, `ชั้นต้องอยู่ระหว่าง 1–${RACK_LEVELS}`)
  if (!Number.isInteger(p) || p < 1 || p > RACK_POSITIONS) throw new HttpError(400, `ช่องต้องอยู่ระหว่าง 1–${RACK_POSITIONS}`)
  return { level: l, position: p }
}

/** ล้าง lock ที่หมดอายุ (lazy) */
export const purgeExpiredLocks = (db: Tx) => db.slotLock.deleteMany({ where: { expiresAt: { lt: new Date() } } })

/** ถ้ามีคนอื่นถือ lock ช่องนี้อยู่ → 409 */
export async function assertNotLockedByOther(
  db: Tx,
  slot: { zoneId: string; shelf: string; level: number; position: number },
  userId?: string,
) {
  const lock = await db.slotLock.findFirst({
    where: { ...slot, expiresAt: { gt: new Date() } },
    include: { user: { select: { name: true } } },
  })
  if (lock && lock.userId !== userId) {
    throw new HttpError(409, `${lock.user.name} กำลังแก้ไขช่องนี้อยู่`, { userName: lock.user.name })
  }
}

/** ช่องต้องว่าง (ไม่มีกล่อง STORED อื่น) → 409 */
export async function assertSlotFree(
  db: Tx,
  slot: { zoneId: string; shelf: string; level: number; position: number },
  exceptBoxId?: string,
) {
  const other = await db.box.findFirst({
    where: { ...slot, status: 'STORED', ...(exceptBoxId ? { id: { not: exceptBoxId } } : {}) },
    select: { boxLabel: true },
  })
  if (other) {
    throw new HttpError(409, `${slot.shelf}-${slot.level} ช่อง ${slot.position} มีกล่อง ${other.boxLabel} อยู่แล้ว`)
  }
}

/** ปล่อย lock ของผู้ใช้คนนี้ที่ช่องนี้ (หลังบันทึกสำเร็จ) */
export const releaseOwnLock = (
  db: Tx,
  slot: { zoneId: string; shelf: string; level: number; position: number },
  userId?: string,
) => (userId ? db.slotLock.deleteMany({ where: { ...slot, userId } }) : Promise.resolve({ count: 0 }))
