// src/routes/extCommittee.ts — คณะกรรมการอนุมัติ (รับเลือดจากภายนอก)
// mount: app.use('/api/v1/ext', authGuard, extCommitteeRoutes) ก่อน extRoutes

import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { verifyPin } from '../lib/extPin'
import { extDocInclude, formatExtDoc } from '../lib/extHelpers'
import { COMMITTEE_ROLES, ROLE_LABEL, deriveDocStatus, getRoleRules, type CommitteeRole } from '../lib/extCommittee'

const router = Router()
const fail = (res: Response, e: unknown, tag: string) => { console.error(tag, e); res.status(500).json({ message: 'เกิดข้อผิดพลาด' }) }
const canManage = (doc: { createdById: string | null }, req: Request) => doc.createdById === req.user!.id || req.user!.role === 'ADMIN'
const pinFail = (res: Response, r: any) => res.status(401).json({ message: r.locked ? 'PIN ถูกล็อก 15 นาที' : 'PIN ไม่ถูกต้อง', ...r })
const loadDoc = async (id: string) => formatExtDoc(await prisma.extDocument.findUnique({ where: { id }, include: extDocInclude }))

// ── กติกาหน้าที่ที่แนะนำ (ตามชนิดเลือด) ──
router.get('/committee/rules', async (_req, res) => {
  try { res.json(await getRoleRules()) } catch (e) { fail(res, e, 'GET /ext/committee/rules') }
})

// ── ตัวเลขแท็บ: รอฉันอนุมัติ + จำนวนต่อสถานะ ──
router.get('/committee/counts', async (req, res) => {
  try {
    const uid = req.user!.id
    const [mine, groups] = await Promise.all([
      prisma.extCommittee.count({ where: { userId: uid, status: 'PENDING', document: { status: 'PENDING' } } }),
      prisma.extDocument.groupBy({ by: ['status'], _count: { _all: true } }),
    ])
    const byStatus: Record<string, number> = { ALL: 0 }
    for (const g of groups) { byStatus[g.status] = g._count._all; byStatus.ALL += g._count._all }
    res.json({ mine, byStatus })
  } catch (e) { fail(res, e, 'GET /ext/committee/counts') }
})

// ── เอกสารที่รอฉันอนุมัติ ──
router.get('/committee/inbox', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const where: any = { status: 'PENDING', committee: { some: { userId: req.user!.id, status: 'PENDING' } } }
    if (req.query.search) {
      const s = String(req.query.search)
      where.OR = [{ docNumber: { contains: s, mode: 'insensitive' } }, { bags: { some: { bagNumber: { contains: s, mode: 'insensitive' } } } }]
    }
    const [data, total] = await Promise.all([
      prisma.extDocument.findMany({ where, include: extDocInclude, orderBy: [{ submittedAt: 'asc' }, { createdAt: 'asc' }], skip: (page - 1) * limit, take: limit }),
      prisma.extDocument.count({ where }),
    ])
    res.json({ data: data.map(formatExtDoc), total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) })
  } catch (e) { fail(res, e, 'GET /ext/committee/inbox') }
})

