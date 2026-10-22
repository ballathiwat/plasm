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