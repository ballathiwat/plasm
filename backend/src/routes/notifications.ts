// src/routes/notifications.ts — การแจ้งเตือนบน TopBar (คำนวณสดจากข้อมูลจริง)
import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { ROLE_LABEL, type CommitteeRole } from '../lib/extCommittee'
import { buildMinStockStatus, sortByCritical, alertDetail, cellKey, NOTI_PREFIX } from '../lib/minStock'

const router = Router()
const READ_CAP = 300
const readKey = (uid: string) => `noti-read:${uid}`

type Noti = {
  id: string
  kind: 'approve' | 'rejected' | 'approved' | 'stock-danger' | 'stock-warning'
  group: 'action' | 'info'
  title: string
  detail?: string
  at: string
  read: boolean
  /** หัวกลุ่มย่อยของ info เช่น "สต็อก FFP" */
  section?: string
  ackable?: boolean
  acknowledged?: boolean
  target: { path: string; docId?: string; cell?: string }
}

async function getRead(uid: string): Promise<string[]> {
  const s = await prisma.setting.findUnique({ where: { key: readKey(uid) } })
  const ids = (s?.value as { ids?: unknown } | null)?.ids
  return Array.isArray(ids) ? ids.map(String) : []
}

async function build(uid: string): Promise<Noti[]> {
  const weekAgo = new Date(Date.now() - 7 * 86400000)
  const [mine, rejected, approved, minStock, read] = await Promise.all([
    prisma.extCommittee.findMany({
      where: { userId: uid, status: 'PENDING', document: { status: 'PENDING' } },
      include: { document: { select: { id: true, docNumber: true, submittedAt: true, createdAt: true, _count: { select: { bags: true } } } } },
      orderBy: { createdAt: 'asc' }, take: 50,
    }),
    prisma.extDocument.findMany({
      where: { createdById: uid, status: 'REJECTED' },
      select: { id: true, docNumber: true, rejectReason: true, createdAt: true, committee: { select: { actedAt: true } } },
      take: 20,
    }),
    prisma.extDocument.findMany({
      where: { createdById: uid, status: 'APPROVED', approvedAt: { gte: weekAgo } },
      select: { id: true, docNumber: true, approvedAt: true, _count: { select: { bags: true } } },
      orderBy: { approvedAt: 'desc' }, take: 20,
    }),
    buildMinStockStatus(),
    getRead(uid),
  ])
  const isRead = (id: string) => read.includes(id)
  const last = (xs: { actedAt: Date | null }[], fb: Date) => xs.reduce((m, x) => (x.actedAt && x.actedAt > m ? x.actedAt : m), fb)
  const actions: Noti[] = []
  const info: Noti[] = []

  for (const m of mine) {
    actions.push({
      id: `approve:${m.id}`, kind: 'approve', group: 'action',
      title: `รอคุณอนุมัติ ${m.document.docNumber}`,
      detail: `${m.document._count.bags} ถุง — ในฐานะ${ROLE_LABEL[m.role as CommitteeRole]}`,
      at: (m.document.submittedAt ?? m.document.createdAt).toISOString(), read: false,
      target: { path: '/ext-blood', docId: m.document.id },
    })
  }
  for (const d of rejected) {
    const at = last(d.committee, d.createdAt)
    actions.push({
      id: `rejected:${d.id}:${at.getTime()}`, kind: 'rejected', group: 'action',
      title: `${d.docNumber} ไม่ผ่านการอนุมัติ`, detail: d.rejectReason ?? 'แก้ไขแล้วส่งใหม่',
      at: at.toISOString(), read: false, target: { path: '/ext-blood', docId: d.id },
    })
  }
  for (const d of approved) {
    const id = `approved:${d.id}`
    info.push({
      id, kind: 'approved', group: 'info', title: `${d.docNumber} อนุมัติครบแล้ว`,
      detail: `${d._count.bags} ถุง พร้อมจัดเก็บ`, at: (d.approvedAt ?? new Date()).toISOString(),
      read: isRead(id), target: { path: '/ext-blood', docId: d.id },
    })
  }

  // ── สต็อกต่ำราย ชนิด × หมู่ (แทน lowstock รายหมู่เดิม) ──
  // ลำดับ: ชนิดที่มี danger ก่อน → ในชนิดเดียวกัน danger ก่อน แล้วเรียง % ของขั้นต่ำน้อยสุด
  const alerts = minStock.items.filter((i) => i.notificationId && (i.status === 'danger' || i.status === 'warning')).sort(sortByCritical)
  const typeOrder = Array.from(new Set(alerts.map((i) => i.type)))
  const stock: Noti[] = alerts
    .sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type) || sortByCritical(a, b))
    .map((i) => {
      const id = i.notificationId!
      return {
        id, kind: i.status === 'danger' ? 'stock-danger' as const : 'stock-warning' as const, group: 'info' as const,
        section: `สต็อก ${i.type}`, title: `${i.type} หมู่ ${i.group}`, detail: alertDetail(i),
        at: i.since ?? new Date().toISOString(),
        read: i.acknowledged || isRead(id), ackable: !i.acknowledged, acknowledged: i.acknowledged,
        target: { path: '/', cell: cellKey(i.type, i.group) },
      }
    })

  const byNewest = (a: Noti, b: Noti) => +new Date(b.at) - +new Date(a.at)
  // "ต้องดำเนินการ" → กลุ่มสต็อก → "แจ้งให้ทราบ" อื่นๆ
  return [...actions.sort(byNewest), ...stock, ...info.sort(byNewest)]
}

