// ============================================================
//  src/pages/rack/services/RackService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  GET_RACK, GET_BOX_SEARCH, GET_BOXES, POST_BOX, POST_BOX_WITHDRAW_UNITS,
  GET_UNIT_CHECK, MASTER_ZONES, MASTER_PLASMA_TYPES, MASTER_BLOOD_TYPES,
  MASTER_REMOVAL_REASONS, SLOT_LOCKS,
} from '../../../helpers/url_helper'
import type {
  RackData, RackZone, RackSearchResult, MasterOption, RemovalReason, UnitCheck,
} from './RackType'

export interface CreateRackBoxPayload {
  type: string
  blood: string
  zoneId: string
  shelf: string
  level: number
  position: number
  collectionDate: string
  units: string[]
}

export interface LockPayload {
  zoneId: string
  shelf: string
  level: number
  position: number
}

const rackService = {
  listZones: () => apiAdapter.get<RackZone[]>(MASTER_ZONES),
  listPlasmaTypes: () => apiAdapter.get<MasterOption[]>(MASTER_PLASMA_TYPES),
  listBloodTypes: () => apiAdapter.get<MasterOption[]>(MASTER_BLOOD_TYPES),
  listRemovalReasons: () => apiAdapter.get<RemovalReason[]>(MASTER_REMOVAL_REASONS),

  /** GET /master/zones/:zoneId/racks/:shelf */
  getRack: (zoneId: string, shelf: string) =>
    apiAdapter.get<RackData>(`${GET_RACK}/${zoneId}/racks/${encodeURIComponent(shelf)}`),

  /** GET /boxes/search?q= */
  search: (q: string) => apiAdapter.get<RackSearchResult[]>(GET_BOX_SEARCH, { q }),

  /** GET /boxes/next-label?type=&blood= */
  nextLabel: (type: string, blood: string) =>
    apiAdapter.get<{ label: string }>(`${GET_BOXES}/next-label`, { type, blood }),

  /** GET /units/check?unit= */
  checkUnit: (unit: string) => apiAdapter.get<UnitCheck>(GET_UNIT_CHECK, { unit }),

  /** POST /boxes (พร้อม level/position) */
  createBox: (data: CreateRackBoxPayload) =>
    apiAdapter.post<CreateRackBoxPayload, { id: string; boxLabel: string; units: string[] }>(POST_BOX, data),

  /** POST /boxes/:id/withdraw { units } */
  withdrawUnits: (boxId: string, units: string[]) =>
    apiAdapter.post<{ units: string[] }, { allWithdrawn: boolean; count: number }>(
      `${POST_BOX_WITHDRAW_UNITS}/${boxId}/withdraw`, { units },
    ),

  /** PUT /boxes/:id/units */
  updateUnits: (boxId: string, units: string[], removals: { unitNumber: string; reasonId: string; detail?: string }[]) =>
    apiAdapter.put(`${GET_BOXES}/${boxId}/units`, { units, removals }),

  /** PATCH /boxes/:id/location */
  moveBox: (boxId: string, data: { zoneId: string; shelf: string; level: number; position: number }) =>
    apiAdapter.patch(`${GET_BOXES}/${boxId}/location`, data),

  // ── Slot locks ──
  acquireLock: (data: LockPayload) =>
    apiAdapter.post<LockPayload, { id: string; expiresAt: string }>(SLOT_LOCKS, data),
  heartbeatLock: (id: string) => apiAdapter.put<undefined, { id: string }>(`${SLOT_LOCKS}/${id}`),
  releaseLock: (id: string) => apiAdapter.delete(`${SLOT_LOCKS}/${id}`),
}

export default rackService
