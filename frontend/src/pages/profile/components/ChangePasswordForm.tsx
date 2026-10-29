// ============================================================
//  src/pages/profile/components/ChangePasswordForm.tsx
// ============================================================

import { Lock } from 'lucide-react'
import type { ChangePasswordForm as FormType } from '../services/ProfileType'
import FormInput from '../../../components/common/FormInput'
import Button from '../../../components/common/Button'
import PasswordRules from '../../../components/common/PasswordRules'

interface Props {
  form: FormType
  saving: boolean
  errors: Partial<Record<keyof FormType, string>>
  onChange: (field: keyof FormType, value: string) => void
  onSubmit: () => void
}

export default function ChangePasswordForm({
  form, saving, errors, onChange, onSubmit,
}: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: 24,
      boxShadow: 'var(--shadow-sm)',
      maxWidth: 480,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md, 8px)',
          background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={18} color="#2563EB" />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>เปลี่ยนรหัสผ่าน</h3>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormInput
          label="รหัสผ่านเดิม"
          type="password"
          required
          placeholder="กรอกรหัสผ่านปัจจุบัน"
          value={form.currentPassword}
          onChange={(v) => onChange('currentPassword', v)}
          error={errors.currentPassword}
          autoComplete="current-password"
        />
        <FormInput
          label="รหัสผ่านใหม่"
          type="password"
          required
          placeholder="กรอกรหัสผ่านใหม่"
          value={form.newPassword}
          onChange={(v) => onChange('newPassword', v)}
          error={errors.newPassword}
          autoComplete="new-password"
        />

        <PasswordRules password={form.newPassword} />

        <FormInput
          label="ยืนยันรหัสผ่านใหม่"
          type="password"
          required
          placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
          value={form.confirmPassword}
          onChange={(v) => onChange('confirmPassword', v)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <div style={{ marginTop: 4 }}>
          <Button onClick={onSubmit} loading={saving} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
          </Button>
        </div>
      </div>
    </div>
  )
}