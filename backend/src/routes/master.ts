// src/routes/master.ts
import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { adminOnly } from '../middleware/auth'
import { boxDto, zoneSelect } from '../lib/boxDto'
import { RACK_LEVELS, purgeExpiredLocks } from '../lib/rack'

const router = Router()
const fail = (res: any, e: unknown, tag: string) => {
  console.error(tag, e)
  res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
}

// ───────── ชนิด / หมู่เลือด (โครงเหมือนกัน) ─────────
function codeMaster(path: string, model: 'masterPlasmaType' | 'masterBloodType', upper: boolean) {
  const db = (prisma as any)[model]
  const norm = (v: unknown) => {
    const s = String(v ?? '').trim()
    return upper ? s.toUpperCase() : s
  }

  router.get(path, async (_req, res) => {
    try {
      res.json(await db.findMany({ orderBy: [{ sort: 'asc' }, { code: 'asc' }] }))
    } catch (e) { fail(res, e, `GET ${path}`) }
  })

  // ในฟังก์ชัน codeMaster — แก้ POST
router.post(path, async (req, res) => {
    try {
      const code = norm(req.body.code)
      if (!code) { res.status(400).json({ message: 'กรุณาระบุรหัส' }); return }
      if (code.length > 20) { res.status(400).json({ message: 'รหัสยาวเกินไป (สูงสุด 20 ตัวอักษร)' }); return }

      const dup = await db.findFirst({ where: { code: { equals: code, mode: 'insensitive' } } })
      if (dup) { res.status(409).json({ message: `"${dup.code}" มีอยู่แล้ว` }); return }

      const max = await db.aggregate({ _max: { sort: true } })
      const color = req.body.color?.toString().trim() || null   // ← เพิ่ม
      const created = await db.create({
        data: {
          code,
          name: req.body.name?.toString().trim() || null,
          color,                                                 // ← เพิ่ม
          sort: (max._max.sort ?? -1) + 1,
        },
      })
      res.status(201).json(created)
    } catch (e) { fail(res, e, `POST ${path}`) }
  })

// ในฟังก์ชัน codeMaster — แก้ PATCH
router.patch(`${path}/:id`, adminOnly, async (req, res) => {
    try {
      const data: Record<string, unknown> = {}
      if (req.body.name !== undefined) data.name = req.body.name?.toString().trim() || null
      if (req.body.active !== undefined) data.active = !!req.body.active
      if (req.body.sort !== undefined) data.sort = Number(req.body.sort)
      if (req.body.color !== undefined) data.color = req.body.color?.toString().trim() || null  // ← เพิ่ม
      res.json(await db.update({ where: { id: req.params.id as string }, data }))
    } catch (e: any) {
      if (e?.code === 'P2025') { res.status(404).json({ message: 'ไม่พบข้อมูล' }); return }
      fail(res, e, `PATCH ${path}`)
    }
  })

}

codeMaster('/plasma-types', 'masterPlasmaType', false)
codeMaster('/blood-types', 'masterBloodType', true)

// ───────── หมายเหตุการลบ unit ─────────
router.get('/removal-reasons', async (_req, res) => {
  try {
    res.json(await prisma.masterRemovalReason.findMany({
      orderBy: [{ sort: 'asc' }, { name: 'asc' }],
    }))
  } catch (e) { fail(res, e, 'GET /removal-reasons') }
})

router.post('/removal-reasons', adminOnly, async (req, res) => {
  try {
    const name = String(req.body.name ?? '').trim()
    if (!name) { res.status(400).json({ message: 'กรุณาระบุหมายเหตุ' }); return }
    if (name.length > 100) { res.status(400).json({ message: 'หมายเหตุยาวเกินไป (สูงสุด 100 ตัวอักษร)' }); return }

    const dup = await prisma.masterRemovalReason.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    })
    if (dup) { res.status(409).json({ message: `"${dup.name}" มีอยู่แล้ว` }); return }

    const max = await prisma.masterRemovalReason.aggregate({ _max: { sort: true } })
    const created = await prisma.masterRemovalReason.create({
      data: { name, sort: (max._max.sort ?? -1) + 1 },
    })
    res.status(201).json(created)
  } catch (e) { fail(res, e, 'POST /removal-reasons') }
})

