// frontend/src/pages/ExtBlood/services/ExtBloodService.ts

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  EXT_DOCUMENTS, EXT_SUMMARY, EXT_REPORT,
  EXT_SOURCES, EXT_STORAGES, EXT_EXPORT_REASONS, MASTER_PLASMA_TYPES,
  EXT_ATTACHMENTS, EXT_PIN_SETUP, EXT_PIN_VERIFY, EXT_COMMITTEE, EXT_USERS,
} from '../../../helpers/url_helper'
import type {
  ExtDocument, ExtListFilter, ExtSummary, ExtCounts, ExtRoleRules, ExtCommitteeRole, UserSummary,
  ExtSource, ExtStorage, ExtBloodProduct, ExtExportReason, ExtAttachment,
} from './ExtBloodType'

export interface ExtPaginatedResponse {
  data: ExtDocument[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PinVerifyResult {
  ok: boolean
  remaining?: number
  locked?: boolean
  lockedUntil?: string
}

const extBloodService = {
  // Documents
  getDocuments: (params: ExtListFilter) =>
    apiAdapter.get<ExtPaginatedResponse>(EXT_DOCUMENTS, params as Record<string, string>),
  getDocument: (id: string) => apiAdapter.getById<ExtDocument>(EXT_DOCUMENTS, id),
  createDocument: (data: FormData) => apiAdapter.upload<ExtDocument>(EXT_DOCUMENTS, data),
  updateDocument: (id: string, data: FormData) => apiAdapter.upload<ExtDocument>(`${EXT_DOCUMENTS}/${id}`, data),
  deleteDocument: (id: string) => apiAdapter.delete<{ message: string }>(`${EXT_DOCUMENTS}/${id}`),

  // Committee (คณะกรรมการอนุมัติ)
  getCounts: () => apiAdapter.get<ExtCounts>(`${EXT_COMMITTEE}/counts`),
  getInbox: (params: ExtListFilter) => apiAdapter.get<ExtPaginatedResponse>(`${EXT_COMMITTEE}/inbox`, params as Record<string, string>),
  getRoleRules: () => apiAdapter.get<ExtRoleRules>(`${EXT_COMMITTEE}/rules`),
  getUsers: () => apiAdapter.get<UserSummary[]>(EXT_USERS),
  setCommittee: (id: string, members: { userId: string; role: ExtCommitteeRole }[]) =>
    apiAdapter.put<{ members: typeof members }, ExtDocument>(`${EXT_DOCUMENTS}/${id}/committee`, { members }),
  submit: (id: string) => apiAdapter.post<Record<string, never>, ExtDocument>(`${EXT_DOCUMENTS}/${id}/submit`, {}),
  recall: (id: string) => apiAdapter.post<Record<string, never>, ExtDocument>(`${EXT_DOCUMENTS}/${id}/recall`, {}),
  decide: (id: string, data: { decision: 'approve' | 'reject'; reason?: string; pin: string }) =>
    apiAdapter.post<typeof data, ExtDocument>(`${EXT_DOCUMENTS}/${id}/committee/decide`, data),
  batchApproveMine: (ids: string[], pin: string) =>
    apiAdapter.post<{ ids: string[]; pin: string }, { count: number }>(`${EXT_COMMITTEE}/batch-approve`, { ids, pin }),

  // Export
  exportBags: (id: string, data: { bagIds: string[]; reasonId: string; date: string; note?: string; pin: string }) =>
    apiAdapter.post<typeof data, ExtDocument>(`${EXT_DOCUMENTS}/${id}/export`, data),

  // Attachments
  /** เพิ่มรูปหลังอนุมัติ (เฉพาะเอกสาร APPROVED) — field "files" */
  uploadPostApprovalImages: (id: string, data: FormData) =>
    apiAdapter.upload<ExtDocument>(`${EXT_DOCUMENTS}/${id}/attachments`, data),
  deleteAttachment: (id: string) => apiAdapter.delete<{ message: string }>(`${EXT_ATTACHMENTS}/${id}`),

  // Summary & Report
  getSummary: () => apiAdapter.get<ExtSummary>(EXT_SUMMARY),
  getReport: (params: Record<string, string>) => apiAdapter.get<unknown>(EXT_REPORT, params),

  // Master data
  getSources: () => apiAdapter.get<ExtSource[]>(EXT_SOURCES),
  getStorages: () => apiAdapter.get<ExtStorage[]>(EXT_STORAGES),
  checkBag: (bagNumber: string, excludeDocId?: string) =>
    apiAdapter.get<{ exists: boolean; bagNumber: string; docNumber?: string; boxLabel?: string }>(
      EXT_DOCUMENTS.replace('/documents', '/bags/check'),
      { bagNumber, ...(excludeDocId ? { excludeDocId } : {}) } as Record<string, string>,
    ),
  getBloodProducts: () => apiAdapter.get<ExtBloodProduct[]>(MASTER_PLASMA_TYPES),
  getExportReasons: () => apiAdapter.get<ExtExportReason[]>(EXT_EXPORT_REASONS),

  // PIN
  setupPin: (data: { password: string; pin: string }) =>
    apiAdapter.post<typeof data, { message: string }>(EXT_PIN_SETUP, data),
  verifyPin: (pin: string) => apiAdapter.post<{ pin: string }, PinVerifyResult>(EXT_PIN_VERIFY, { pin }),
  getPinStatus: () => apiAdapter.get<{ hasPin: boolean; lockedUntil: string | null }>(EXT_PIN_SETUP.replace('/setup', '/status')),
}

export type { ExtAttachment }
export default extBloodService
