// ============================================================
//  src/pages/map/services/MapService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_BOXES } from '../../../helpers/url_helper'

interface BoxRaw {
  id: string
  blood: string
  location: string
  shelf: string
  units: string[]
  status: string
}

const mapService = {
  /** GET /boxes?status=stored → aggregate by shelf */
  getStoredBoxes: async (): Promise<BoxRaw[]> => {
    return await apiAdapter.get<BoxRaw[]>(GET_BOXES, { status: 'stored' })
  },
}

export default mapService
