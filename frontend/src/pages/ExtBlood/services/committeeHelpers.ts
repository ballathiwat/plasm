// frontend/src/pages/ExtBlood/services/committeeHelpers.ts
import type { ExtDocument, ExtCommitteeMember, ExtCommitteeRole } from './ExtBloodType'

export const ROLE_ORDER: ExtCommitteeRole[] = ['VERIFIER', 'STORER', 'APPROVER']
export const ROLE_LABEL: Record<ExtCommitteeRole, string> = { VERIFIER: 'ผู้ตรวจ', STORER: 'ผู้จัดเก็บ', APPROVER: 'ผู้อนุมัติ' }

/** แถวของฉันที่ยังรออนุมัติ (เฉพาะเอกสาร PENDING) */
export const myPending = (doc: ExtDocument, userId: string): ExtCommitteeMember | undefined =>
  doc.status === 'PENDING' ? doc.committee?.find((m) => m.userId === userId && m.status === 'PENDING') : undefined

export const approvedCount = (doc: ExtDocument) => doc.committee?.filter((m) => m.status === 'APPROVED').length ?? 0

export const sortCommittee = (list: ExtCommitteeMember[] = []) =>
  [...list].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role))

export const canRecall = (doc: ExtDocument, userId: string, isAdmin: boolean) =>
  doc.status === 'PENDING' && (doc.createdById === userId || doc.createdBy?.id === userId || isAdmin) &&
  (doc.committee ?? []).every((m) => m.status === 'PENDING')
