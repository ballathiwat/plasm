// src/pages/settings/components/settingsStyles.ts — ค่าสไตล์ที่ทุกการ์ดในหน้า ตั้งค่า ใช้ร่วมกัน
import type { CSSProperties } from 'react'

/** ขนาดเป้ากดขั้นต่ำ: จอสัมผัส 44px, เมาส์ 32px */
export const TGT =
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches ? 44 : 32

export const card: CSSProperties = {
  background: 'var(--surface, #fff)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg, 10px)', padding: 24, boxShadow: 'var(--shadow-sm)',
}
export const h3: CSSProperties = { fontSize: 16, fontWeight: 700, margin: 0 }
export const sub: CSSProperties = { fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 16px' }
export const iconBtn = (color: string): CSSProperties => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: TGT, height: TGT, flexShrink: 0,
  borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color,
})
export const linkBtn: CSSProperties = {
  background: 'none', border: 'none', padding: 0, font: 'inherit', fontSize: 13, fontWeight: 600,
  color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2,
}
export const srOnly: CSSProperties = {
  position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
}
