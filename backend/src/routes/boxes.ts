// src/routes/boxes.ts

import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { boxDto, zoneSelect } from '../lib/boxDto'

const router = Router()

class HttpError extends Error {
  constructor(public status: number, message: string, public extra?: object) {
    super(message)
  }
}

// ปี ค.ศ. ตามเวลาไทย
const bkkYear = () =>
  Number(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).slice(0, 4))

const formatLabel = (type: string, blood: string, year: number, no: number) =>
  `${type}_${blood}_${year}_${String(no).padStart(5, '0')}`

// ===== GET /api/v1/boxes =====
router.get('/', async (req, res) => {
  try {
    const { blood, location, status } = req.query

    const where: Record<string, unknown> = {}
    if (blood) where.blood = (blood as string).toUpperCase()
    if (location) where.zone = { legacyKey: (location as string).toUpperCase() }
    if (status) where.status = (status as string).toUpperCase()

    const boxes = await prisma.box.findMany({
      where,
      include: {
        zone: zoneSelect,
        units: { select: { unitNumber: true, status: true } },
      },
      orderBy: { storedAt: 'desc' },
    })

    res.json(
      boxes.map((b) => ({ ...boxDto(b), units: b.units.map((u) => u.unitNumber) })),
    )
  } catch (error) {
    console.error('GET /boxes error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== GET /api/v1/boxes/next-label?type=&blood= =====
// ต้องอยู่ก่อน /:id
router.get('/next-label', async (req, res) => {
  try {
    const type = String(req.query.type ?? '').trim()
    const blood = String(req.query.blood ?? '').trim()

    const [pt, bt] = await Promise.all([
      prisma.masterPlasmaType.findUnique({ where: { code: type } }),
      prisma.masterBloodType.findUnique({ where: { code: blood } }),
    ])
    if (!pt || !bt) {
      res.status(400).json({ message: 'ไม่พบชนิดหรือหมู่เลือด' })
      return
    }

    const year = bkkYear()
    const counter = await prisma.boxCounter.findUnique({
      where: { plasmaTypeId_bloodTypeId_year: { plasmaTypeId: pt.id, bloodTypeId: bt.id, year } },
    })

    res.json({ label: formatLabel(pt.code, bt.code, year, (counter?.lastNo ?? 0) + 1), year })
  } catch (error) {
    console.error('GET /boxes/next-label error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== GET /api/v1/boxes/:id =====
router.get('/:id', async (req, res) => {
  try {
    const box = await prisma.box.findUnique({
      where: { id: req.params.id },
      include: {
        zone: zoneSelect,
        units: { select: { id: true, unitNumber: true, status: true } },
      },
    })

    if (!box) {
      res.status(404).json({ message: 'ไม่พบกล่อง' })
      return
    }

    res.json({
      ...boxDto(box),
      units: box.units.map((u) => ({
        id: u.id,
        unitNumber: u.unitNumber,
        status: u.status.toLowerCase(),
      })),
      unitCount: box.units.length,
      storedCount: box.units.filter((u) => u.status === 'STORED').length,
    })
  } catch (error) {
    console.error('GET /boxes/:id error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== POST /api/v1/boxes =====
// backend ออกเลขกล่องเอง ไม่รับ boxLabel จาก client
router.post('/', async (req, res) => {
  try {
    const { boxName, type, blood, zoneId, shelf, collectionDate, units } = req.body
    const unitList: string[] = Array.isArray(units) ? units : []

    if (!type || !blood || !zoneId || !shelf || !collectionDate) {
      res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' })
      return
    }
    if (unitList.length === 0) {
      res.status(400).json({ message: 'กรุณาเพิ่ม Unit อย่างน้อย 1 รายการ' })
      return
    }

    // ตรวจ unit ซ้ำ
    const existing = await prisma.unit.findMany({
      where: { unitNumber: { in: unitList } },
      select: { unitNumber: true },
    })
    if (existing.length > 0) {
      const dupes = existing.map((u) => u.unitNumber)
      res.status(409).json({ message: `Unit ซ้ำ: ${dupes.join(', ')}`, duplicates: dupes })
      return
    }

    const box = await prisma.$transaction(async (tx) => {
      const [pt, bt, zone] = await Promise.all([
        tx.masterPlasmaType.findFirst({ where: { code: String(type), active: true } }),
        tx.masterBloodType.findFirst({ where: { code: String(blood), active: true } }),
        tx.masterZone.findFirst({ where: { id: String(zoneId), active: true } }),
      ])
      if (!pt) throw new HttpError(400, 'ไม่พบชนิดพลาสมา หรือถูกปิดใช้งาน')
      if (!bt) throw new HttpError(400, 'ไม่พบหมู่เลือด หรือถูกปิดใช้งาน')
      if (!zone) throw new HttpError(400, 'ไม่พบสถานที่จัดเก็บ หรือถูกปิดใช้งาน')

      const shelfCode = String(shelf).trim().toUpperCase()
      const shelfRow = await tx.masterShelf.findUnique({
        where: { zoneId_code: { zoneId: zone.id, code: shelfCode } },
      })
      if (!shelfRow || !shelfRow.active) {
        throw new HttpError(400, `ไม่พบชั้น "${shelfCode}" ในสถานที่นี้ หรือถูกปิดใช้งาน`)
      }

      // เพิ่มเลขแบบ atomic ภายใน transaction
      const year = bkkYear()
      const counter = await tx.boxCounter.upsert({
        where: { plasmaTypeId_bloodTypeId_year: { plasmaTypeId: pt.id, bloodTypeId: bt.id, year } },
        create: { plasmaTypeId: pt.id, bloodTypeId: bt.id, year, lastNo: 1 },
        update: { lastNo: { increment: 1 } },
      })
      const boxLabel = formatLabel(pt.code, bt.code, year, counter.lastNo)

      return tx.box.create({
        data: {
          boxLabel,
          boxName: boxName?.toString().trim() || null,
          type: pt.code,
          blood: bt.code,
          year,
          zoneId: zone.id,
          shelf: shelfCode,
          collectionDate: new Date(collectionDate),
          status: 'STORED',
          units: { create: unitList.map((u) => ({ unitNumber: u })) },
          logs: {
            create: {
              action: 'STORE',
              detail: `จัดเก็บกล่อง ${boxLabel} จำนวน ${unitList.length} units`,
              unitCount: unitList.length,
              userId: req.user?.id,
            },
          },
        },
        include: { zone: zoneSelect, units: { select: { unitNumber: true } } },
      })
    })

    res.status(201).json({ ...boxDto(box), units: box.units.map((u) => u.unitNumber) })
  } catch (error: any) {
    if (error instanceof HttpError) {
      res.status(error.status).json({ message: error.message, ...error.extra })
      return
    }
    if (error?.code === 'P2002') {
      res.status(409).json({ message: 'ข้อมูลซ้ำ (หมายเลขกล่องหรือ Unit)' })
      return
    }
    console.error('POST /boxes error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== PATCH /api/v1/boxes/:id/withdraw =====
router.patch('/:id/withdraw', async (req, res) => {
  try {
    const box = await prisma.box.findUnique({
      where: { id: req.params.id },
      include: { units: true },
    })

    if (!box) {
      res.status(404).json({ message: 'ไม่พบกล่อง' })
      return
    }
    if (box.status === 'WITHDRAWN') {
      res.status(400).json({ message: 'กล่องนี้ถูกนำออกแล้ว' })
      return
    }

    const now = new Date()
    const storedCount = box.units.filter((u) => u.status === 'STORED').length

    await prisma.$transaction([
      prisma.box.update({
        where: { id: box.id },
        data: { status: 'WITHDRAWN', withdrawnAt: now },
      }),
      prisma.unit.updateMany({
        where: { boxId: box.id },
        data: { status: 'WITHDRAWN' },
      }),
      prisma.logEntry.create({
        data: {
          action: 'WITHDRAW',
          boxId: box.id,
          detail: `นำออกกล่อง ${box.boxLabel} จำนวน ${storedCount} units`,
          unitCount: storedCount,
          userId: req.user?.id,
        },
      }),
    ])

    res.json({ message: `นำออกกล่อง ${box.boxLabel} สำเร็จ` })
  } catch (error) {
    console.error('PATCH /boxes/:id/withdraw error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router