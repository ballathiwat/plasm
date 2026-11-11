// frontend/src/pages/profile/components/ProfilePinSection.tsx
import { useState } from 'react'
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import extBloodService from '../../ExtBlood/services/ExtBloodService'

export default function ProfilePinSection() {
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('')
    if (!password) { setError('กรุณากรอกรหัสผ่าน'); return }
    if (pin.length !== 6) { setError('PIN ต้องเป็นตัวเลข 6 หลัก'); return }
    if (pin !== confirmPin) { setError('PIN ไม่ตรงกัน'); return }
    setLoading(true)
    try { await extBloodService.setupPin({ password, pin }); setSuccess('ตั้ง PIN สำเร็จ'); setPassword(''); setPin(''); setConfirmPin('') }
    catch (err: any) { setError(err?.message || 'เกิดข้อผิดพลาด') }
    finally { setLoading(false) }
  }

  return (
    <div className="profile-section">
      <h3 className="profile-section-title"><KeyRound size={18} /> PIN ลงนามอิเล็กทรอนิกส์</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>PIN 6 หลัก สำหรับลงนามผู้ตรวจ ผู้จัดเก็บ ผู้อนุมัติ ในเมนูรับเลือดจากภายนอก</p>
      <form onSubmit={submit} style={{ maxWidth: 360 }}>
        <div className="ext-form-group"><label className="ext-form-label">รหัสผ่านปัจจุบัน <span className="ext-required">*</span></label>
          <div style={{ position: 'relative' }}><input type={showPw ? 'text' : 'password'} className="ext-form-input" value={password} onChange={e => { setPassword(e.target.value); setError('') }} placeholder="ยืนยันตัวตนก่อนตั้ง PIN" autoComplete="current-password" />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-disabled)' }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
        <div className="ext-form-group"><label className="ext-form-label">PIN ใหม่ (6 หลัก) <span className="ext-required">*</span></label>
          <input type="password" inputMode="numeric" maxLength={6} className="ext-form-input ext-pin-input" value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }} placeholder="••••••" autoComplete="off" /></div>
        <div className="ext-form-group"><label className="ext-form-label">ยืนยัน PIN <span className="ext-required">*</span></label>
          <input type="password" inputMode="numeric" maxLength={6} className="ext-form-input ext-pin-input" value={confirmPin} onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }} placeholder="••••••" autoComplete="off" /></div>
        {error && <div className="ext-form-error"><AlertTriangle size={14} /> {error}</div>}
        {success && <div style={{ display:'flex',alignItems:'center',gap:6,color:'var(--success-ink)',fontSize:13,marginTop:4 }}><CheckCircle size={14} /> {success}</div>}
        <button type="submit" className="plasm-btn plasm-btn--primary" disabled={loading} style={{ marginTop: 8 }}>{loading ? <Loader2 size={16} className="ext-spin" /> : <KeyRound size={16} />} {loading ? 'กำลังบันทึก...' : 'ตั้ง PIN'}</button>
      </form>
    </div>
  )
}
