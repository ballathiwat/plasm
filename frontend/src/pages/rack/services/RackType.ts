// ============================================================
//  src/pages/rack/services/RackType.ts
// ============================================================

import type { ApiError } from '../../../helpers/http/types'
export type { ApiError }

export interface RackBox {
  id: string
  boxLabel: string
  boxName: string | null
  type: string
  blood: string
  zoneId: string
  zoneName: string
  shelf: string
  level: number
  position: number
  collectionDate: string
  storedAt: string
  /** เลข unit เรียงตามลำดับถุง (index 0 = ถุงที่ 1 = หน้า) */
  units: string[]
  lastAction: { userName: string | null; timestamp: string } | null
}

export interface RackLevel {
  level: number
  slots: Record<number, RackBox>
}

export interface RackLock {
  id: string
  level: number
  position: number
  userId: string
  userName: string
  expiresAt: string
}

export interface RackData {
  zoneId: string
  shelf: string
  levels: RackLevel[]
  locks: RackLock[]
}

export interface RackZone {
  id: string
  name: string
  legacyKey: string | null
  active: boolean
  shelves: { id: string; code: string; active: boolean }[]
}

export interface RackSearchResult {
  box: {
    id: string
    boxLabel: string
    blood: string
    zoneId: string
    zoneName: string
    shelf: string
    level: number | null
    position: number | null
  }
  matchedUnit: string | null
  zoneName: string
  shelf: string
  level: number | null
  position: number | null
}

export interface MasterOption {
  id: string
  code: string
  active: boolean
}

export interface RemovalReason {
  id: string
  name: string
  active: boolean
}

export interface UnitCheck {
  exists: boolean
  boxLabel?: string
  status?: 'stored' | 'withdrawn'
}

export type PanelMode = 'view' | 'withdraw' | 'edit' | 'move'

export interface SlotRef {
  level: number
  position: number
}

