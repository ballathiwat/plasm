// ============================================================
//  frontend/src/pages/storage/components/StorageStatusBadge.tsx
//  ป้ายสถานะกล่อง: เก็บอยู่ / นำออกบางส่วน / นำออกหมดแล้ว
// ============================================================

import type { BoxState } from '../services/StorageType'

export const BOX_STATE_LABEL: Record<BoxState, string> = {
  STORED: 'เก็บอยู่',
  PARTIAL: 'นำออกบางส่วน',
  EMPTY: 'นำออกหมดแล้ว',
}

export default function StorageStatusBadge({ state }: { state: BoxState }) {
  return <span className={`sto-status sto-status--${state.toLowerCase()}`}>{BOX_STATE_LABEL[state]}</span>
}