// ── กำหนดรายชื่อคณะกรรมการ (ก่อนส่ง) ──
router.put('/documents/:id/committee', async (req, res) => {
  try {
    const id = String(req.params.id)
    const doc = await prisma.extDocument.findUnique({ where: { id } })
    if (!doc) { res.status(404).json({ message: 'ไม่พบเอกสาร' }); return }
    if (!canManage(doc, req)) { res.status(403).json({ message: 'แก้ไขรายชื่อได้เฉพาะผู้สร้างเอกสาร' }); return }
    if (!['DRAFT', 'REJECTED'].includes(doc.status)) { res.status(400).json({ message: 'แก้รายชื่อได้เฉพาะเอกสารร่างหรือที่ถูกส่งกลับแก้ไข' }); return }

    const members: { userId: string; role: CommitteeRole }[] = Array.isArray(req.body?.members) ? req.body.members : []
    if (members.some((m) => !m?.userId || !COMMITTEE_ROLES.includes(m.role))) { res.status(400).json({ message: 'ข้อมูลคณะกรรมการไม่ถูกต้อง' }); return }
    const keys = members.map((m) => `${m.userId}::${m.role}`)
    if (new Set(keys).size !== members.length) { res.status(400).json({ message: 'มีหน้าที่ซ้ำกัน (คนเดียวกัน + หน้าที่เดียวกัน)' }); return }
    // 1 คนมีได้หลายหน้าที่ → นับผู้ใช้แบบไม่ซ้ำ ไม่เช่นนั้นจะแจ้ง "ไม่พบผู้ใช้" ผิด ๆ
    const uniqueUids = [...new Set(members.map((m) => m.userId))]
    const found = await prisma.user.count({ where: { id: { in: uniqueUids }, active: true } })
    if (found !== uniqueUids.length) { res.status(400).json({ message: 'มีผู้ใช้ที่ไม่พบหรือถูกปิดใช้งาน' }); return }

    await prisma.$transaction([
      prisma.extCommittee.deleteMany({ where: { documentId: id } }),
      prisma.extCommittee.createMany({ data: members.map((m) => ({ documentId: id, userId: m.userId, role: m.role, status: 'DRAFT' as const })) }),
    ])
    res.json(await loadDoc(id))
  } catch (e) { fail(res, e, 'PUT /ext/documents/:id/committee') }
})

// ── ส่งให้คณะกรรมการ → เอกสาร PENDING ทันที ──
router.post('/documents/:id/submit', async (req, res) => {
  try {
    const id = String(req.params.id)
    const doc = await prisma.extDocument.findUnique({ where: { id }, include: { committee: true, bags: true } })
    if (!doc) { res.status(404).json({ message: 'ไม่พบเอกสาร' }); return }
    if (!canManage(doc, req)) { res.status(403).json({ message: 'ส่งได้เฉพาะผู้สร้างเอกสาร' }); return }
    if (!['DRAFT', 'REJECTED'].includes(doc.status)) { res.status(400).json({ message: 'เอกสารนี้ถูกส่งไปแล้ว' }); return }
    if (!doc.committee.length) { res.status(400).json({ message: 'เพิ่มคณะกรรมการอย่างน้อย 1 คน' }); return }
    if (!doc.bags.length) { res.status(400).json({ message: 'สแกนถุงเลือดอย่างน้อย 1 ถุง' }); return }

    await prisma.$transaction([
      prisma.extCommittee.updateMany({ where: { documentId: id }, data: { status: 'PENDING', reason: null, actedAt: null } }),
      prisma.extDocument.update({
        where: { id },
        data: {
          status: 'PENDING', submittedAt: new Date(), rejectReason: null,
          timeline: { create: { action: 'ส่งอนุมัติ', detail: `ส่งให้คณะกรรมการ ${doc.committee.length} คน`, userId: req.user!.id } },
        },
      }),
    ])
    res.json(await loadDoc(id))
  } catch (e) { fail(res, e, 'POST /ext/documents/:id/submit') }
})

// ── ดึงกลับ (ได้เมื่อยังไม่มีใครอนุมัติ) ──
router.post('/documents/:id/recall', async (req, res) => {
  try {
    const id = String(req.params.id)
    const doc = await prisma.extDocument.findUnique({ where: { id }, include: { committee: true } })
    if (!doc) { res.status(404).json({ message: 'ไม่พบเอกสาร' }); return }
    if (!canManage(doc, req)) { res.status(403).json({ message: 'ดึงกลับได้เฉพาะผู้สร้างเอกสาร' }); return }
    if (doc.status !== 'PENDING' || doc.committee.some((m) => m.status !== 'PENDING')) { res.status(400).json({ message: 'ดึงกลับได้เฉพาะเมื่อยังไม่มีใครดำเนินการ' }); return }
    await prisma.$transaction([
      prisma.extCommittee.updateMany({ where: { documentId: id }, data: { status: 'DRAFT' } }),
      prisma.extDocument.update({ where: { id }, data: { status: 'DRAFT', submittedAt: null, timeline: { create: { action: 'ดึงกลับ', detail: 'ดึงเอกสารกลับเพื่อแก้ไข', userId: req.user!.id } } } }),
    ])
    res.json(await loadDoc(id))
  } catch (e) { fail(res, e, 'POST /ext/documents/:id/recall') }
})

