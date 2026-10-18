// ============================================================
//  src/pages/withdraw/services/WithdrawService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  GET_BOXES,
  GET_BOX_DETAIL,
  PATCH_BOX_WITHDRAW,
  PATCH_UNIT_WITHDRAW,
} from '../../../helpers/url_helper'
import type { WithdrawBoxItem, WithdrawBoxDetail } from './WithdrawType'

const withdrawService = {
  /** GET /boxes?status=stored (&blood=) */
  getStoredBoxes: async (params?: Record<string, string>): Promise<WithdrawBoxItem[]> => {
    return await apiAdapter.get<WithdrawBoxItem[]>(GET_BOXES, { status: 'stored', ...params })
  },

  /** GET /boxes/:id */
  getBoxDetail: async (id: string): Promise<WithdrawBoxDetail> => {
    return await apiAdapter.getById<WithdrawBoxDetail>(GET_BOX_DETAIL, id)
  },

  /** PATCH /boxes/:id/withdraw */
  withdrawBox: async (id: string): Promise<{ message: string }> => {
    return await apiAdapter.patch<undefined, { message: string }>(
      `${PATCH_BOX_WITHDRAW}/${id}/withdraw`,
    )
  },

  /** PATCH /units/:id/withdraw */
  withdrawUnit: async (unitId: string): Promise<{ message: string }> => {
    return await apiAdapter.patch<undefined, { message: string }>(
      `${PATCH_UNIT_WITHDRAW}/${unitId}/withdraw`,
    )
  },
}

export default withdrawService