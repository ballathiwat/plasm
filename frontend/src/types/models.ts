// frontend/src/types/models.ts

// ===== Blood Type =====
export type BloodGroup = 'A' | 'B' | 'O' | 'AB'
export type PlasmaType = 'FFP' | 'Cryo'
export type StorageLocation = 'room' | 'cabinet'
export type BoxStatus = 'stored' | 'withdrawn'

// ===== Box =====
export interface Box {
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

// ===== Log Entry =====
export type LogAction = 'store' | 'withdraw'

export interface LogEntry {
  id: string
  action: LogAction
  boxLabel: string
  type: PlasmaType
  blood: BloodGroup
  units: string[]
  location?: StorageLocation
  shelf?: string
  timestamp: string
  detail: string
  performedBy?: string
}

// ===== Stock =====
export interface StockSummary {
  blood: BloodGroup
  count: number
  minimum: number
  isLow: boolean
}

// ===== Shelf Position =====
export interface ShelfConfig {
  room: string[]
  cabinet: string[]
}

// ===== Settings =====
export interface MinimumStock {
  A: number
  B: number
  O: number
  AB: number
}

// ===== Summary Card =====
export interface SummaryCardData {
  label: string
  value: string
  icon: React.ComponentType<{ size?: number }>
  color: string
  bg: string
  sub?: string
}
