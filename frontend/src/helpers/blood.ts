// frontend/src/helpers/blood.ts

export type BloodBase = 'A' | 'B' | 'O' | 'AB'

/** A-, A+, AB+ → A, A, AB (ไม่รู้จัก → '') */
export const bloodBase = (code?: string | null): BloodBase | '' => {
  const c = String(code ?? '')
    .toUpperCase()
    .replace(/POSITIVE|NEGATIVE|POS|NEG|[+\-−\s]/g, '')
  return c === 'A' || c === 'B' || c === 'O' || c === 'AB' ? c : ''
}

const key = (code?: string | null) => (bloodBase(code) || 'other').toLowerCase()

export const groupColor   = (code?: string | null) => `var(--group-${key(code)})`
export const groupSurface = (code?: string | null) => `var(--group-${key(code)}-surface)`
export const groupInk     = (code?: string | null) => `var(--group-${key(code)}-ink)`

// ── Dynamic color registry ──
// ใช้สำหรับ chart / graph ที่ต้องการสีจาก master data (ที่ user กำหนดเอง)
// เรียก registerMasterColors() ตอนโหลด master data

type ColorMap = Record<string, string>  // code → hex color
const _bloodColors: ColorMap = {}
const _plasmaColors: ColorMap = {}

const DEFAULT_CHART_COLOR = '#71717A'

export function registerMasterColors(
  bloodTypes: { code: string; color?: string | null }[],
  plasmaTypes: { code: string; color?: string | null }[],
) {
  // clear
  for (const k of Object.keys(_bloodColors)) delete _bloodColors[k]
  for (const k of Object.keys(_plasmaColors)) delete _plasmaColors[k]
  // populate
  for (const b of bloodTypes) if (b.color) _bloodColors[b.code] = b.color
  for (const p of plasmaTypes) if (p.color) _plasmaColors[p.code] = p.color
}

/** สีแท่งกราฟสำหรับหมู่เลือด — ใช้สีที่ user กำหนดใน settings */
export const bloodChartColor = (code: string): string =>
  _bloodColors[code] || DEFAULT_CHART_COLOR

/** สีแท่งกราฟสำหรับชนิดพลาสมา */
export const plasmaChartColor = (code: string): string =>
  _plasmaColors[code] || DEFAULT_CHART_COLOR

/** Surface variant (ลด opacity) สำหรับสีที่ user กำหนด */
export const chartColorSurface = (hex: string): string => {
  // append 20 (12.5% opacity) to hex
  if (hex.startsWith('#') && hex.length === 7) return hex + '20'
  return hex
}

/** Ink variant (เข้มขึ้น) — ใช้สีเดิมก็พอ */
export const chartColorInk = (hex: string): string => hex
