// ============================================================
//  src/pages/settings/services/MasterService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  MASTER_PLASMA_TYPES, MASTER_BLOOD_TYPES, MASTER_ZONES, MASTER_SHELVES,
  MASTER_REMOVAL_REASONS,
} from '../../../helpers/url_helper'
import type { CodeItem, ZoneItem, ShelfItem, RemovalReasonItem } from './SettingsType'

export type CodeKind = 'plasma' | 'blood'
const URL_OF: Record<CodeKind, string> = {
  plasma: MASTER_PLASMA_TYPES,
  blood: MASTER_BLOOD_TYPES,
}

const masterService = {
  listCodes: (kind: CodeKind) => apiAdapter.get<CodeItem[]>(URL_OF[kind]),
  createCode: (kind: CodeKind, data: { code: string; name?: string; color?: string }) =>
    apiAdapter.post<typeof data, CodeItem>(URL_OF[kind], data),
  updateCode: (kind: CodeKind, id: string, data: Partial<CodeItem>) =>
    apiAdapter.patch<typeof data, CodeItem>(`${URL_OF[kind]}/${id}`, data),

  listZones: () => apiAdapter.get<ZoneItem[]>(MASTER_ZONES),
  createZone: (name: string) =>
    apiAdapter.post<{ name: string }, ZoneItem>(MASTER_ZONES, { name }),
  updateZone: (id: string, data: Partial<ZoneItem>) =>
    apiAdapter.patch<typeof data, ZoneItem>(`${MASTER_ZONES}/${id}`, data),

  createShelf: (zoneId: string, code: string) =>
    apiAdapter.post<{ code: string }, ShelfItem>(`${MASTER_ZONES}/${zoneId}/shelves`, { code }),
  updateShelf: (shelfId: string, data: Partial<ShelfItem>) =>
    apiAdapter.patch<typeof data, ShelfItem>(`${MASTER_SHELVES}/${shelfId}`, data),

  // ── หมายเหตุการลบ unit ──
  listRemovalReasons: () => apiAdapter.get<RemovalReasonItem[]>(MASTER_REMOVAL_REASONS),
  createRemovalReason: (name: string) =>
    apiAdapter.post<{ name: string }, RemovalReasonItem>(MASTER_REMOVAL_REASONS, { name }),
  updateRemovalReason: (id: string, data: Partial<RemovalReasonItem>) =>
    apiAdapter.patch<typeof data, RemovalReasonItem>(`${MASTER_REMOVAL_REASONS}/${id}`, data),
}

export default masterService