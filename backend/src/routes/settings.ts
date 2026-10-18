// src/routes/settings.ts

import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { adminOnly } from '../middleware/auth'

const router = Router()

// ===== GET /api/v1/settings =====
router.get('/', async (_req, res) => {
  try {
    const settings = await prisma.setting.findMany()

    const result: Record<string, unknown> = {}
    for (const s of settings) {
      result[s.key] = s.value
    }

    res.json(result)
  } catch (error) {
    console.error('GET /settings error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== PUT /api/v1/settings =====
router.put('/', adminOnly, async (req, res) => {
  try {
    const { minimumStock, shelfPositions } = req.body

    if (minimumStock) {
      await prisma.setting.upsert({
        where: { key: 'minimumStock' },
        update: { value: minimumStock },
        create: { key: 'minimumStock', value: minimumStock },
      })
    }

    if (shelfPositions) {
      await prisma.setting.upsert({
        where: { key: 'shelfPositions' },
        update: { value: shelfPositions },
        create: { key: 'shelfPositions', value: shelfPositions },
      })
    }

    res.json({ message: 'บันทึกการตั้งค่าสำเร็จ' })
  } catch (error) {
    console.error('PUT /settings error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router
