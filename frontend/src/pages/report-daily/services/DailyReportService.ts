// frontend/src/pages/report-daily/services/DailyReportService.ts

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_REPORTS_MOVEMENTS, MASTER_PLASMA_TYPES } from '../../../helpers/url_helper'
import type { MovementResponse } from './DailyReportType'

interface PlasmaTypeItem { code: string; active: boolean }

const dailyReportService = {
  getMovements: async (params: Record<string, string>): Promise<MovementResponse> => {
    return await apiAdapter.get<MovementResponse>(GET_REPORTS_MOVEMENTS, params)
  },
  getPlasmaTypes: async (): Promise<string[]> => {
    const rows = await apiAdapter.get<PlasmaTypeItem[]>(MASTER_PLASMA_TYPES)
    return rows.filter((r) => r.active).map((r) => r.code)
  },
}

export default dailyReportService
