// src/routes/notifications.ts — การแจ้งเตือนบน TopBar (คำนวณสดจากข้อมูลจริง)
import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { ROLE_LABEL, type CommitteeRole } from '../lib/extCommittee'

const router = Router()
const READ_CAP = 300
const readKey = (uid: string) => `noti-read:${uid}`
const bkkDay = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })

type Noti = {
  id: string
  kind: 'approve' | 'rejected' | 'approved' | 'lowstock'
  group: 'action' | 'info'
  title: string
  detail?: string
  at: string
  read: boolean
  target: { path: string; docId?: string }
}

async function getRead(uid: string): Promise<string[]> {
  const s = await prisma.setting.findUnique({ where: { key: readKey(uid) } })
  const ids = (s?.value as any)?.ids
  return Array.isArray(ids) ? ids : []
}

async function build(uid: string): Promise<Noti[]> {
  const weekAgo = new Date(Date.now() - 7 * 86400000)
  const [mine, rejected, approved, minSetting, stockRows, read] = await Promise.all([
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
    prisma.setting.findUnique({ where: { key: 'minimumStock' } }),
    prisma.$queryRaw<{ blood: string; count: bigint }[]>`
      SELECT b.blood::text AS blood, COUNT(u.id) AS count
      FROM units u JOIN boxes b ON u.box_id = b.id
      WHERE u.status = 'STORED' AND b.status = 'STORED'
      GROUP BY b.blood`,
    getRead(uid),
  ])
  const isRead = (id: string) => read.includes(id)
  const last = (xs: { actedAt: Date | null }[], fb: Date) => xs.reduce((m, x) => (x.actedAt && x.actedAt > m ? x.actedAt : m), fb)
  const out: Noti[] = []

  for (const m of mine) {
    out.push({
      id: `approve:${m.id}`, kind: 'approve', group: 'action',
      title: `รอคุณอนุมัติ ${m.document.docNumber}`,
      detail: `${m.document._count.bags} ถุง — ในฐานะ${ROLE_LABEL[m.role as CommitteeRole]}`,
      at: (m.document.submittedAt ?? m.document.createdAt).toISOString(), read: false,
      target: { path: '/ext-blood', docId: m.document.id },
    })
  }
  for (const d of rejected) {
    const at = last(d.committee, d.createdAt)
    out.push({
      id: `rejected:${d.id}:${at.getTime()}`, kind: 'rejected', group: 'action',
      title: `${d.docNumber} ไม่ผ่านการอนุมัติ`, detail: d.rejectReason ?? 'แก้ไขแล้วส่งใหม่',
      at: at.toISOString(), read: false, target: { path: '/ext-blood', docId: d.id },
    })
  }
  for (const d of approved) {
    const id = `approved:${d.id}`
    out.push({
      id, kind: 'approved', group: 'info', title: `${d.docNumber} อนุมัติครบแล้ว`,
      detail: `${d._count.bags} ถุง พร้อมจัดเก็บ`, at: (d.approvedAt ?? new Date()).toISOString(),
      read: isRead(id), target: { path: '/ext-blood', docId: d.id },
    })
  }
  const min = (minSetting?.value ?? {}) as Record<string, unknown>
  const stock: Record<string, number> = {}
  for (const r of stockRows) stock[r.blood] = Number(r.count)
  const day = bkkDay()
  for (const [g, v] of Object.entries(min)) {
    const need = Number(v), have = stock[g] ?? 0
    if (!Number.isFinite(need) || need <= 0 || have >= need) continue
    const id = `lowstock:${g}:${day}`
    out.push({
      id, kind: 'lowstock', group: 'info', title: `สต็อกหมู่เลือด ${g} ต่ำกว่าขั้นต่ำ`,
      detail: `เหลือ ${have} จาก ${need} units`, at: new Date(`${day}T00:00:00+07:00`).toISOString(),
      read: isRead(id), target: { path: '/' },
    })
  }
  return out.sort((a, b) => (a.group === b.group ? +new Date(b.at) - +new Date(a.at) : a.group === 'action' ? -1 : 1))
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

export default router
