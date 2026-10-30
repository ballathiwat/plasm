// ============================================================
//  src/pages/storage/services/StorageService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  GET_BOXES, POST_BOX, GET_UNIT_CHECK, MASTER_REMOVAL_REASONS,
  MASTER_PLASMA_TYPES, MASTER_BLOOD_TYPES, MASTER_ZONES,
} from '../../../helpers/url_helper'
import type {
  StorageBoxItem, CreateBoxPayload, MasterCode, MasterShelf, MasterZone,
  PaginatedBoxResponse, UnitCheckResult,
  UnitRemovalInput, UnitRemovalRecord, RemovalReasonOption,
} from './StorageType'

const storageService = {
  /** GET /boxes?status=stored (ไม่มี pagination — ใช้กับ Map/Withdraw) */
  getStoredBoxes: async (): Promise<StorageBoxItem[]> => {
    return await apiAdapter.get<StorageBoxItem[]>(GET_BOXES, { status: 'stored' })
  },

  /** GET /boxes?status=stored&page=&pageSize= (paginated) */
  getStoredBoxesPaged: async (page: number, pageSize: number): Promise<PaginatedBoxResponse> => {
    return await apiAdapter.get<PaginatedBoxResponse>(GET_BOXES, {
      status: 'stored', page: String(page), pageSize: String(pageSize),
    })
  },

  /** POST /boxes  (backend ออก boxLabel ให้เอง) */
  createBox: async (data: CreateBoxPayload): Promise<StorageBoxItem> => {
    return await apiAdapter.post<CreateBoxPayload, StorageBoxItem>(POST_BOX, data)
  },

  /** GET /boxes/next-label?type=&blood= */
  getNextLabel: async (type: string, blood: string): Promise<{ label: string; year: number }> => {
    return await apiAdapter.get<{ label: string; year: number }>(`${GET_BOXES}/next-label`, { type, blood })
  },
    /** PUT /boxes/:id/units */
  updateBoxUnits: async (
    boxId: string,
    units: string[],
    removals: UnitRemovalInput[] = [],
  ): Promise<StorageBoxItem> => {
    return await apiAdapter.put<{ units: string[]; removals: UnitRemovalInput[] }, StorageBoxItem>(
      `${GET_BOXES}/${boxId}/units`,
      { units, removals },
    )
  },

  /** GET /master/removal-reasons — ตัวเลือกหมายเหตุการลบ */
  listRemovalReasons: async (): Promise<RemovalReasonOption[]> => {
    return await apiAdapter.get<RemovalReasonOption[]>(MASTER_REMOVAL_REASONS)
  },

  /** GET /boxes/:id/removals — ประวัติการลบ unit พร้อมหมายเหตุ */
  getBoxRemovals: async (boxId: string): Promise<UnitRemovalRecord[]> => {
    return await apiAdapter.get<UnitRemovalRecord[]>(`${GET_BOXES}/${boxId}/removals`)
  },

  /** GET /units/check?unit= — ตรวจว่ามีเลข unit นี้ในระบบแล้วหรือไม่ (รวมที่นำออกแล้ว) */
  checkUnit: async (unit: string): Promise<UnitCheckResult> => {
    return await apiAdapter.get<UnitCheckResult>(GET_UNIT_CHECK, { unit })
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

    /** PATCH /boxes/:id/location — แก้ไขตำแหน่งจัดเก็บ */
  updateBoxLocation: async (boxId: string, zoneId: string, shelf: string): Promise<StorageBoxItem> => {
    return await apiAdapter.patch<{ zoneId: string; shelf: string }, StorageBoxItem>(
      `${GET_BOXES}/${boxId}/location`,
      { zoneId, shelf }
    )
  },
}

export default storageService