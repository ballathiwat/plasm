// frontend/src/pages/ExtBloodReport/services/ExtReportService.ts
import apiAdapter from '../../../helpers/http/apiAdapter'
import { EXT_REPORT, EXT_SOURCES } from '../../../helpers/url_helper'
import type { ExtReportFilter } from './ExtReportType'
import type { ExtSource } from '../../ExtBlood/services/ExtBloodType'
const extReportService = {
  getReport: (p: ExtReportFilter) => apiAdapter.get<unknown>(EXT_REPORT, p as Record<string, string>),
  getSources: () => apiAdapter.get<ExtSource[]>(EXT_SOURCES),
}
export default extReportService
