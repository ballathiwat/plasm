// src/lib/extHelpers.ts

import { prisma } from './prisma'

/** Generate EXT-{BE year}-{0001} running number */
export async function nextExtDocNumber(): Promise<string> {
  const now = new Date()
  const beYear = now.getFullYear() + 543

  const counter = await prisma.extDocCounter.upsert({
    where: { year: beYear },
    update: { lastNo: { increment: 1 } },
    create: { year: beYear, lastNo: 1 },
  })

  return `EXT-${beYear}-${String(counter.lastNo).padStart(4, '0')}`
}

const userSel = { select: { id: true, name: true, username: true } }

/** Standard include for document queries */
export const extDocInclude = {
  source: true,
  bloodProduct: true,
  storage: true,
  verifier: userSel,
  storer: userSel,
  approver: userSel,
  createdBy: userSel,
  bags: { orderBy: { bagNumber: 'asc' as const } },
  attachments: { orderBy: { createdAt: 'asc' as const } },
  timeline: {
    orderBy: { createdAt: 'desc' as const },
    include: { user: userSel },
  },
  committee: {
    orderBy: { createdAt: 'asc' as const },
    include: { user: userSel },
  },
}

const iso = (d: any) => d?.toISOString?.() ?? d ?? null

/** Format document for API response */
export function formatExtDoc(doc: any) {
  return {
    ...doc,
    receivedDate: iso(doc.receivedDate),
    verifiedAt: iso(doc.verifiedAt),
    storedAt: iso(doc.storedAt),
    approvedAt: iso(doc.approvedAt),
    submittedAt: iso(doc.submittedAt),
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
    bagCount: doc.bags?.length ?? 0,
    bagRemaining: doc.bags?.filter((b: any) => b.status === 'IN_STOCK').length ?? 0,
    bags: doc.bags?.map((b: any) => ({ ...b, exportedAt: iso(b.exportedAt) })),
    attachments: doc.attachments?.map((a: any) => ({
      id: a.id, fileName: a.fileName, fileType: a.fileType,
      fileSize: a.fileSize, filePath: a.filePath,
    })),
    timeline: doc.timeline?.map((t: any) => ({ ...t, createdAt: iso(t.createdAt) })),
    committee: doc.committee?.map((m: any) => ({
      id: m.id, userId: m.userId, role: m.role, status: m.status,
      reason: m.reason ?? null, actedAt: iso(m.actedAt), user: m.user,
    })) ?? [],
  }
}
