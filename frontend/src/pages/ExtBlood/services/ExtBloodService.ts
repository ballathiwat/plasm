// frontend/src/pages/ExtBlood/services/ExtBloodService.ts

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  EXT_DOCUMENTS, EXT_SUMMARY, EXT_REPORT,
  EXT_SOURCES, EXT_STORAGES, EXT_BLOOD_PRODUCTS, EXT_EXPORT_REASONS,
  EXT_ATTACHMENTS, EXT_PIN_SETUP, EXT_PIN_VERIFY,
} from '../../../helpers/url_helper'
import type {
  ExtDocument, ExtListFilter, ExtSummary,
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
  getDocument: (id: string) =>
    apiAdapter.getById<ExtDocument>(EXT_DOCUMENTS, id),
  createDocument: (data: FormData) =>
    apiAdapter.upload<ExtDocument>(EXT_DOCUMENTS, data),
  updateDocument: (id: string, data: FormData) =>
    apiAdapter.upload<ExtDocument>(`${EXT_DOCUMENTS}/${id}`, data),
  deleteDocument: (id: string) =>
    apiAdapter.delete<{ message: string }>(`${EXT_DOCUMENTS}/${id}`),

  // Signing
  sign: (id: string, data: { role: string; userId: string; pin: string }) =>
    apiAdapter.post<typeof data, ExtDocument>(`${EXT_DOCUMENTS}/${id}/sign`, data),
  unsign: (id: string, data: { role: string }) =>
    apiAdapter.post<typeof data, ExtDocument>(`${EXT_DOCUMENTS}/${id}/unsign`, data),

  // Approve / Reject
  approve: (id: string, pin: string) =>
    apiAdapter.post<{ pin: string }, ExtDocument>(`${EXT_DOCUMENTS}/${id}/approve`, { pin }),
  reject: (id: string, data: { reason: string; pin: string }) =>
    apiAdapter.post<typeof data, ExtDocument>(`${EXT_DOCUMENTS}/${id}/reject`, data),
  batchApprove: (ids: string[], pin: string) =>
    apiAdapter.post<{ ids: string[]; pin: string }, { count: number }>(`${EXT_DOCUMENTS}/batch-approve`, { ids, pin }),
  batchReject: (ids: string[], data: { reason: string; pin: string }) =>
    apiAdapter.post<{ ids: string[]; reason: string; pin: string }, { count: number }>(`${EXT_DOCUMENTS}/batch-reject`, { ids, ...data }),

  // Export
  exportBags: (id: string, data: { bagIds: string[]; reasonId: string; date: string; note?: string; pin: string }) =>
    apiAdapter.post<typeof data, ExtDocument>(`${EXT_DOCUMENTS}/${id}/export`, data),

  // Attachments
  getAttachments: (id: string) =>
    apiAdapter.get<ExtAttachment[]>(`${EXT_DOCUMENTS}/${id}/attachments`),
  uploadAttachments: (id: string, files: FormData) =>
    apiAdapter.upload<ExtAttachment[]>(`${EXT_DOCUMENTS}/${id}/attachments`, files),
  deleteAttachment: (id: string) =>
    apiAdapter.delete<{ message: string }>(`${EXT_ATTACHMENTS}/${id}`),

  // Summary & Report
  getSummary: () => apiAdapter.get<ExtSummary>(EXT_SUMMARY),
  getReport: (params: Record<string, string>) => apiAdapter.get<unknown>(EXT_REPORT, params),

  // Master data
  getSources: () => apiAdapter.get<ExtSource[]>(EXT_SOURCES),
  getStorages: () => apiAdapter.get<ExtStorage[]>(EXT_STORAGES),
  getBloodProducts: () => apiAdapter.get<ExtBloodProduct[]>(EXT_BLOOD_PRODUCTS),
  getExportReasons: () => apiAdapter.get<ExtExportReason[]>(EXT_EXPORT_REASONS),

  // PIN
  setupPin: (data: { password: string; pin: string }) =>
    apiAdapter.post<typeof data, { message: string }>(EXT_PIN_SETUP, data),
  verifyPin: (pin: string) =>
    apiAdapter.post<{ pin: string }, PinVerifyResult>(EXT_PIN_VERIFY, { pin }),
}

export default extBloodService
