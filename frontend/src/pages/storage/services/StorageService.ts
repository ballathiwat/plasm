// ============================================================
//  src/pages/storage/services/StorageService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  GET_BOXES, POST_BOX,
  MASTER_PLASMA_TYPES, MASTER_BLOOD_TYPES, MASTER_ZONES,
} from '../../../helpers/url_helper'
import type {
  StorageBoxItem, CreateBoxPayload, MasterCode, MasterShelf, MasterZone,
} from './StorageType'

const storageService = {
  /** GET /boxes?status=stored */
  getStoredBoxes: async (): Promise<StorageBoxItem[]> => {
    return await apiAdapter.get<StorageBoxItem[]>(GET_BOXES, { status: 'stored' })
  },

  /** POST /boxes  (backend ออก boxLabel ให้เอง) */
  createBox: async (data: CreateBoxPayload): Promise<StorageBoxItem> => {
    return await apiAdapter.post<CreateBoxPayload, StorageBoxItem>(POST_BOX, data)
  },

  /** GET /boxes/next-label?type=&blood= */
  getNextLabel: async (type: string, blood: string): Promise<{ label: string; year: number }> => {
    return await apiAdapter.get<{ label: string; year: number }>(`${GET_BOXES}/next-label`, { type, blood })
  },

  listPlasmaTypes: () => apiAdapter.get<MasterCode[]>(MASTER_PLASMA_TYPES),
  listBloodTypes: () => apiAdapter.get<MasterCode[]>(MASTER_BLOOD_TYPES),
  listZones: () => apiAdapter.get<MasterZone[]>(MASTER_ZONES),

  // ── เพิ่มข้อมูลหลักหน้างาน (backend เปิดให้ STAFF เพิ่มได้ แต่เปิด/ปิดใช้งานได้เฉพาะ ADMIN) ──
  /** POST /master/plasma-types */
  createPlasmaType: (code: string) =>
    apiAdapter.post<{ code: string }, MasterCode>(MASTER_PLASMA_TYPES, { code }),

  /** POST /master/blood-types  (backend แปลงเป็นตัวพิมพ์ใหญ่ให้) */
  createBloodType: (code: string) =>
    apiAdapter.post<{ code: string }, MasterCode>(MASTER_BLOOD_TYPES, { code }),

  /** POST /master/zones */
  createZone: (name: string) =>
    apiAdapter.post<{ name: string }, MasterZone>(MASTER_ZONES, { name }),

  /** POST /master/zones/:id/shelves  (backend แปลงเป็นตัวพิมพ์ใหญ่ให้) */
  createShelf: (zoneId: string, code: string) =>
    apiAdapter.post<{ code: string }, MasterShelf>(`${MASTER_ZONES}/${zoneId}/shelves`, { code }),
}

export default storageService