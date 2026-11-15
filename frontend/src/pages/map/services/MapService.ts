// ============================================================
//  src/pages/map/services/MapService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { EXT_STOCK, GET_BOXES, MASTER_ZONES } from '../../../helpers/url_helper'
import type { ExtStockRaw, MapBoxRaw, MapFilters, MapZoneRaw } from './MapType'

/** ไม่ส่ง blood/type เมื่อเลือก "ทั้งหมด" */
const filterParams = (filters: MapFilters): Record<string, string> => {
  const params: Record<string, string> = {}
  if (filters.blood) params.blood = filters.blood
  if (filters.type) params.type = filters.type
  return params
}

const mapService = {
  /**
   * GET /boxes?status=stored[&blood=A][&type=FFP] → aggregate by zone + shelf
   * กรองที่ backend
   */
  getStoredBoxes: async (filters: MapFilters): Promise<MapBoxRaw[]> => {
    return await apiAdapter.get<MapBoxRaw[]>(GET_BOXES, { status: 'stored', ...filterParams(filters) })
  },

  /** GET /master/zones → สถานที่ + ชั้นวางทั้งหมด (รวมที่ปิดใช้งาน) */
  getZones: async (): Promise<MapZoneRaw[]> => {
    return await apiAdapter.get<MapZoneRaw[]>(MASTER_ZONES)
  },

  /**
   * GET /ext/stock[?blood=A+][&type=LDRC]
   * เลือดจากภายนอกที่อนุมัติแล้วและยังมีถุงคงเหลือ (1 แถว = 1 เอกสาร/กล่อง)
   */
  getExtStock: async (filters: MapFilters): Promise<ExtStockRaw[]> => {
    return await apiAdapter.get<ExtStockRaw[]>(EXT_STOCK, filterParams(filters))
  },
}

export default mapService
