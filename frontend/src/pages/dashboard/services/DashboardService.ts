// ============================================================
//  src/pages/dashboard/services/DashboardService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_STOCK_DAILY, GET_LOG } from '../../../helpers/url_helper'
import type { DailyData, LogEntryItem } from './DashboardType'

const dashboardService = {
// สต็อกเทียบขั้นต่ำ → helpers/useMinStockStatus.ts (cache เดียวกับกระดิ่ง)
  getStockDaily: async (days = 7): Promise<DailyData[]> => {
    return await apiAdapter.get<DailyData[]>(GET_STOCK_DAILY, { days: String(days) })
  },

 getRecentLog: async (): Promise<LogEntryItem[]> => {
    const res = await apiAdapter.get<{ data: LogEntryItem[] }>(GET_LOG, { pageSize: '10' })
    return res.data
  },
}

export default dashboardService
