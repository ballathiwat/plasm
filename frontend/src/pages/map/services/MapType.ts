// ============================================================
//  src/pages/map/services/MapType.ts
// ============================================================

import type { BloodGroup } from '../../../types/models'

export interface ShelfSummary {
  shelf: string
  totalBoxes: number
  totalUnits: number
  byBlood: Record<BloodGroup, number>
}

export interface LocationSummary {
  location: 'room' | 'cabinet'
  shelves: ShelfSummary[]
  totalBoxes: number
  totalUnits: number
}

export const ROOM_LAYOUT: { shelf: string; row: number; col: number; label: string }[] = [
  { shelf: 'L3', row: 0, col: 0, label: 'L3' },
  { shelf: 'M1', row: 0, col: 1, label: 'M1' },
  { shelf: 'R3', row: 0, col: 2, label: 'R3' },
  { shelf: 'L2', row: 1, col: 0, label: 'L2' },
  { shelf: '',   row: 1, col: 1, label: '' },       // empty center
  { shelf: 'R2', row: 1, col: 2, label: 'R2' },
  { shelf: 'L1', row: 2, col: 0, label: 'L1' },
  { shelf: '',   row: 2, col: 1, label: 'ประตู' },  // door
  { shelf: 'R1', row: 2, col: 2, label: 'R1' },
]

export const CABINET_SHELVES = ['C1', 'C2', 'C3']
