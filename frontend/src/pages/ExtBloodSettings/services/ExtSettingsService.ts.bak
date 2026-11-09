// frontend/src/pages/ExtBloodSettings/services/ExtSettingsService.ts
import apiAdapter from '../../../helpers/http/apiAdapter'
import { EXT_SOURCES, EXT_STORAGES } from '../../../helpers/url_helper'
import type { ExtSource, ExtStorage } from '../../ExtBlood/services/ExtBloodType'
const svc = {
  getSources: () => apiAdapter.get<ExtSource[]>(EXT_SOURCES),
  createSource: (name: string) => apiAdapter.post<{ name: string }, ExtSource>(EXT_SOURCES, { name }),
  updateSource: (id: string, data: Partial<ExtSource>) => apiAdapter.put<typeof data, ExtSource>(`${EXT_SOURCES}/${id}`, data),
  deleteSource: (id: string) => apiAdapter.delete<{ message: string }>(`${EXT_SOURCES}/${id}`),
  reorderSources: (ids: string[]) => apiAdapter.patch<{ ids: string[] }, void>(`${EXT_SOURCES}/reorder`, { ids }),
  getStorages: () => apiAdapter.get<ExtStorage[]>(EXT_STORAGES),
  createStorage: (name: string) => apiAdapter.post<{ name: string }, ExtStorage>(EXT_STORAGES, { name }),
  updateStorage: (id: string, data: Partial<ExtStorage>) => apiAdapter.put<typeof data, ExtStorage>(`${EXT_STORAGES}/${id}`, data),
  deleteStorage: (id: string) => apiAdapter.delete<{ message: string }>(`${EXT_STORAGES}/${id}`),
  reorderStorages: (ids: string[]) => apiAdapter.patch<{ ids: string[] }, void>(`${EXT_STORAGES}/reorder`, { ids }),
}
export default svc
