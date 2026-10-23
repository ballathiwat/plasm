// frontend/src/helpers/useBloodTypes.ts
//
// ดึงรายการหมู่เลือดจาก master สำหรับตัวกรอง (Withdraw / Log)
// คืนทุกหมู่รวมที่ปิดใช้งานแล้ว เพราะกล่อง/ประวัติเก่ายังอ้างอิงหมู่นั้นอยู่

import { useEffect, useState } from 'react'
import apiAdapter from './http/apiAdapter'
import { MASTER_BLOOD_TYPES } from './url_helper'

interface BloodTypeRow {
  id: string
  code: string
  active: boolean
}

export default function useBloodTypes(): string[] {
  const [codes, setCodes] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    apiAdapter
      .get<BloodTypeRow[]>(MASTER_BLOOD_TYPES)
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
