// ============================================================
//  src/pages/withdraw/services/WithdrawType.ts
// ============================================================

import type { BloodGroup, PlasmaType, StorageLocation, BoxStatus } from '../../../types/models'

// ── Box item (from GET /boxes list) ──
export interface WithdrawBoxItem {
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
  withdrawnAt?: string
}

// ── Unit detail (from GET /boxes/:id) ──
export interface WithdrawUnitInfo {
  id: string
  unitNumber: string
  status: 'stored' | 'withdrawn'
}

// ── Box detail (from GET /boxes/:id) ──
export interface WithdrawBoxDetail {
  id: string
  boxLabel: string
  type: PlasmaType
  blood: BloodGroup
  location: StorageLocation
  shelf: string
  collectionDate: string
  units: WithdrawUnitInfo[]
  unitCount: number
  storedCount: number
  status: BoxStatus
  storedAt: string
  withdrawnAt?: string
}

// ── Confirm action ──
export interface ConfirmAction {
  title: string
  msg: string
  onConfirm: () => void
}

// ── Toast ──
export interface ToastState {
  type: 'success' | 'error'
  msg: string
}