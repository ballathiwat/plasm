// ============================================================
//  src/pages/map/services/MapService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_BOXES, MASTER_ZONES } from '../../../helpers/url_helper'
import type { MapBoxRaw, MapFilters, MapZoneRaw } from './MapType'

const mapService = {
  /**
   * GET /boxes?status=stored[&blood=A][&type=FFP] → aggregate by zone + shelf
   * กรองที่ backend — ไม่ส่ง blood/type เมื่อเลือก "ทั้งหมด"
   */
  getStoredBoxes: async (filters: MapFilters): Promise<MapBoxRaw[]> => {
    const params: Record<string, string> = { status: 'stored' }
    if (filters.blood) params.blood = filters.blood
    if (filters.type) params.type = filters.type
    return await apiAdapter.get<MapBoxRaw[]>(GET_BOXES, params)
  },

  /** GET /master/zones → สถานที่ + ชั้นวางทั้งหมด (รวมที่ปิดใช้งาน) */
  getZones: async (): Promise<MapZoneRaw[]> => {
    return await apiAdapter.get<MapZoneRaw[]>(MASTER_ZONES)
  },
}

export default mapService
