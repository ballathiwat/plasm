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

/** Standard include for document queries */
export const extDocInclude = {
  source: true,
  bloodProduct: true,
  storage: true,
  verifier: { select: { id: true, name: true, username: true } },
  storer: { select: { id: true, name: true, username: true } },
  approver: { select: { id: true, name: true, username: true } },
  createdBy: { select: { id: true, name: true, username: true } },
  bags: { orderBy: { bagNumber: 'asc' as const } },
  attachments: { orderBy: { createdAt: 'asc' as const } },
  timeline: {
    orderBy: { createdAt: 'desc' as const },
    include: { user: { select: { id: true, name: true, username: true } } },
  },
}

/** Format document for API response */
export function formatExtDoc(doc: any) {
  return {
    ...doc,
    receivedDate: doc.receivedDate?.toISOString?.() ?? doc.receivedDate,
    verifiedAt: doc.verifiedAt?.toISOString?.() ?? null,
    storedAt: doc.storedAt?.toISOString?.() ?? null,
    approvedAt: doc.approvedAt?.toISOString?.() ?? null,
    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt,
    updatedAt: doc.updatedAt?.toISOString?.() ?? doc.updatedAt,
    bagCount: doc.bags?.length ?? 0,
    bagRemaining: doc.bags?.filter((b: any) => b.status === 'IN_STOCK').length ?? 0,
    bags: doc.bags?.map((b: any) => ({
      ...b,
      exportedAt: b.exportedAt?.toISOString?.() ?? null,
    })),
    attachments: doc.attachments?.map((a: any) => ({
      id: a.id, fileName: a.fileName, fileType: a.fileType,
      fileSize: a.fileSize, filePath: a.filePath,
    })),
    timeline: doc.timeline?.map((t: any) => ({
      ...t, createdAt: t.createdAt?.toISOString?.() ?? t.createdAt,
    })),
  }
}
