// ============================================================
//  src/pages/search/services/SearchType.ts
// ============================================================

import type { BloodGroup, PlasmaType, StorageLocation, BoxStatus } from '../../../types/models'

export interface SearchUnitResult {
  id: string
  unitNumber: string
  status: 'stored' | 'withdrawn'
  box: {
    id: string
    boxLabel: string
    blood: BloodGroup
    type: PlasmaType
    location: StorageLocation
    shelf: string
    status: BoxStatus
    collectionDate: string
  }
}

export interface SearchBoxGroup {
  box: SearchUnitResult['box']
  units: SearchUnitResult[]
}