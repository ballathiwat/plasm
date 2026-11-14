// src/lib/extCommittee.ts — กติกาคณะกรรมการอนุมัติ
import { prisma } from './prisma'

export const COMMITTEE_ROLES = ['VERIFIER', 'STORER', 'APPROVER'] as const
export type CommitteeRole = (typeof COMMITTEE_ROLES)[number]
export const ROLE_LABEL: Record<CommitteeRole, string> = { VERIFIER: 'ผู้ตรวจ', STORER: 'ผู้จัดเก็บ', APPROVER: 'ผู้อนุมัติ' }

/** Setting key: { [bloodProductCode]: CommitteeRole[] } — หน้าที่ที่ "แนะนำ" ให้มี (ไม่บังคับ) */
export const RULES_SETTING_KEY = 'ext_committee_rules'
const DEFAULT_RULE: CommitteeRole[] = ['VERIFIER', 'STORER', 'APPROVER']

export async function getRoleRules(): Promise<Record<string, CommitteeRole[]>> {
  const [setting, products] = await Promise.all([
    prisma.setting.findUnique({ where: { key: RULES_SETTING_KEY } }),
    prisma.masterPlasmaType.findMany({ where: { active: true }, orderBy: { sort: 'asc' } }),
  ])
  const custom = (setting?.value ?? {}) as Record<string, unknown>
  const out: Record<string, CommitteeRole[]> = {}
  for (const p of products) {
    const r = custom[p.code]
    out[p.code] = Array.isArray(r) ? (r.filter((x) => COMMITTEE_ROLES.includes(x as CommitteeRole)) as CommitteeRole[]) : DEFAULT_RULE
  }
  return out
}

/** สถานะเอกสารจากคณะกรรมการ: มีคนไม่อนุมัติ → REJECTED, ครบทุกคน → APPROVED, อื่น ๆ → PENDING */
export function deriveDocStatus(members: { status: string }[]): 'PENDING' | 'APPROVED' | 'REJECTED' {
  if (members.some((m) => m.status === 'REJECTED')) return 'REJECTED'
  if (members.length > 0 && members.every((m) => m.status === 'APPROVED')) return 'APPROVED'
  return 'PENDING'
}
