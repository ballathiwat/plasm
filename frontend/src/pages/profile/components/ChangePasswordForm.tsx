// ============================================================
//  src/pages/profile/components/ChangePasswordForm.tsx
// ============================================================

import { Lock } from 'lucide-react'
import type { ChangePasswordForm as FormType } from '../services/ProfileType'
import FormInput from '../../../components/common/FormInput'
import Button from '../../../components/common/Button'
import PasswordRules from '../../../components/common/PasswordRules'
import ProfileCard from './ProfileCard'

interface Props {
  form: FormType
  saving: boolean
  errors: Partial<Record<keyof FormType, string>>
  onChange: (field: keyof FormType, value: string) => void
  onSubmit: () => void
}

export default function ChangePasswordForm({ form, saving, errors, onChange, onSubmit }: Props) {
  return (
    <ProfileCard icon={<Lock size={18} />} title="เปลี่ยนรหัสผ่าน" desc="รหัสผ่านที่ใช้เข้าสู่ระบบ Plasm">
      <FormInput label="รหัสผ่านเดิม" type="password" required placeholder="กรอกรหัสผ่านปัจจุบัน"
        value={form.currentPassword} onChange={(v) => onChange('currentPassword', v)} error={errors.currentPassword} autoComplete="current-password" />
      <FormInput label="รหัสผ่านใหม่" type="password" required placeholder="กรอกรหัสผ่านใหม่"
        value={form.newPassword} onChange={(v) => onChange('newPassword', v)} error={errors.newPassword} autoComplete="new-password" />
      <PasswordRules password={form.newPassword} />
      <FormInput label="ยืนยันรหัสผ่านใหม่" type="password" required placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
        value={form.confirmPassword} onChange={(v) => onChange('confirmPassword', v)} error={errors.confirmPassword} autoComplete="new-password" />
      <div className="profile-actions">
        <Button onClick={onSubmit} loading={saving} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}</Button>
      </div>
    </ProfileCard>
  )
}
