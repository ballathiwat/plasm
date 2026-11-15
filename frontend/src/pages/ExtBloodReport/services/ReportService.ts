// frontend/src/pages/ExtBloodReport/services/ReportService.ts

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  EXT_REPORT_RECEIPTS,
  EXT_REPORT_RECEIPT_ROWS,
  EXT_SOURCES,
  MASTER_PLASMA_TYPES,
} from '../../../helpers/url_helper'
import type { ExtSource, ExtBloodProduct } from '../../ExtBlood/services/ExtBloodType'
import type { ReportQuery, ReceiptsReport, ReceiptRowsResult } from './ReportType'

const reportService = {
  getReceipts: (query: ReportQuery) =>
    apiAdapter.get<ReceiptsReport>(EXT_REPORT_RECEIPTS, query),

  getReceiptRows: (query: ReportQuery, page: number, pageSize: number) =>
    apiAdapter.get<ReceiptRowsResult>(EXT_REPORT_RECEIPT_ROWS, { ...query, page, pageSize }),

  getSources: () => apiAdapter.get<ExtSource[]>(EXT_SOURCES),
  getProducts: () => apiAdapter.get<ExtBloodProduct[]>(MASTER_PLASMA_TYPES),
}

export default reportService
