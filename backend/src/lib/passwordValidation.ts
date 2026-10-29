// ============================================================
//  src/lib/passwordValidation.ts
//  Password validation rules (shared across routes)
// ============================================================

export const PASSWORD_MIN_LENGTH = 8

export function validatePassword(password: string): string | null {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`
  }
  return null // valid
}