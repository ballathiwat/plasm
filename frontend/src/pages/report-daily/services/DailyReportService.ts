// frontend/src/pages/report-daily/services/DailyReportService.ts

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_REPORTS_MOVEMENTS } from '../../../helpers/url_helper'
import type { MovementResponse } from './DailyReportType'

const dailyReportService = {
  getMovements: async (params: Record<string, string>): Promise<MovementResponse> => {
    return await apiAdapter.get<MovementResponse>(GET_REPORTS_MOVEMENTS, params)
  },
}

export default dailyReportService
