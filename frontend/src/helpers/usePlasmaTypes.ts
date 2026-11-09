// frontend/src/helpers/usePlasmaTypes.ts
//
// ดึงรายการชนิดเลือดจาก master สำหรับตัวกรอง
// คืนทุกชนิดรวมที่ปิดใช้งานแล้ว เพราะกล่องเก่ายังอ้างอิงอยู่

import { useEffect, useState } from 'react'
import apiAdapter from './http/apiAdapter'
import { MASTER_PLASMA_TYPES } from './url_helper'

interface PlasmaTypeRow {
  id: string
  code: string
  active: boolean
}

export default function usePlasmaTypes(): string[] {
  const [codes, setCodes] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    apiAdapter
      .get<PlasmaTypeRow[]>(MASTER_PLASMA_TYPES)
      .then((rows) => {
        if (alive) setCodes(rows.map((r) => r.code))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return codes
}