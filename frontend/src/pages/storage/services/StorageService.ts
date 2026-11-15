// ============================================================
//  src/pages/storage/services/StorageService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  GET_BOXES, GET_BOX_SUMMARY, POST_BOX, GET_UNIT_CHECK, MASTER_REMOVAL_REASONS, GET_RACK,
  MASTER_PLASMA_TYPES, MASTER_BLOOD_TYPES, MASTER_ZONES,
} from '../../../helpers/url_helper'
import type {
  StorageBoxItem, CreateBoxPayload, MasterCode, MasterShelf, MasterZone,
  PaginatedBoxResponse, UnitCheckResult,
  UnitRemovalInput, UnitRemovalRecord, RemovalReasonOption,
  StorageListFilter, StorageListQuery, PaginatedListResponse, StorageSummary,
  MoveBoxPayload, RackSlotMap,
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

  /** GET /master/zones/:zoneId/racks/:shelf — ช่องที่มีกล่องแล้วในแต่ละชั้น (ห้อง -30°C) */
  getRackOccupancy: async (zoneId: string, shelf: string): Promise<Record<number, number[]>> => {
    const r = await apiAdapter.get<{ levels: { level: number; slots: Record<string, unknown> }[] }>(
      `${GET_RACK}/${zoneId}/racks/${encodeURIComponent(shelf)}`,
    )
    const out: Record<number, number[]> = {}
    for (const l of r.levels) out[l.level] = Object.keys(l.slots).map(Number)
    return out
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

  // ── หน้ารายการกล่อง (/storage) ──

  /** GET /boxes?view=list&page=&pageSize=&state=&q=&type=&blood=&zoneId=&dateFrom=&dateTo= */
  listBoxes: (query: StorageListQuery) =>
    apiAdapter.get<PaginatedListResponse>(GET_BOXES, {
      view: 'list',
      page: query.page,
      pageSize: query.pageSize,
      state: query.state,
      ...filterParams(query),
    }),

  /** GET /boxes/summary — จำนวนกล่องแยกสถานะ + จำนวน unit ที่ยังจัดเก็บ */
  getBoxSummary: (filter: StorageListFilter = {}) =>
    apiAdapter.get<StorageSummary>(GET_BOX_SUMMARY, filterParams(filter)),

  /** PATCH /boxes/:id/location — ย้ายกล่อง (ห้อง rack ส่ง level + position ด้วย) */
  moveBox: (boxId: string, data: MoveBoxPayload) =>
    apiAdapter.patch<MoveBoxPayload, StorageBoxItem>(`${GET_BOXES}/${boxId}/location`, data),

  /** GET /master/zones/:zoneId/racks/:shelf — กล่องที่วางอยู่ในแต่ละช่อง (ชั้น → ช่อง → กล่อง) */
  getRackSlots: async (zoneId: string, shelf: string): Promise<RackSlotMap> => {
    const r = await apiAdapter.get<{
      levels: { level: number; slots: Record<string, { id: string; boxLabel: string }> }[]
    }>(`${GET_RACK}/${zoneId}/racks/${encodeURIComponent(shelf)}`)
    const out: RackSlotMap = {}
    for (const l of r.levels) {
      out[l.level] = {}
      for (const [position, box] of Object.entries(l.slots)) {
        out[l.level][Number(position)] = { boxId: box.id, boxLabel: box.boxLabel }
      }
    }
    return out
  },
}

/** ตัวกรองของหน้ารายการ → query string (ค่าว่างไม่ส่ง) */
function filterParams(f: StorageListFilter) {
  return {
    q: f.search || undefined,
    type: f.type || undefined,
    blood: f.blood || undefined,
    zoneId: f.zoneId || undefined,
    dateFrom: f.dateFrom || undefined,
    dateTo: f.dateTo || undefined,
  }
}

export default storageService