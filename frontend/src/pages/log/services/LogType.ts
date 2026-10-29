// ============================================================
//  src/pages/log/services/LogType.ts
// ============================================================

export interface LogEntryItem {
  id: string
  action: 'store' | 'withdraw'
  boxLabel: string
  type: string
  blood: string
  units: string[]
  location?: string
  zoneName?: string
  shelf?: string
  timestamp: string
  detail: string
  performedBy?: string
  unitCount?: number
}

export interface LogFilters {
  action: string
  blood: string
  dateFrom: string
  dateTo: string
}

export interface PaginatedLogResponse {
  data: LogEntryItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