router.patch('/removal-reasons/:id', adminOnly, async (req, res) => {
  try {
    const data: Record<string, unknown> = {}
    if (req.body.name !== undefined) {
      const name = String(req.body.name ?? '').trim()
      if (!name) { res.status(400).json({ message: 'กรุณาระบุหมายเหตุ' }); return }
      if (name.length > 100) { res.status(400).json({ message: 'หมายเหตุยาวเกินไป (สูงสุด 100 ตัวอักษร)' }); return }
      const dup = await prisma.masterRemovalReason.findFirst({
        where: { name: { equals: name, mode: 'insensitive' }, NOT: { id: req.params.id } },
      })
      if (dup) { res.status(409).json({ message: `"${dup.name}" มีอยู่แล้ว` }); return }
      data.name = name
    }
    if (req.body.active !== undefined) data.active = !!req.body.active
    if (req.body.sort !== undefined) data.sort = Number(req.body.sort)
    res.json(await prisma.masterRemovalReason.update({ where: { id: req.params.id }, data }))
  } catch (e: any) {
    if (e?.code === 'P2025') { res.status(404).json({ message: 'ไม่พบข้อมูล' }); return }
    fail(res, e, 'PATCH /removal-reasons')
  }
})

// ───────── สถานที่ (ห้อง/ตู้) + ชั้นวาง ─────────
router.get('/zones', async (_req, res) => {
  try {
    res.json(await prisma.masterZone.findMany({
      orderBy: [{ sort: 'asc' }, { name: 'asc' }],
      include: { shelves: { orderBy: [{ sort: 'asc' }, { code: 'asc' }] } },
    }))
  } catch (e) { fail(res, e, 'GET /zones') }
})

router.post('/zones', async (req, res) => {
  try {
    const name = String(req.body.name ?? '').trim()
    if (!name) { res.status(400).json({ message: 'กรุณาระบุชื่อสถานที่' }); return }

    const dup = await prisma.masterZone.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } })
    if (dup) { res.status(409).json({ message: `"${dup.name}" มีอยู่แล้ว` }); return }

    const max = await prisma.masterZone.aggregate({ _max: { sort: true } })
    const zone = await prisma.masterZone.create({
      data: { name, sort: (max._max.sort ?? -1) + 1 },
      include: { shelves: true },
    })
    res.status(201).json(zone)
  } catch (e) { fail(res, e, 'POST /zones') }
})

router.patch('/zones/:id', adminOnly, async (req, res) => {
  try {
    const data: Record<string, unknown> = {}
    if (req.body.name !== undefined) data.name = String(req.body.name).trim()
    if (req.body.active !== undefined) data.active = !!req.body.active
    if (req.body.sort !== undefined) data.sort = Number(req.body.sort)
    res.json(await prisma.masterZone.update({
      where: { id: req.params.id as string }, data, include: { shelves: true },
    }))
  } catch (e: any) {
    if (e?.code === 'P2025') { res.status(404).json({ message: 'ไม่พบข้อมูล' }); return }
    if (e?.code === 'P2002') { res.status(409).json({ message: 'ชื่อซ้ำ' }); return }
    fail(res, e, 'PATCH /zones/:id')
  }
})

