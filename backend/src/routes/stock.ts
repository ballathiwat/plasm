// src/routes/stock.ts

import { Router } from 'express'
import { prisma } from '../lib/prisma'
import type { BloodGroup } from '@prisma/client'

const router = Router()

// ===== GET /api/v1/stock/summary =====
router.get('/summary', async (_req, res) => {
  try {
    // นับ unit ที่ยังเก็บอยู่ แยกตามหมู่เลือด
    const counts = await prisma.unit.groupBy({
      by: ['status'],
      where: {
        status: 'STORED',
        box: { status: 'STORED' },
      },
      _count: true,
    })

    // นับแยกตาม blood group ผ่าน raw query เพื่อประสิทธิภาพ
    const stockByBlood = await prisma.$queryRaw<
      { blood: BloodGroup; count: bigint }[]
    >`
      SELECT b.blood, COUNT(u.id) as count
      FROM units u
      JOIN boxes b ON u.box_id = b.id
      WHERE u.status = 'STORED' AND b.status = 'STORED'
      GROUP BY b.blood
    `

    const stocks: Record<string, number> = { A: 0, B: 0, O: 0, AB: 0 }
    for (const row of stockByBlood) {
      stocks[row.blood] = Number(row.count)
    }

    // ดึง minimum stock setting
    const setting = await prisma.setting.findUnique({
      where: { key: 'minimumStock' },
    })
    const minimum = (setting?.value as Record<string, number>) || {
      A: 150, B: 300, O: 300, AB: 100,
    }

    res.json({ stocks, minimum })
  } catch (error) {
    console.error('GET /stock/summary error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router
