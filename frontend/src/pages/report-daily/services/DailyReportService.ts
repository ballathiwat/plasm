// frontend/src/pages/report-daily/services/DailyReportService.ts

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_STOCK_DAILY } from '../../../helpers/url_helper'
import type { DailyData } from './DailyReportType'

const dailyReportService = {
  getStockDaily: async (days = 7): Promise<DailyData[]> => {
    return await apiAdapter.get<DailyData[]>(GET_STOCK_DAILY, { days: String(days) })
  },
}

export default dailyReportService