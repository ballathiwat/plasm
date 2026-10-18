// ============================================================
//  src/pages/storage/services/StorageService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_BOXES, POST_BOX } from '../../../helpers/url_helper'
import type { StorageBoxItem } from './StorageType'

const storageService = {
  /** GET /boxes?status=stored */
  getStoredBoxes: async (): Promise<StorageBoxItem[]> => {
    return await apiAdapter.get<StorageBoxItem[]>(GET_BOXES, { status: 'stored' })
  },

  /** POST /boxes */
  createBox: async (data: {
    boxLabel: string
    type: string
    blood: string
    location: string
    shelf: string
    collectionDate: string
    units: string[]
  }): Promise<StorageBoxItem> => {
    return await apiAdapter.post<typeof data, StorageBoxItem>(POST_BOX, data)
  },
}

export default storageService