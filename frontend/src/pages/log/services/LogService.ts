// ============================================================
//  src/pages/log/services/LogService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_LOG } from '../../../helpers/url_helper'
import type { PaginatedLogResponse } from './LogType'

const logService = {
  /** GET /log?action=&blood=&page=&pageSize= */
  getLog: async (params?: Record<string, string>): Promise<PaginatedLogResponse> => {
    return await apiAdapter.get<PaginatedLogResponse>(GET_LOG, params)
  },
}

export default logService
