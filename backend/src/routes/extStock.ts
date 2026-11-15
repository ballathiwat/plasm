// backend/src/routes/extStock.ts
// เลือดจากภายนอกที่ยังอยู่ในคลัง — mount ที่ /api/v1/ext/stock (ผ่าน authGuard: ADMIN + STAFF)
//   GET /?blood=&type=   1 แถว = 1 เอกสาร/กล่อง ที่อนุมัติแล้วและยังมีถุง IN_STOCK
// ใช้กับหน้าแผนผังจัดเก็บ แท็บ "เก่าสุด / ใหม่สุด" (ภายนอก)

import { Router } from 'express'
import type { Request, Response } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

const router = Router()

const MAX_CODE_LENGTH = 30

/** ค่าจาก query: ต้องเป็น string เดียว (ส่งซ้ำหลายค่า → undefined) */
const queryText = (v: unknown): string | undefined =>
  typeof v === 'string' ? v.trim() : v === undefined ? '' : undefined

/**
 * หมู่เลือดที่ต้องตรง:
 *  - ระบุ Rh ("A+", "A-") → ตรงตัว
 *  - ไม่ระบุ Rh ("A")      → รวม "A", "A+", "A-"
 */
const bloodGroupsOf = (blood: string): string[] => {
  const code = blood.toUpperCase().replace(/−/g, '-')
  return /[+-]$/.test(code) ? [code] : [code, `${code}+`, `${code}-`]
}

router.get('/', async (req: Request, res: Response) => {
  const blood = queryText(req.query.blood)
  const type = queryText(req.query.type)
  if (
    blood === undefined || type === undefined ||
    blood.length > MAX_CODE_LENGTH || type.length > MAX_CODE_LENGTH
  ) {
    res.status(400).json({ message: 'พารามิเตอร์ blood / type ไม่ถูกต้อง' })
    return
  }

  try {
    const where: Prisma.ExtDocumentWhereInput = {
      status: 'APPROVED',
      bags: { some: { status: 'IN_STOCK' } },
    }
    if (blood) where.bloodGroup = { in: bloodGroupsOf(blood) }
    if (type) where.bloodProduct = { code: type }

    const docs = await prisma.extDocument.findMany({
      where,
      select: {
        id: true,
        docNumber: true,
        boxLabel: true,
        bloodGroup: true,
        receivedDate: true,
        source: { select: { name: true } },
        storage: { select: { name: true } },
        bloodProduct: { select: { code: true } },
        _count: { select: { bags: { where: { status: 'IN_STOCK' } } } },
      },
      orderBy: [{ receivedDate: 'asc' }, { boxLabel: 'asc' }],
    })

    res.json(
      docs.map((d) => ({
        id: d.id,
        boxLabel: d.boxLabel,
        docNumber: d.docNumber,
        type: d.bloodProduct.code,
        blood: d.bloodGroup,
        source: d.source.name,
        location: d.storage.name,
        bags: d._count.bags,
        receivedDate: d.receivedDate.toISOString().split('T')[0],
      })),
    )
  } catch (e) {
    console.error('GET /ext/stock', e)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router
