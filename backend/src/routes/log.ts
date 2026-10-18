// src/routes/log.ts

import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// ===== GET /api/v1/log =====
router.get('/', async (req, res) => {
  try {
    const { action, blood, limit = '50', offset = '0' } = req.query

    const where: Record<string, unknown> = {}
    if (action) where.action = (action as string).toUpperCase()
    if (blood) {
      where.box = { blood: (blood as string).toUpperCase() }
    }

    const entries = await prisma.logEntry.findMany({
      where,
      include: {
        box: { select: { boxLabel: true, type: true, blood: true, location: true, shelf: true } },
        user: { select: { name: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    })

    const result = entries.map((e) => ({
      id: e.id,
      action: e.action.toLowerCase(),
      boxLabel: e.box?.boxLabel || '-',
      type: e.box?.type || 'FFP',
      blood: e.box?.blood || '-',
      units: [],
      location: e.box?.location?.toLowerCase(),
      shelf: e.box?.shelf,
      timestamp: e.timestamp.toISOString(),
      detail: e.detail,
      performedBy: e.user?.name,
    }))

    res.json(result)
  } catch (error) {
    console.error('GET /log error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router
