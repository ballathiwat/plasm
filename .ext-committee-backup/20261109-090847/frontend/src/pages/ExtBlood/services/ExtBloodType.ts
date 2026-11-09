// frontend/src/pages/ExtBlood/services/ExtBloodType.ts

export type ExtDocStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPORTED'
  | 'CANCELLED'

export type ExtBagStatus = 'IN_STOCK' | 'EXPORTED'

export interface UserSummary {
  id: string
  name: string
  username: string
}

export interface ExtSource {
  id: string; name: string; locked: boolean; active: boolean; sort: number
}
export interface ExtStorage {
  id: string; name: string; active: boolean; sort: number
}
export interface ExtBloodProduct {
  id: string; code: string; name?: string; active: boolean; sort: number
}
export interface ExtExportReason {
  id: string; name: string; active: boolean; sort: number
}

export interface ExtBag {
  id: string
  bagNumber: string
  status: ExtBagStatus
  exportedAt?: string
}

export interface ExtAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  filePath: string
}

export interface ExtTimelineEntry {
  id: string
  action: string
  detail: string
  user?: UserSummary
  createdAt: string
}

export interface ExtDocument {
  id: string
  docNumber: string
  receivedDate: string
  source: ExtSource
  bloodProduct: ExtBloodProduct
  bloodGroup: string
  boxLabel: string
  storage: ExtStorage
  status: ExtDocStatus
  editReason?: string
  deferApproval: boolean
  verifier?: UserSummary
  verifiedAt?: string
  verifierPin: boolean
  storer?: UserSummary
  storedAt?: string
  storerPin: boolean
  approver?: UserSummary
  approvedAt?: string
  approverPin: boolean
  rejectReason?: string
  bags: ExtBag[]
  attachments: ExtAttachment[]
  timeline: ExtTimelineEntry[]
  bagCount: number
  bagRemaining: number
  createdBy?: UserSummary
  createdById?: string
  createdAt: string
  submittedAt?: string | null
  committee?: ExtCommitteeMember[]
}

export interface ExtListFilter {
  dateFrom?: string
  dateTo?: string
  sourceId?: string
  bloodProductId?: string
  bloodGroup?: string
  status?: ExtDocStatus
  search?: string
  page?: number
  limit?: number
}

export interface ExtSummary {
  receivedThisMonth: number
  remaining: number
  pendingApproval: number
  exportedThisMonth: number
}

export type ExtCommitteeRole = 'VERIFIER' | 'STORER' | 'APPROVER'
export type ExtCommitteeStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ExtCommitteeMember {
  id: string
  userId: string
  role: ExtCommitteeRole
  status: ExtCommitteeStatus
  reason?: string | null
  actedAt?: string | null
  user: UserSummary
}

export interface ExtCounts { mine: number; byStatus: Record<string, number> }
export type ExtRoleRules = Record<string, ExtCommitteeRole[]>
