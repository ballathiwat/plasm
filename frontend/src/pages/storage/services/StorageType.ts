// ============================================================
//  src/pages/storage/services/StorageType.ts
// ============================================================

import type { BloodGroup, PlasmaType, StorageLocation, BoxStatus } from '../../../types/models'

export interface StorageBoxItem {
  id: string
  boxLabel: string
  type: PlasmaType
  blood: BloodGroup
  location: StorageLocation
  shelf: string
  collectionDate: string
  units: string[]
  status: BoxStatus
  storedAt: string
}

export interface StorageFormData {
  type: PlasmaType
  blood: BloodGroup
  collectionDate: string
  location: StorageLocation
  shelf: string
}

export interface ToastState {
  type: 'success' | 'error'
  msg: string
}

export const SHELVES_ROOM = ['M1', 'R1', 'R2', 'R3', 'L1', 'L2', 'L3']
export const SHELVES_CABINET = ['C1', 'C2', 'C3']