// frontend/src/helpers/useBloodColors.ts
// ─────────────────────────────────────────────
//  โหลดสีกรุ๊ปเลือด + ชนิดพลาสมาจาก master data
//  แล้ว register CSS variables ลง DOM ครั้งเดียว
//  ← ใช้ใน Layout component (ระดับสูงสุด)
// ─────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import apiAdapter from './http/apiAdapter'
import { MASTER_BLOOD_TYPES, MASTER_PLASMA_TYPES } from './url_helper'
import { registerMasterColors } from './blood'

type CodeItem = { code: string; color?: string | null }

export default function useBloodColors() {
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    Promise.all([
      apiAdapter.get<CodeItem[]>(MASTER_BLOOD_TYPES),
      apiAdapter.get<CodeItem[]>(MASTER_PLASMA_TYPES),
    ])
      .then(([blood, plasma]) => {
        registerMasterColors(blood, plasma)
      })
      .catch(() => {
        // ล้มเหลว → ใช้สี default จาก globals.css
      })
  }, [])
}