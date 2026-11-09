// frontend/src/pages/ExtBloodSettings/services/ExtSettingsService.ts
import apiAdapter from '../../../helpers/http/apiAdapter'
import { EXT_SOURCES, EXT_STORAGES, EXT_BLOOD_PRODUCTS, EXT_EXPORT_REASONS } from '../../../helpers/url_helper'
import type { ExtSource, ExtStorage, ExtBloodProduct, ExtExportReason } from '../../ExtBlood/services/ExtBloodType'

const svc = {
  // Sources
  getSources: () => apiAdapter.get<ExtSource[]>(EXT_SOURCES),
  createSource: (name: string) => apiAdapter.post<{ name: string }, ExtSource>(EXT_SOURCES, { name }),
  updateSource: (id: string, data: Partial<ExtSource>) => apiAdapter.put<typeof data, ExtSource>(`${EXT_SOURCES}/${id}`, data),
  deleteSource: (id: string) => apiAdapter.delete<{ message: string }>(`${EXT_SOURCES}/${id}`),
  reorderSources: (ids: string[]) => apiAdapter.patch<{ ids: string[] }, void>(`${EXT_SOURCES}/reorder`, { ids }),

  // Storages
  getStorages: () => apiAdapter.get<ExtStorage[]>(EXT_STORAGES),
  createStorage: (name: string) => apiAdapter.post<{ name: string }, ExtStorage>(EXT_STORAGES, { name }),
  updateStorage: (id: string, data: Partial<ExtStorage>) => apiAdapter.put<typeof data, ExtStorage>(`${EXT_STORAGES}/${id}`, data),
  deleteStorage: (id: string) => apiAdapter.delete<{ message: string }>(`${EXT_STORAGES}/${id}`),
  reorderStorages: (ids: string[]) => apiAdapter.patch<{ ids: string[] }, void>(`${EXT_STORAGES}/reorder`, { ids }),

  // Blood Products (nameField = code)
  getBloodProducts: () => apiAdapter.get<ExtBloodProduct[]>(EXT_BLOOD_PRODUCTS),
  createBloodProduct: (code: string) => apiAdapter.post<{ code: string }, ExtBloodProduct>(EXT_BLOOD_PRODUCTS, { code }),
  updateBloodProduct: (id: string, data: Partial<ExtBloodProduct>) => apiAdapter.put<typeof data, ExtBloodProduct>(`${EXT_BLOOD_PRODUCTS}/${id}`, data),
  deleteBloodProduct: (id: string) => apiAdapter.delete<{ message: string }>(`${EXT_BLOOD_PRODUCTS}/${id}`),
  reorderBloodProducts: (ids: string[]) => apiAdapter.patch<{ ids: string[] }, void>(`${EXT_BLOOD_PRODUCTS}/reorder`, { ids }),

  // Export Reasons
  getExportReasons: () => apiAdapter.get<ExtExportReason[]>(EXT_EXPORT_REASONS),
  createExportReason: (name: string) => apiAdapter.post<{ name: string }, ExtExportReason>(EXT_EXPORT_REASONS, { name }),
  updateExportReason: (id: string, data: Partial<ExtExportReason>) => apiAdapter.put<typeof data, ExtExportReason>(`${EXT_EXPORT_REASONS}/${id}`, data),
  deleteExportReason: (id: string) => apiAdapter.delete<{ message: string }>(`${EXT_EXPORT_REASONS}/${id}`),
  reorderExportReasons: (ids: string[]) => apiAdapter.patch<{ ids: string[] }, void>(`${EXT_EXPORT_REASONS}/reorder`, { ids }),
}
export default svc
