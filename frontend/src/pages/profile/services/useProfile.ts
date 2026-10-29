// ============================================================
//  src/pages/profile/services/useProfile.ts
// ============================================================

import { useState } from 'react'
import profileService from './ProfileService'
import type { ChangePasswordForm } from './ProfileType'
import { validatePassword } from '../../../helpers/passwordValidation'

const DEFAULT_FORM: ChangePasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export default function useProfile() {
  const [form, setForm] = useState<ChangePasswordForm>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordForm, string>>>({})

  const handleChange = (field: keyof ChangePasswordForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = async () => {
    const newErrors: typeof errors = {}

    if (!form.currentPassword) {
      newErrors.currentPassword = 'กรุณากรอกรหัสผ่านเดิม'
    }

    const pwError = validatePassword(form.newPassword)
    if (pwError) {
      newErrors.newPassword = pwError
    }

    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านใหม่ไม่ตรงกัน'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      await profileService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setToast({ type: 'success', msg: 'เปลี่ยนรหัสผ่านสำเร็จ' })
      setForm(DEFAULT_FORM)
      setErrors({})
    } catch (err: any) {
      setToast({ type: 'error', msg: err?.message || 'เกิดข้อผิดพลาด' })
    } finally {
      setSaving(false)
    }
  }

  const dismissToast = () => setToast(null)

  return {
    form,
    saving,
    toast,
    errors,
    handleChange,
    handleSubmit,
    dismissToast,
  }
}