// src/routes/units.ts

import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// ===== GET /api/v1/units =====
router.get('/', async (_req, res) => {
  try {
    const units = await prisma.unit.findMany({
      include: {
        box: { select: { boxLabel: true, blood: true, location: true, shelf: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(units)
  } catch (error) {
    console.error('GET /units error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== GET /api/v1/units/search?q= =====
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q as string || '').trim()
    if (!q) {
      res.json([])
      return
    }

    const units = await prisma.unit.findMany({
      where: {
        OR: [
          { unitNumber: { contains: q, mode: 'insensitive' } },
          { box: { boxLabel: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: {
        box: {
          select: {
            id: true,
            boxLabel: true,
            blood: true,
            type: true,
            location: true,
            shelf: true,
            status: true,
            collectionDate: true,
          },
        },
      },
      take: 50,
    })

    const result = units.map((u) => ({
      id: u.id,
      unitNumber: u.unitNumber,
      status: u.status.toLowerCase(),
      box: {
        id: u.box.id,
        boxLabel: u.box.boxLabel,
        blood: u.box.blood,
        type: u.box.type,
        location: u.box.location.toLowerCase(),
        shelf: u.box.shelf,
        status: u.box.status.toLowerCase(),
        collectionDate: u.box.collectionDate.toISOString().split('T')[0],
      },
    }))

    res.json(result)
  } catch (error) {
    console.error('GET /units/search error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== PATCH /api/v1/units/:id/withdraw =====
router.patch('/:id/withdraw', async (req, res) => {
  try {
    const unit = await prisma.unit.findUnique({
      where: { id: req.params.id },
      include: { box: true },
    })

    if (!unit) {
      res.status(404).json({ message: 'ไม่พบ unit' })
      return
    }

    if (unit.status === 'WITHDRAWN') {
      res.status(400).json({ message: 'Unit นี้ถูกนำออกแล้ว' })
      return
    }

    await prisma.$transaction([
      prisma.unit.update({
        where: { id: unit.id },
        data: { status: 'WITHDRAWN' },
      }),
      prisma.logEntry.create({
        data: {
          action: 'WITHDRAW',
          boxId: unit.boxId,
          detail: `นำออก unit ${unit.unitNumber} จากกล่อง ${unit.box.boxLabel}`,
          userId: req.user?.id,
        },
      }),
    ])

    res.json({ message: `นำออก unit ${unit.unitNumber} สำเร็จ` })
  } catch (error) {
    console.error('PATCH /units/:id/withdraw error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router