// ============================================================
//  src/pages/log/services/LogService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_LOG } from '../../../helpers/url_helper'
import type { LogEntryItem } from './LogType'

const logService = {
  /** GET /log?action=&blood=&limit=&offset= */
  getLog: async (params?: Record<string, string>): Promise<LogEntryItem[]> => {
    return await apiAdapter.get<LogEntryItem[]>(GET_LOG, params)
  },
}

export default logService
