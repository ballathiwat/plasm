// frontend/src/helpers/blood.ts
// ─────────────────────────────────────────────────────────
//  ศูนย์กลางสีกรุ๊ปเลือด
//  เรียก registerMasterColors() ตอนโหลด master data
//  → inject CSS custom properties + .blood-badge rules ลง DOM
//  → ทุก component ที่ใช้ groupColor / groupSurface / groupInk
//     และ .blood-badge[data-blood] ได้สีจาก master data อัตโนมัติ
// ─────────────────────────────────────────────────────────

export type BloodBase = 'A' | 'B' | 'O' | 'AB'

/** A-, A+, AB+ → A, A, AB (ไม่รู้จัก → '') */
export const bloodBase = (code?: string | null): BloodBase | '' => {
  const c = String(code ?? '')
    .toUpperCase()
    .replace(/POSITIVE|NEGATIVE|POS|NEG|[+\-−\s]/g, '')
  return c === 'A' || c === 'B' || c === 'O' || c === 'AB' ? c : ''
}

// ── CSS-safe key ──
// "A" → "a", "AB" → "ab", "A+" → "a-pos", "A-" → "a-neg", "AB+" → "ab-pos"
function toCssKey(code: string): string {
  return code.toLowerCase()
    .replace(/\+/g, '-pos')
    .replace(/-/g, '-neg')
    .replace(/[^a-z0-9-]/g, '')
    || 'other'
}

// ── Dynamic registry ──
// code (exact, e.g. "A+") → cssKey (e.g. "a-pos")
const _codeToKey = new Map<string, string>()

/** ดู registry หา cssKey ที่ตรง → fallback bloodBase → fallback "other" */
const key = (code?: string | null): string => {
  const raw = String(code ?? '').trim()
  if (!raw) return 'other'

  // 1. exact match
  const exact = _codeToKey.get(raw)
  if (exact) return exact

  // 2. try bloodBase (A+ → A)
  const base = bloodBase(raw)
  if (base) {
    const baseKey = _codeToKey.get(base)
    if (baseKey) return baseKey
  }

  return 'other'
}

export const groupColor   = (code?: string | null) => `var(--group-${key(code)})`
export const groupSurface = (code?: string | null) => `var(--group-${key(code)}-surface)`
export const groupInk     = (code?: string | null) => `var(--group-${key(code)}-ink)`

// ── Color math helpers ──
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

/** สีอ่อน (surface) — mix กับ white 85% */
function makeSurface(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  const mix = (c: number) => Math.round(c + (255 - c) * 0.85)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

/** สีเข้ม (ink) — mix กับ black 55% */
function makeInk(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  const mix = (c: number) => Math.round(c * 0.45)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

// ── Style tag management ──
const STYLE_ID = 'plasm-blood-colors'

function getOrCreateStyleTag(): HTMLStyleElement {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    document.head.appendChild(el)
  }
  return el
}

// ── Public: register master colors ──
type ColorEntry = { code: string; color?: string | null }

let _bloodEntries: ColorEntry[] = []
let _plasmaEntries: ColorEntry[] = []

export function registerMasterColors(
  bloodTypes: ColorEntry[],
  plasmaTypes: ColorEntry[],
) {
  _bloodEntries = bloodTypes
  _plasmaEntries = plasmaTypes
  _codeToKey.clear()

  const root = document.documentElement
  const cssRules: string[] = []

  for (const item of bloodTypes) {
    const hex = item.color || '#71717A'
    const k = toCssKey(item.code)
    _codeToKey.set(item.code, k)

    // Set CSS custom properties on :root
    root.style.setProperty(`--group-${k}`, hex)
    root.style.setProperty(`--group-${k}-surface`, makeSurface(hex))
    root.style.setProperty(`--group-${k}-ink`, makeInk(hex))

    // .blood-badge rule — exact code match
    cssRules.push(
      `.blood-badge[data-blood="${item.code}"] { background: var(--group-${k}-surface); color: var(--group-${k}-ink); }`
    )
  }

  // Inject <style> for .blood-badge rules
  const styleEl = getOrCreateStyleTag()
  styleEl.textContent = cssRules.join('\n')
}

// ── Chart color helpers (ใช้ hex ตรงๆ สำหรับ canvas/svg) ──
const DEFAULT_CHART_COLOR = '#71717A'

/** สี hex สำหรับแท่งกราฟหมู่เลือด */
export const bloodChartColor = (code: string): string => {
  const entry = _bloodEntries.find((b) => b.code === code)
  if (entry?.color) return entry.color
  // fallback: ลอง bloodBase
  const base = bloodBase(code)
  if (base) {
    const baseEntry = _bloodEntries.find((b) => b.code === base)
    if (baseEntry?.color) return baseEntry.color
  }
  return DEFAULT_CHART_COLOR
}

/** สี hex สำหรับแท่งกราฟชนิดพลาสมา */
export const plasmaChartColor = (code: string): string => {
  const entry = _plasmaEntries.find((p) => p.code === code)
  return entry?.color || DEFAULT_CHART_COLOR
}