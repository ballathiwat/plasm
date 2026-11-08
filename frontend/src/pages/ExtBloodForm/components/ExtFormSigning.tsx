// frontend/src/pages/ExtBloodForm/components/ExtFormSigning.tsx
import { useState } from 'react'
import { CheckCircle, AlertTriangle, Lock, X, Loader2 } from 'lucide-react'
import type { SignState } from '../services/ExtFormType'
import type { UserSummary } from '../../ExtBlood/services/ExtBloodType'
import { formatThaiDateTime } from '../../ExtBlood/services/extHelpers'

const LABELS: Record<string, string> = { verifier: 'ผู้ตรวจ', storer: 'ผู้จัดเก็บ', approver: 'ผู้อนุมัติ' }
interface Props { signs: SignState[]; users: UserSummary[]; deferApproval: boolean; onDeferChange: (v: boolean) => void; onSign: (r: SignState['role'], uid: string, pin: string) => Promise<void>; onUnsign: (r: SignState['role']) => Promise<void> }

export default function ExtFormSigning({ signs, users, deferApproval, onDeferChange, onSign, onUnsign }: Props) {
  return (
    <div className="ext-form-section"><h3 className="ext-form-section-title">ลงนามอิเล็กทรอนิกส์</h3>
      <div className="ext-sign-rows">{signs.map(s => <SignRow key={s.role} sign={s} users={users} onSign={onSign} onUnsign={onUnsign} disabled={s.role === 'approver' && deferApproval} />)}</div>
      <label className="ext-defer-label"><input type="checkbox" checked={deferApproval} onChange={e => onDeferChange(e.target.checked)} /> ส่งรออนุมัติภายหลัง</label>
    </div>
  )
}

function SignRow({ sign: s, users, onSign, onUnsign, disabled }: { sign: SignState; users: UserSummary[]; onSign: Props['onSign']; onUnsign: Props['onUnsign']; disabled?: boolean }) {
  const [uid, setUid] = useState(s.userId)
  const [pin, setPin] = useState('')
  const submit = () => { if (pin.length === 6 && uid) onSign(s.role, uid, pin).then(() => setPin('')) }
  return (
    <div className={`ext-sign-form-row ${disabled ? 'ext-sign-form-row--disabled' : ''}`}>
      <div className="ext-sign-form-label">{LABELS[s.role]}</div>
      {s.status === 'signed' ? (
        <div className="ext-sign-form-signed"><CheckCircle size={18} color="var(--success-ink)" /><div><div className="ext-sign-form-name">{s.userName}</div><div className="ext-sign-form-time">{formatThaiDateTime(s.signedAt)}</div></div>
          <button className="ext-sign-form-unsign" onClick={() => onUnsign(s.role)}><X size={14} /> ยกเลิก</button></div>
      ) : s.status === 'locked' ? (
        <div className="ext-sign-form-locked"><Lock size={16} /><span>ถูกล็อก 15 นาที</span></div>
      ) : (
        <div className="ext-sign-form-input-area">
          <select className="ext-form-select ext-sign-user-select" value={uid} onChange={e => setUid(e.target.value)} disabled={disabled}>
            <option value="">เลือกผู้ลงนาม...</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input type="password" inputMode="numeric" maxLength={6} className="ext-form-input ext-pin-input ext-sign-pin" value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={e => { if (e.key === 'Enter') submit() }} placeholder="PIN" disabled={disabled || !uid} />
          {s.status === 'verifying' && <Loader2 size={18} className="ext-spin" />}
          {s.status === 'error' && <span className="ext-sign-error"><AlertTriangle size={14} /> {s.errorMsg}{s.remaining !== undefined && ` (เหลือ ${s.remaining} ครั้ง)`}</span>}
        </div>
      )}
    </div>
  )
}