/** อนุมัติ/ไม่อนุมัติ "ส่วนของฉัน" แล้วคำนวณสถานะเอกสารใหม่ */
async function decide(docId: string, userId: string, decision: 'approve' | 'reject', reason?: string) {
  return prisma.$transaction(async (tx) => {
    const doc = await tx.extDocument.findUnique({ where: { id: docId } })
    const myPending = await tx.extCommittee.findMany({ where: { documentId: docId, userId, status: 'PENDING' }, include: { user: { select: { name: true } } } })
    if (!doc || doc.status !== 'PENDING' || !myPending.length) return { ok: false as const }
    const now = new Date()
    await tx.extCommittee.updateMany({ where: { id: { in: myPending.map((m) => m.id) } }, data: { status: decision === 'approve' ? 'APPROVED' : 'REJECTED', reason: decision === 'reject' ? reason : null, actedAt: now } })
    const all = await tx.extCommittee.findMany({ where: { documentId: docId } })
    const next = deriveDocStatus(all)
    const data: any = { status: next }
    const me = myPending[0]
    if (next === 'REJECTED') data.rejectReason = `${me.user.name}: ${reason}`
    if (next === 'APPROVED') {
      // เติม field เดิม (verifier/storer/approver) ให้รายงานและหน้ารายละเอียดเดิมยังทำงาน
      const by = (r: CommitteeRole) => all.filter((m) => m.role === r).sort((a, b) => +(a.actedAt ?? 0) - +(b.actedAt ?? 0))[0]
      const v = by('VERIFIER'), s = by('STORER'), a = by('APPROVER')
      if (v) Object.assign(data, { verifierId: v.userId, verifiedAt: v.actedAt, verifierPin: true })
      if (s) Object.assign(data, { storerId: s.userId, storedAt: s.actedAt, storerPin: true })
      Object.assign(data, { approverId: a?.userId ?? userId, approvedAt: now, approverPin: true })
    }
    data.timeline = { create: [
      { action: decision === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ', detail: `${myPending.map((m) => ROLE_LABEL[m.role as CommitteeRole]).join(', ')}${decision === 'reject' ? ` — ${reason}` : ''}`, userId },
      ...(next !== 'PENDING' ? [{ action: next === 'APPROVED' ? 'อนุมัติครบ' : 'ส่งกลับแก้ไข', detail: next === 'APPROVED' ? 'คณะกรรมการอนุมัติครบทุกคน' : 'มีคณะกรรมการไม่อนุมัติ', userId }] : []),
    ] }
    await tx.extDocument.update({ where: { id: docId }, data })
    return { ok: true as const, status: next }
  })
}

router.post('/documents/:id/committee/decide', async (req, res) => {
  try {
    const { decision, reason, pin } = req.body ?? {}
    if (!['approve', 'reject'].includes(decision)) { res.status(400).json({ message: 'decision ไม่ถูกต้อง' }); return }
    if (decision === 'reject' && !String(reason ?? '').trim()) { res.status(400).json({ message: 'กรุณาระบุเหตุผลที่ไม่อนุมัติ' }); return }
    const pr = await verifyPin(req.user!.id, String(pin ?? ''))
    if (!pr.ok) { pinFail(res, pr); return }
    const r = await decide(String(req.params.id), req.user!.id, decision, String(reason ?? '').trim())
    if (!r.ok) { res.status(409).json({ message: 'คุณไม่มีรายการที่รออนุมัติในเอกสารนี้' }); return }
    res.json(await loadDoc(String(req.params.id)))
  } catch (e) { fail(res, e, 'POST /ext/documents/:id/committee/decide') }
})

router.post('/committee/batch-approve', async (req, res) => {
  try {
    const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : []
    const pr = await verifyPin(req.user!.id, String(req.body?.pin ?? ''))
    if (!pr.ok) { pinFail(res, pr); return }
    let count = 0
    for (const id of ids) if ((await decide(id, req.user!.id, 'approve')).ok) count++
    res.json({ count })
  } catch (e) { fail(res, e, 'POST /ext/committee/batch-approve') }
})

export default router
