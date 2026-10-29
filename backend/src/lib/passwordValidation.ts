// ============================================================
//  src/lib/passwordValidation.ts
//  Password validation rules (shared across routes)
// ============================================================

export const PASSWORD_MIN_LENGTH = 8

export function validatePassword(password: string): string | null {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`
  }
  if (!/[a-z]/.test(password)) {
    return 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก (a-z)'
  }
  if (!/[A-Z]/.test(password)) {
    return 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่ (A-Z)'
  }
  if (!/[0-9]/.test(password)) {
    return 'รหัสผ่านต้องมีตัวเลข (0-9)'
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return 'รหัสผ่านต้องมีอักขระพิเศษ เช่น !@#$%^&*'
  }
  return null // valid
}