router.post('/zones/:id/shelves', async (req, res) => {
  try {
    const zoneId = req.params.id as string
    const code = String(req.body.code ?? '').trim().toUpperCase()
    if (!code) { res.status(400).json({ message: 'กรุณาระบุชั้นวาง' }); return }

    const dup = await prisma.masterShelf.findUnique({ where: { zoneId_code: { zoneId, code } } })
    if (dup) { res.status(409).json({ message: `ชั้น "${code}" มีอยู่แล้ว` }); return }

    const max = await prisma.masterShelf.aggregate({ where: { zoneId }, _max: { sort: true } })
    res.status(201).json(await prisma.masterShelf.create({
      data: { zoneId, code, sort: (max._max.sort ?? -1) + 1 },
    }))
  } catch (e: any) {
    if (e?.code === 'P2003') { res.status(404).json({ message: 'ไม่พบสถานที่' }); return }
    fail(res, e, 'POST /zones/:id/shelves')
  }
})

// ───────── Rack (ห้อง -30°C): ชั้น 1–5 × ช่อง 1–20 ─────────
// GET /master/zones/:zoneId/racks/:shelf
// → { shelf, levels: [{ level, slots: { [position]: Box + units(เรียงตาม seq) } }], locks: [...] }
router.get('/zones/:zoneId/racks/:shelf', async (req, res) => {
  try {
    const zoneId = req.params.zoneId as string
    const shelf = String(req.params.shelf).trim().toUpperCase()

    const zone = await prisma.masterZone.findUnique({ where: { id: zoneId } })
    if (!zone) { res.status(404).json({ message: 'ไม่พบสถานที่' }); return }

    await purgeExpiredLocks(prisma)

    const [boxes, locks, lastLogs] = await Promise.all([
      prisma.box.findMany({
        where: { zoneId, shelf, status: 'STORED', level: { not: null }, position: { not: null } },
        include: {
          zone: zoneSelect,
          units: {
            where: { status: 'STORED' },
            select: { id: true, unitNumber: true, seq: true },
            orderBy: [{ seq: 'asc' }, { createdAt: 'asc' }],
          },
        },
      }),
      prisma.slotLock.findMany({
        where: { zoneId, shelf },
        include: { user: { select: { name: true } } },
      }),
      // ประวัติล่าสุดของแต่ละกล่องใน rack นี้ ("ล่าสุด: ผู้ทำ · วันเวลา")
      prisma.logEntry.findMany({
        where: { box: { zoneId, shelf, status: 'STORED' } },
        orderBy: { timestamp: 'desc' },
        distinct: ['boxId'],
        select: { boxId: true, timestamp: true, user: { select: { name: true } } },
      }),
    ])

    const lastByBox = new Map(lastLogs.map((l) => [l.boxId, l]))

    const levels = Array.from({ length: RACK_LEVELS }, (_, i) => {
      const level = i + 1
      const slots: Record<number, unknown> = {}
      for (const b of boxes) {
        if (b.level !== level || b.position == null) continue
        const last = lastByBox.get(b.id)
        slots[b.position] = {
          ...boxDto(b),
          units: b.units.map((u) => u.unitNumber),
          lastAction: last
            ? { userName: last.user?.name ?? null, timestamp: last.timestamp.toISOString() }
            : null,
        }
      }
      return { level, slots }
    })

    res.json({
      zoneId,
      shelf,
      levels,
      locks: locks.map((l) => ({
        id: l.id,
        level: l.level,
        position: l.position,
        userId: l.userId,
        userName: l.user.name,
        expiresAt: l.expiresAt.toISOString(),
      })),
    })
  } catch (e) { fail(res, e, 'GET /zones/:zoneId/racks/:shelf') }
})

router.patch('/shelves/:shelfId', adminOnly, async (req, res) => {
  try {
    const data: Record<string, unknown> = {}
    if (req.body.active !== undefined) data.active = !!req.body.active
    if (req.body.sort !== undefined) data.sort = Number(req.body.sort)
    res.json(await prisma.masterShelf.update({ where: { id: req.params.shelfId as string }, data }))
  } catch (e: any) {
    if (e?.code === 'P2025') { res.status(404).json({ message: 'ไม่พบข้อมูล' }); return }
    fail(res, e, 'PATCH /shelves/:id')
  }
})



export default router