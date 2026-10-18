// src/routes/boxes.ts

import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// ===== GET /api/v1/boxes =====
router.get('/', async (req, res) => {
  try {
    const { blood, location, status } = req.query

    const where: Record<string, unknown> = {}
    if (blood) where.blood = (blood as string).toUpperCase()
    if (location) where.location = (location as string).toUpperCase()
    if (status) where.status = (status as string).toUpperCase()

    const boxes = await prisma.box.findMany({
      where,
      include: { units: { select: { unitNumber: true, status: true } } },
      orderBy: { storedAt: 'desc' },
    })

    // map ให้ตรง format frontend
    const result = boxes.map((b) => ({
      id: b.id,
      boxLabel: b.boxLabel,
      type: b.type,
      blood: b.blood,
      location: b.location.toLowerCase(),
      shelf: b.shelf,
      collectionDate: b.collectionDate.toISOString().split('T')[0],
      units: b.units.map((u) => u.unitNumber),
      status: b.status.toLowerCase(),
      storedAt: b.storedAt.toISOString(),
      withdrawnAt: b.withdrawnAt?.toISOString() || null,
    }))

    res.json(result)
  } catch (error) {
    console.error('GET /boxes error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== GET /api/v1/boxes/:id =====
router.get('/:id', async (req, res) => {
  try {
    const box = await prisma.box.findUnique({
      where: { id: req.params.id },
      include: { units: { select: { id: true, unitNumber: true, status: true } } },
    })

    if (!box) {
      res.status(404).json({ message: 'ไม่พบกล่อง' })
      return
    }

    res.json({
      id: box.id,
      boxLabel: box.boxLabel,
      type: box.type,
      blood: box.blood,
      location: box.location.toLowerCase(),
      shelf: box.shelf,
      collectionDate: box.collectionDate.toISOString().split('T')[0],
      units: box.units.map((u) => u.unitNumber),
      status: box.status.toLowerCase(),
      storedAt: box.storedAt.toISOString(),
      withdrawnAt: box.withdrawnAt?.toISOString() || null,
    })
  } catch (error) {
    console.error('GET /boxes/:id error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== POST /api/v1/boxes =====
router.post('/', async (req, res) => {
  try {
    const { boxLabel, type, blood, location, shelf, collectionDate, units } = req.body

    // ตรวจ unit ซ้ำ
    if (units?.length) {
      const existing = await prisma.unit.findMany({
        where: { unitNumber: { in: units } },
        select: { unitNumber: true },
      })
      if (existing.length > 0) {
        const dupes = existing.map((u) => u.unitNumber)
        res.status(409).json({
          message: `Unit ซ้ำ: ${dupes.join(', ')}`,
          duplicates: dupes,
        })
        return
      }
    }

    const box = await prisma.box.create({
      data: {
        boxLabel,
        type: type || 'FFP',
        blood: blood.toUpperCase(),
        location: location.toUpperCase(),
        shelf,
        collectionDate: new Date(collectionDate),
        status: 'STORED',
        units: {
          create: (units || []).map((u: string) => ({ unitNumber: u })),
        },
        logs: {
          create: {
            action: 'STORE',
            detail: `จัดเก็บกล่อง ${boxLabel} จำนวน ${units?.length || 0} units`,
            userId: req.user?.id,
          },
        },
      },
      include: { units: { select: { unitNumber: true } } },
    })

    res.status(201).json({
      id: box.id,
      boxLabel: box.boxLabel,
      type: box.type,
      blood: box.blood,
      location: box.location.toLowerCase(),
      shelf: box.shelf,
      collectionDate: box.collectionDate.toISOString().split('T')[0],
      units: box.units.map((u) => u.unitNumber),
      status: box.status.toLowerCase(),
      storedAt: box.storedAt.toISOString(),
    })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ message: 'หมายเลขกล่องซ้ำ' })
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
          detail: `นำออกกล่อง ${box.boxLabel} จำนวน ${box.units.length} units`,
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
