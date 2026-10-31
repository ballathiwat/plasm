// src/routes/locks.ts
// ล็อกช่อง rack ระหว่างแก้ไข — TTL 60s, ต่ออายุด้วย heartbeat (frontend ส่งทุก 20s)

import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { LOCK_TTL_MS, parseSlot, purgeExpiredLocks, HttpError } from '../lib/rack'

const router = Router()

const expiry = () => new Date(Date.now() + LOCK_TTL_MS)

// ===== POST /api/v1/locks  { zoneId, shelf, level, position } =====
// 200 ถ้าได้ lock หรือต่ออายุของตัวเอง · 409 { message, userName } ถ้าคนอื่นถืออยู่
router.post('/', async (req, res) => {
  try {
    const userId = req.user!.id
    const zoneId = String(req.body.zoneId ?? '').trim()
    const shelf = String(req.body.shelf ?? '').trim().toUpperCase()
    const slot = parseSlot(req.body.level, req.body.position)
    if (!zoneId || !shelf || !slot) {
      res.status(400).json({ message: 'กรุณาระบุสถานที่ ชั้นวาง ชั้น และช่อง' })
      return
    }

    await purgeExpiredLocks(prisma)
    const where = { zoneId, shelf, ...slot }

    const existing = await prisma.slotLock.findUnique({
      where: { zoneId_shelf_level_position: where },
      include: { user: { select: { name: true } } },
    })

    if (existing && existing.userId !== userId) {
      res.status(409).json({
        message: `${existing.user.name} กำลังแก้ไขช่องนี้อยู่`,
        userName: existing.user.name,
      })
      return
    }

    const lock = existing
      ? await prisma.slotLock.update({ where: { id: existing.id }, data: { expiresAt: expiry() } })
      : await prisma.slotLock.create({ data: { ...where, userId, expiresAt: expiry() } })

    res.json({ id: lock.id, expiresAt: lock.expiresAt.toISOString() })
  } catch (e: any) {
    if (e instanceof HttpError) { res.status(e.status).json({ message: e.message }); return }
    if (e?.code === 'P2002') { res.status(409).json({ message: 'ช่องนี้ถูกล็อกโดยผู้ใช้อื่นแล้ว' }); return }
    if (e?.code === 'P2003') { res.status(404).json({ message: 'ไม่พบสถานที่' }); return }
    console.error('POST /locks error:', e)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== PUT /api/v1/locks/:id — heartbeat (+60s) =====
router.put('/:id', async (req, res) => {
  try {
    const lock = await prisma.slotLock.findUnique({ where: { id: req.params.id } })
    if (!lock || lock.userId !== req.user!.id) {
      res.status(404).json({ message: 'ไม่พบ lock หรือหมดอายุแล้ว' })
      return
    }
    const updated = await prisma.slotLock.update({
      where: { id: lock.id },
      data: { expiresAt: expiry() },
    })
    res.json({ id: updated.id, expiresAt: updated.expiresAt.toISOString() })
  } catch (e) {
    console.error('PUT /locks/:id error:', e)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== POST /api/v1/locks/:id/release — release ผ่าน navigator.sendBeacon ตอนปิดแท็บ =====
router.post('/:id/release', async (req, res) => {
  try {
    await prisma.slotLock.deleteMany({ where: { id: req.params.id, userId: req.user!.id } })
    res.json({ success: true })
  } catch (e) {
    console.error('POST /locks/:id/release error:', e)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== DELETE /api/v1/locks/:id — release =====
router.delete('/:id', async (req, res) => {
  try {
    await prisma.slotLock.deleteMany({ where: { id: req.params.id, userId: req.user!.id } })
    res.json({ success: true })
  } catch (e) {
    console.error('DELETE /locks/:id error:', e)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router
