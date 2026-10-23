// ============================================================
//  src/pages/map/services/MapService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_BOXES, MASTER_ZONES } from '../../../helpers/url_helper'
import type { MapBoxRaw, MapZoneRaw } from './MapType'

const mapService = {
  /** GET /boxes?status=stored → aggregate by zone + shelf */
  getStoredBoxes: async (): Promise<MapBoxRaw[]> => {
    return await apiAdapter.get<MapBoxRaw[]>(GET_BOXES, { status: 'stored' })
  },

  /** GET /master/zones → สถานที่ + ชั้นวางทั้งหมด (รวมที่ปิดใช้งาน) */
  getZones: async (): Promise<MapZoneRaw[]> => {
    return await apiAdapter.get<MapZoneRaw[]>(MASTER_ZONES)
  },
}

export default mapService