// GET /api/v1/notifications
router.get('/', async (req, res) => {
  try {
    const items = await build(req.user!.id)
    res.json({ items, unread: items.filter((n) => !n.read).length })
  } catch (e) { console.error('GET /notifications', e); res.status(500).json({ message: 'เกิดข้อผิดพลาด' }) }
})

// POST /api/v1/notifications/read  { ids?: string[] } — action items หายไปเองเมื่อดำเนินการแล้ว
router.post('/read', async (req, res) => {
  try {
    const uid = req.user!.id
    let ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : (await build(uid)).filter((n) => n.group === 'info').map((n) => n.id)
    ids = ids.filter((id) => !id.startsWith('approve:') && !id.startsWith('rejected:'))
    const merged = Array.from(new Set([...(await getRead(uid)), ...ids])).slice(-READ_CAP)
    await prisma.setting.upsert({ where: { key: readKey(uid) }, update: { value: { ids: merged } }, create: { key: readKey(uid), value: { ids: merged } } })
    res.json({ ok: true })
  } catch (e) { console.error('POST /notifications/read', e); res.status(500).json({ message: 'เกิดข้อผิดพลาด' }) }
})

// POST /api/v1/notifications/:id/ack — รับทราบการแจ้งเตือนสต็อกต่ำ (ผู้ใช้ที่เข้าสู่ระบบทุกคน)
// รับทราบแล้วมีผลกับทุกคน และถูกล้างเองเมื่อคู่นั้นเปลี่ยนสถานะ (เช่น ใกล้ต่ำ → ต่ำกว่าขั้นต่ำ)
router.post('/:id/ack', async (req, res) => {
  try {
    const id = String(req.params.id ?? '')
    if (!id.startsWith(NOTI_PREFIX)) { res.status(400).json({ message: 'การแจ้งเตือนนี้รับทราบไม่ได้' }); return }
    const alertId = id.slice(NOTI_PREFIX.length)
    const alert = await prisma.stockAlert.findUnique({ where: { id: alertId } })
    if (!alert) { res.status(404).json({ message: 'ไม่พบการแจ้งเตือน — สถานะสต็อกอาจเปลี่ยนไปแล้ว' }); return }
    // updateMany + เงื่อนไข: กันรับทราบซ้ำทับชื่อคนแรก
    await prisma.stockAlert.updateMany({
      where: { id: alertId, acknowledgedAt: null },
      data: { acknowledgedAt: new Date(), acknowledgedById: req.user!.id },
    })
    const done = await prisma.stockAlert.findUnique({ where: { id: alertId }, include: { acknowledgedBy: { select: { name: true } } } })
    res.json({ ok: true, acknowledgedAt: done?.acknowledgedAt?.toISOString() ?? null, acknowledgedBy: done?.acknowledgedBy?.name ?? null })
  } catch (e) { console.error('POST /notifications/:id/ack', e); res.status(500).json({ message: 'เกิดข้อผิดพลาด' }) }
})

export default router
