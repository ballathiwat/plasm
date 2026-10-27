// src/pages/report/services/ReportService.ts

import apiAdapter from '../../../helpers/http/apiAdapter'
import type { ReportData } from './ReportType'

const GET_STOCK_REPORT = '/api/v1/stock/report'

const reportService = {
  getReport: async (params: Record<string, string>): Promise<ReportData> => {
    return await apiAdapter.get<ReportData>(GET_STOCK_REPORT, params)
  },
}

export default reportService