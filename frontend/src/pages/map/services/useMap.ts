// ============================================================
//  src/pages/map/services/useMap.ts
// ============================================================

import { useState, useEffect, useMemo } from 'react'
import mapService from './MapService'
import type { ShelfSummary, LocationSummary } from './MapType'
import type { BloodGroup } from '../../../types/models'

const EMPTY_BLOOD: Record<BloodGroup, number> = { A: 0, B: 0, O: 0, AB: 0 }

export default function useMap() {
  const [boxes, setBoxes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    mapService.getStoredBoxes()
      .then(setBoxes)
      .catch(() => setBoxes([]))
      .finally(() => setLoading(false))
  }, [])

  const { room, cabinet } = useMemo(() => {
    const buildSummary = (loc: string, shelfList: string[]): LocationSummary => {
      const filtered = boxes.filter((b) => b.location === loc)
      const shelves: ShelfSummary[] = shelfList.map((shelf) => {
        const shelfBoxes = filtered.filter((b) => b.shelf === shelf)
        const byBlood = { ...EMPTY_BLOOD }
        let totalUnits = 0
        for (const b of shelfBoxes) {
          const bg = b.blood as BloodGroup
          const count = Array.isArray(b.units) ? b.units.length : 0
          byBlood[bg] = (byBlood[bg] || 0) + count
          totalUnits += count
        }
        return { shelf, totalBoxes: shelfBoxes.length, totalUnits, byBlood }
      })
      return {
        location: loc as 'room' | 'cabinet',
        shelves,
        totalBoxes: filtered.length,
        totalUnits: filtered.reduce((s, b) => s + (Array.isArray(b.units) ? b.units.length : 0), 0),
      }
    }

    return {
      room: buildSummary('room', ['M1', 'R1', 'R2', 'R3', 'L1', 'L2', 'L3']),
      cabinet: buildSummary('cabinet', ['C1', 'C2', 'C3']),
    }
  }, [boxes])

  const totalBoxes = room.totalBoxes + cabinet.totalBoxes
  const totalUnits = room.totalUnits + cabinet.totalUnits

  return { room, cabinet, totalBoxes, totalUnits, loading }
}
