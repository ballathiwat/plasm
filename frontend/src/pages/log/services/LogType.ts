// ============================================================
//  src/pages/log/services/LogType.ts
// ============================================================

import type { BloodGroup, PlasmaType } from '../../../types/models'

export interface LogEntryItem {
  id: string
  action: 'store' | 'withdraw'
  boxLabel: string
  type: PlasmaType
  blood: BloodGroup | string
  units: string[]
  location?: string
  shelf?: string
  timestamp: string
  detail: string
  performedBy?: string
}

export interface LogFilters {
  action: string
  blood: string
  dateFrom: string
  dateTo: string
}
