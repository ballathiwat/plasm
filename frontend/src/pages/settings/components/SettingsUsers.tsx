// src/pages/settings/components/SettingsUsers.tsx
// ห้ามปิดบัญชีที่กำลังใช้งาน และผู้ดูแลระบบคนสุดท้าย · ยืนยันก่อนปิดใช้งาน
import { useMemo, useState } from 'react'
import { Plus, X, UserCheck, UserX, KeyRound } from 'lucide-react'
import type { UserItem, UserFormData } from '../services/SettingsType'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import Modal, { ConfirmModal } from '../../../components/common/Modal'
import PasswordRules from '../../../components/common/PasswordRules'
import { PASSWORD_MIN_LENGTH, validatePassword } from '../../../helpers/passwordValidation'
import { card, srOnly } from './settingsStyles'

const ROLE_OPTIONS: OptionType[] = [
  { value: 'staff', label: 'เจ้าหน้าที่' },
  { value: 'admin', label: 'ผู้ดูแลระบบ' },
]

interface Props {
  users: UserItem[]
  loading: boolean
  currentUserId: string
  showForm: boolean
  form: UserFormData
  saving: boolean
  onToggleForm: (show: boolean) => void
  onFormChange: (field: keyof UserFormData, value: string) => void
  onCreate: () => void
  onToggleActive: (user: UserItem) => void
  onResetPassword: (userId: string, newPassword: string) => Promise<void>
}

export default function SettingsUsers({
  users, loading, currentUserId, showForm, form, saving,
  onToggleForm, onFormChange, onCreate, onToggleActive, onResetPassword,
}: Props) {
  const roleValue = useMemo(() => ROLE_OPTIONS.find((o) => o.value === form.role) ?? null, [form.role])

  const [resetTarget, setResetTarget] = useState<UserItem | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetting, setResetting] = useState(false)
  const [confirmOff, setConfirmOff] = useState<UserItem | null>(null)

  const activeAdmins = users.filter((u) => u.role === 'admin' && u.active).length
  const lockReason = (u: UserItem): string | null => {
    if (!u.active) return null
    if (u.id === currentUserId) return 'ปิดบัญชีที่กำลังใช้งานอยู่ไม่ได้'
    if (u.role === 'admin' && activeAdmins <= 1) return 'ต้องมีผู้ดูแลระบบที่เปิดใช้งานอย่างน้อย 1 คน'
    return null
  }

  const closeResetModal = () => { setResetTarget(null); setResetPassword(''); setResetError('') }

  const handleResetSubmit = async () => {
    const err = validatePassword(resetPassword)
    if (err) { setResetError(err); return }
    setResetting(true)
    try { await onResetPassword(resetTarget!.id, resetPassword); closeResetModal() }
    catch { setResetError('ตั้งรหัสผ่านไม่สำเร็จ — ลองใหม่อีกครั้ง') }
    finally { setResetting(false) }
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>จัดการผู้ใช้</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>เพิ่ม/ปิดใช้งานบัญชีผู้ใช้ · {users.length} คน</p>
        </div>
        <Button
          style={{ flexShrink: 0 }}
          variant={showForm ? 'secondary' : 'primary'}
          size="sm"
          icon={showForm ? <X size={14} /> : <Plus size={14} />}
          onClick={() => onToggleForm(!showForm)}
        >
          {showForm ? 'ปิด' : 'เพิ่มผู้ใช้'}
        </Button>
      </div>

      {showForm && (
        <div style={{
          padding: 16, marginBottom: 16, borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border)',
          background: 'var(--surface-raised, #F4F4F5)', animation: 'plasm-fade-in 0.2s ease',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
            <FormInput label="ชื่อผู้ใช้" required placeholder="username" value={form.username} onChange={(v: string) => onFormChange('username', v)} autoComplete="off" />
            <FormInput label="ชื่อ-สกุล" required placeholder="ชื่อที่แสดง" value={form.name} onChange={(v: string) => onFormChange('name', v)} />
            <FormInput label="รหัสผ่าน" required type="password" placeholder={`อย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`} value={form.password} onChange={(v: string) => onFormChange('password', v)} autoComplete="new-password" />
            <SelectDropdown label="บทบาท" options={ROLE_OPTIONS} value={roleValue} onChange={(opt) => onFormChange('role', (opt as OptionType | null)?.value ?? 'staff')} isClearable={false} isSearchable={false} />
          </div>
          <PasswordRules password={form.password} />
          <div style={{ marginTop: 12 }}>
            <Button onClick={onCreate} loading={saving} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้'}</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {users.map((user, idx) => {
            const lock = lockReason(user)
            const isMe = user.id === currentUserId
            return (
              <div key={user.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 0',
                borderBottom: idx < users.length - 1 ? '1px solid var(--border)' : 'none', opacity: user.active ? 1 : 0.5,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 220px', minWidth: 0 }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, flexShrink: 0, borderRadius: '50%',
                    background: user.role === 'admin' ? '#DBEAFE' : '#F4F4F5', color: user.role === 'admin' ? '#2563EB' : '#71717A', fontSize: 13, fontWeight: 700,
                  }}>{user.name.charAt(0)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {user.name}
                      {isMe && <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 99, background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>คุณ</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      @{user.username} · {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Button variant="outline" size="sm" icon={<KeyRound size={13} />} onClick={() => setResetTarget(user)}>ตั้งรหัสผ่าน</Button>
                  <span title={lock || undefined} style={{ display: 'inline-flex' }}>
                    <Button
                      variant={user.active ? 'outline-danger' : 'outline-success'}
                      size="sm"
                      icon={user.active ? <UserX size={13} /> : <UserCheck size={13} />}
                      disabled={!!lock}
                      aria-describedby={lock ? `lock-${user.id}` : undefined}
                      onClick={() => (user.active ? setConfirmOff(user) : onToggleActive(user))}
                    >
                      {user.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                    </Button>
                  </span>
                  {lock && <span id={`lock-${user.id}`} style={srOnly}>{lock}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        open={!!confirmOff}
        type="danger"
        title={confirmOff ? `ปิดใช้งาน ${confirmOff.name}?` : ''}
        message={confirmOff ? `@${confirmOff.username} จะเข้าสู่ระบบไม่ได้ทันที ข้อมูลและประวัติการทำรายการยังอยู่ครบ เปิดใช้งานกลับได้ทุกเมื่อ` : ''}
        confirmText="ปิดใช้งาน"
        onClose={() => setConfirmOff(null)}
        onConfirm={() => { onToggleActive(confirmOff!); setConfirmOff(null) }}
      />

      <Modal open={!!resetTarget} onClose={closeResetModal} title={resetTarget ? `ตั้งรหัสผ่านใหม่ — ${resetTarget.name}` : ''}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>ตั้งรหัสผ่านใหม่ให้ @{resetTarget?.username}</p>
          <FormInput
            label="รหัสผ่านใหม่" type="password" placeholder={`อย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`}
            value={resetPassword} onChange={(v: string) => { setResetPassword(v); setResetError('') }}
            autoComplete="new-password" error={resetError || undefined}
          />
          <PasswordRules password={resetPassword} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeResetModal}>ยกเลิก</Button>
            <Button onClick={handleResetSubmit} loading={resetting} disabled={resetting}>{resetting ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
