// frontend/src/pages/profile/components/ProfilePinSection.tsx
import { useEffect, useState } from 'react'
import { KeyRound, CheckCircle, AlertTriangle, Lock } from 'lucide-react'
import FormInput from '../../../components/common/FormInput'
import Button from '../../../components/common/Button'
import type { ToastState } from '../../../components/common/Toast'
import extBloodService from '../../ExtBlood/services/ExtBloodService'
import { formatThaiDateTime } from '../../ExtBlood/services/extHelpers'
import ProfileCard from './ProfileCard'

type Field = 'password' | 'pin' | 'confirmPin'
type PinStatus = { hasPin: boolean; lockedUntil: string | null }

const digits = (v: string) => v.replace(/\D/g, '').slice(0, 6)

export default function ProfilePinSection({ onToast }: { onToast: (t: ToastState) => void }) {
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<PinStatus | null>(null)

  useEffect(() => { extBloodService.getPinStatus().then(setStatus).catch(() => setStatus(null)) }, [])

  const locked = !!status?.lockedUntil && new Date(status.lockedUntil) > new Date()
  const change = (k: Field, set: (v: string) => void, fmt = (v: string) => v) => (v: string) => {
    set(fmt(v)); setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const submit = async () => {
    if (saving) return
    const e: Partial<Record<Field, string>> = {}
    if (!password) e.password = 'กรอกรหัสผ่านเข้าระบบ เพื่อยืนยันว่าเป็นคุณ'
    if (pin.length !== 6) e.pin = 'PIN ต้องเป็นตัวเลข 6 หลัก'
    else if (confirmPin !== pin) e.confirmPin = 'PIN ทั้งสองช่องไม่ตรงกัน'
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    try {
      await extBloodService.setupPin({ password, pin })
      onToast({ type: 'success', msg: status?.hasPin ? 'เปลี่ยน PIN สำเร็จ' : 'ตั้ง PIN สำเร็จ — ใช้ลงนามได้ทันที' })
      setPassword(''); setPin(''); setConfirmPin(''); setErrors({})
      setStatus({ hasPin: true, lockedUntil: null })
    } catch (err: any) {
      const msg = err?.message || 'ตั้ง PIN ไม่สำเร็จ ลองใหม่อีกครั้ง'
      if (/รหัสผ่าน/.test(msg)) setErrors({ password: msg })
      else onToast({ type: 'error', msg })
    } finally {
      setSaving(false)
    }
  }

  const badge = !status ? null
    : locked ? <span className="profile-badge profile-badge--danger"><Lock size={12} aria-hidden="true" /> ถูกล็อก</span>
    : status.hasPin ? <span className="profile-badge profile-badge--ok"><CheckCircle size={12} aria-hidden="true" /> ตั้งแล้ว</span>
    : <span className="profile-badge profile-badge--warn"><AlertTriangle size={12} aria-hidden="true" /> ยังไม่ตั้ง</span>

  const desc = locked
    ? <>PIN ถูกล็อกถึง {formatThaiDateTime(status!.lockedUntil)} เพราะกรอกผิดหลายครั้ง — ตั้ง PIN ใหม่ด้านล่างเพื่อปลดล็อก</>
    : status && !status.hasPin
      ? 'ต้องตั้ง PIN ก่อน จึงจะอนุมัติหรือนำออกเอกสารในเมนูรับเลือดจากภายนอกได้'
      : 'PIN 6 หลัก ใช้ยืนยันเมื่อลงนามในเมนูรับเลือดจากภายนอก'

  return (
    <ProfileCard icon={<KeyRound size={18} />} title="PIN ลงนามอิเล็กทรอนิกส์" desc={desc} status={badge}>
      <FormInput label="รหัสผ่านเข้าระบบ" type="password" required placeholder="กรอกรหัสผ่านที่ใช้ล็อกอิน"
        helper="ยืนยันตัวตนก่อนตั้ง PIN" value={password} onChange={change('password', setPassword)} error={errors.password} autoComplete="current-password" />
      <div className="profile-pin-row">
        <FormInput label={status?.hasPin ? 'PIN ใหม่' : 'PIN'} type="password" required mono inputMode="numeric" maxLength={6} placeholder="6 หลัก"
          value={pin} onChange={change('pin', setPin, digits)} error={errors.pin} autoComplete="off" />
        <FormInput label="ยืนยัน PIN" type="password" required mono inputMode="numeric" maxLength={6} placeholder="6 หลัก"
          value={confirmPin} onChange={change('confirmPin', setConfirmPin, digits)} error={errors.confirmPin} autoComplete="off" />
      </div>
      <div className="profile-actions">
        <Button onClick={submit} loading={saving} disabled={saving} icon={<KeyRound size={16} />}>
          {saving ? 'กำลังบันทึก...' : status?.hasPin ? 'เปลี่ยน PIN' : 'ตั้ง PIN'}
        </Button>
      </div>
    </ProfileCard>
  )
}
