// ============================================================
//  src/pages/dashboard/services/DashboardService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_STOCK_SUMMARY, GET_STOCK_DAILY, GET_LOG } from '../../../helpers/url_helper'
import type { StockSummary, DailyData, LogEntryItem } from './DashboardType'

const dashboardService = {
  getStockSummary: async (): Promise<StockSummary> => {
    return await apiAdapter.get<StockSummary>(GET_STOCK_SUMMARY)
  },

  getStockDaily: async (days = 7): Promise<DailyData[]> => {
    return await apiAdapter.get<DailyData[]>(GET_STOCK_DAILY, { days: String(days) })
  },

  getRecentLog: async (): Promise<LogEntryItem[]> => {
    return await apiAdapter.get<LogEntryItem[]>(GET_LOG)
  },
}

export default dashboardService
