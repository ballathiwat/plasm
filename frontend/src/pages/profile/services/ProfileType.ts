// ============================================================
//  src/pages/profile/services/ProfileType.ts
// ============================================================

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}