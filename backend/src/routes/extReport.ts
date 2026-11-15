// backend/src/routes/extReport.ts
// รายงานรับเลือดจากภายนอก — mount ที่ /api/v1/ext/reports (ผ่าน authGuard: ADMIN + STAFF)
//   GET /receipts        สรุป KPI + กราฟ + ตารางสรุป
//   GET /receipts/rows   รายการเอกสารแบบแบ่งหน้า + ผลรวมทุกหน้า

import { Router } from 'express'
import type { Request, Response } from 'express'
import type { ZodError } from 'zod'
import {
  reportQuerySchema,
  reportRowsQuerySchema,
  getReceiptsReport,
  getReceiptRows,
} from '../lib/extReport'

const router = Router()

const badRequest = (res: Response, error: ZodError): void => {
  res.status(400).json({
    message: 'พารามิเตอร์ไม่ถูกต้อง',
    errors: error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
  })
}

const fail = (res: Response, e: unknown, tag: string): void => {
  console.error(tag, e)
  res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
}

router.get('/receipts', async (req: Request, res: Response) => {
  const parsed = reportQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    badRequest(res, parsed.error)
    return
  }
  try {
    res.json(await getReceiptsReport(parsed.data))
  } catch (e) {
    fail(res, e, 'GET /ext/reports/receipts')
  }
})

router.get('/receipts/rows', async (req: Request, res: Response) => {
  const parsed = reportRowsQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    badRequest(res, parsed.error)
    return
  }
  try {
    res.json(await getReceiptRows(parsed.data))
  } catch (e) {
    fail(res, e, 'GET /ext/reports/receipts/rows')
  }
})

export default router
