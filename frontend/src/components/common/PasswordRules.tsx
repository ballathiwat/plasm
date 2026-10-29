// ============================================================
//  src/components/common/PasswordRules.tsx
//  แสดงเงื่อนไขรหัสผ่าน — ใช้ร่วมกันทุกฟอร์ม
// ============================================================

import { PASSWORD_MIN_LENGTH } from '../../helpers/passwordValidation'

const RULES = [
  `อย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`,
  'มีตัวอักษรพิมพ์เล็ก (a-z)',
  'มีตัวอักษรพิมพ์ใหญ่ (A-Z)',
  'มีตัวเลข (0-9)',
  'มีอักขระพิเศษ เช่น !@#$%^&*',
]

interface Props {
  password?: string
}

function check(password: string, index: number): boolean {
  switch (index) {
    case 0: return password.length >= PASSWORD_MIN_LENGTH
    case 1: return /[a-z]/.test(password)
    case 2: return /[A-Z]/.test(password)
    case 3: return /[0-9]/.test(password)
    case 4: return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)
    default: return false
  }
}

export default function PasswordRules({ password = '' }: Props) {
  const hasInput = password.length > 0

  return (
    <div style={{
      padding: '10px 14px',
      borderRadius: 'var(--radius-md, 8px)',
      background: 'var(--surface-raised, #F4F4F5)',
      fontSize: 12,
      lineHeight: 1.8,
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>
        เงื่อนไขรหัสผ่าน
      </div>
      {RULES.map((rule, i) => {
        const passed = hasInput && check(password, i)
        return (
          <div key={i} style={{
            color: hasInput
              ? (passed ? '#16A34A' : '#DC2626')
              : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ fontSize: 11 }}>
              {hasInput ? (passed ? '✓' : '✗') : '•'}
            </span>
            {rule}
          </div>
        )
      })}
    </div>
  )
}