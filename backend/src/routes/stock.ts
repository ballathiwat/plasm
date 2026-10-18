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

    // คำนวณ % change (เทียบ 7 วันก่อน)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const pastStockByBlood = await prisma.$queryRaw<
      { blood: BloodGroup; count: bigint }[]
    >`
      SELECT b.blood, COUNT(u.id) as count
      FROM units u
      JOIN boxes b ON u.box_id = b.id
      WHERE u.status = 'STORED' AND b.status = 'STORED'
        AND u.created_at <= ${sevenDaysAgo}
      GROUP BY b.blood
    `

    const pastStocks: Record<string, number> = { A: 0, B: 0, O: 0, AB: 0 }
    for (const row of pastStockByBlood) {
      pastStocks[row.blood] = Number(row.count)
    }

    const change: Record<string, number> = {}
    for (const g of ['A', 'B', 'O', 'AB']) {
      const prev = pastStocks[g]
      const curr = stocks[g]
      change[g] = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0)
    }

    res.json({ stocks, minimum, change })
  } catch (error) {
    console.error('GET /stock/summary error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== GET /api/v1/stock/daily?days=7 =====
// จำนวน unit ที่จัดเก็บ (STORE) แต่ละวัน
router.get('/daily', async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 7, 30)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (days - 1))
    startDate.setHours(0, 0, 0, 0)

    const rows = await prisma.$queryRaw<
      { day: Date; count: bigint }[]
    >`
      SELECT DATE(le.timestamp) as day, COUNT(le.id) as count
      FROM log_entries le
      WHERE le.action = 'STORE'
        AND le.timestamp >= ${startDate}
      GROUP BY DATE(le.timestamp)
      ORDER BY day ASC
    `

    // เติมวันที่ไม่มีข้อมูลเป็น 0
    const result: { label: string; value: number }[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const found = rows.find((r) => {
        const rDate = new Date(r.day).toISOString().split('T')[0]
        return rDate === dateStr
      })
      result.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        value: found ? Number(found.count) : 0,
      })
    }

    res.json(result)
  } catch (error) {
    console.error('GET /stock/daily error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router
