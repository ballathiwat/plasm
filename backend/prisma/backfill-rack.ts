// prisma/backfill-rack.ts
// รันครั้งเดียวหลัง migrate (รันมือ):  npx tsx prisma/backfill-rack.ts
//  1) กล่อง STORED ในห้อง -30°C (legacyKey ROOM) ที่ยังไม่มี level/position
//     → วางลงช่องว่างแรกของ rack(shelf) นั้น (ชั้น 1..5, ช่อง 1..20)
//  2) units ที่ยังไม่มี seq → เรียงตาม created_at ภายในกล่อง (1 = หน้า)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const LEVELS = 5
const POSITIONS = 20

async function main() {
  const room = await prisma.masterZone.findUnique({ where: { legacyKey: 'ROOM' } })
  if (!room) {
    console.log('ไม่พบสถานที่ legacyKey = ROOM — ข้ามขั้นตอนวางกล่อง')
  } else {
    const pending = await prisma.box.findMany({
      where: { zoneId: room.id, status: 'STORED', OR: [{ level: null }, { position: null }] },
      orderBy: [{ shelf: 'asc' }, { storedAt: 'asc' }],
      select: { id: true, boxLabel: true, shelf: true },
    })
    const used = await prisma.box.findMany({
      where: { zoneId: room.id, status: 'STORED', level: { not: null }, position: { not: null } },
      select: { shelf: true, level: true, position: true },
    })
    const taken = new Set(used.map((b) => `${b.shelf}|${b.level}|${b.position}`))

    let placed = 0
    for (const b of pending) {
      let done = false
      for (let l = 1; l <= LEVELS && !done; l++) {
        for (let p = 1; p <= POSITIONS && !done; p++) {
          const k = `${b.shelf}|${l}|${p}`
          if (taken.has(k)) continue
          await prisma.box.update({ where: { id: b.id }, data: { level: l, position: p } })
          taken.add(k)
          placed++
          done = true
          console.log(`  ${b.boxLabel} → ${b.shelf}-${l} ช่อง ${p}`)
        }
      }
      if (!done) console.warn(`  ⚠ ${b.boxLabel}: rack ${b.shelf} เต็ม (100 ช่อง) — ไม่ได้วาง`)
    }
    console.log(`✅ วางกล่อง ${placed}/${pending.length} กล่อง`)
  }

  const units = await prisma.unit.findMany({
    where: { seq: null },
    orderBy: [{ boxId: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, boxId: true },
  })
  const maxSeq = new Map<string, number>()
  const existing = await prisma.unit.groupBy({
    by: ['boxId'],
    where: { seq: { not: null } },
    _max: { seq: true },
  })
  for (const e of existing) maxSeq.set(e.boxId, e._max.seq ?? 0)
  for (const u of units) {
    const next = (maxSeq.get(u.boxId) ?? 0) + 1
    maxSeq.set(u.boxId, next)
    await prisma.unit.update({ where: { id: u.id }, data: { seq: next } })
  }
  console.log(`✅ ตั้ง seq ให้ ${units.length} units`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
