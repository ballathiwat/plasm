// ============================================================
//  src/pages/map/services/useMapZone.ts
//  ตัวเลือกสถานที่ของแท็บ "แผนผัง" — แสดงผังทีละสถานที่
//  - เรียงกล่องมาก → น้อย · สถานที่ 0 กล่องซ่อนไว้ (ยกเว้นติ๊ก "แสดงที่ว่าง")
//  - จำสถานที่ที่เลือกใน URL (?zone=<id>) · ค่าเริ่มต้น = สถานที่ที่มีกล่องมากสุด
// ============================================================

import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ZoneSummary } from './MapType'

const ZONE_PARAM = 'zone'

export default function useMapZone(zones: ZoneSummary[]) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showEmpty, setShowEmpty] = useState(false)

  // sort เป็น stable → จำนวนกล่องเท่ากันคงลำดับ master เดิม
  const sorted = useMemo(() => [...zones].sort((a, b) => b.totalBoxes - a.totalBoxes), [zones])

  const paramId = searchParams.get(ZONE_PARAM)
  const selected = sorted.find((z) => z.id === paramId) ?? sorted[0] ?? null
  const selectedId = selected?.id ?? null

  const emptyZones = useMemo(() => sorted.filter((z) => z.totalBoxes === 0), [sorted])
  // สถานที่ที่เลือกอยู่แสดงเสมอ แม้ไม่มีกล่อง (เช่น เปิดจากลิงก์ ?zone=)
  const visibleZones = useMemo(
    () => sorted.filter((z) => showEmpty || z.totalBoxes > 0 || z.id === selectedId),
    [sorted, showEmpty, selectedId],
  )
  const hiddenEmptyZones = useMemo(
    () => emptyZones.filter((z) => !visibleZones.includes(z)),
    [emptyZones, visibleZones],
  )

  const selectZone = useCallback(
    (id: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(ZONE_PARAM, id)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return {
    selected,
    visibleZones,
    hiddenEmptyZones,
    totalCount: sorted.length,
    withBoxesCount: sorted.length - emptyZones.length,
    emptyCount: emptyZones.length,
    maxBoxes: sorted[0]?.totalBoxes ?? 0,
    showEmpty,
    setShowEmpty,
    selectZone,
  }
}
