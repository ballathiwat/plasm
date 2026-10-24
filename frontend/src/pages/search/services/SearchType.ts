// ============================================================
//  src/pages/search/services/SearchType.ts
// ============================================================

import type { BoxStatus } from '../../../types/models'

export interface SearchUnitResult {
  id: string
  unitNumber: string
  status: 'stored' | 'withdrawn'
  box: {
    id: string
    boxLabel: string
    blood: string
    type: string
    location: string
    zoneName?: string
    shelf: string
    status: BoxStatus
    collectionDate: string
    boxName?: string | null
  }
}

export interface SearchBoxGroup {
  box: SearchUnitResult['box']
  units: SearchUnitResult[]
}