// ============================================================
//  src/pages/settings/components/SettingsUsers.tsx
// ============================================================

import { useMemo, useState } from 'react'
import { Plus, X, UserCheck, UserX, KeyRound } from 'lucide-react'
import type { UserItem, UserFormData } from '../services/SettingsType'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import Modal from '../../../components/common/Modal'
import { PASSWORD_MIN_LENGTH, validatePassword } from '../../../helpers/passwordValidation'

const ROLE_OPTIONS: OptionType[] = [
  { value: 'staff', label: 'เจ้าหน้าที่' },
  { value: 'admin', label: 'ผู้ดูแลระบบ' },
]

interface Props {
  users: UserItem[]
  loading: boolean
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
  users, loading, showForm, form, saving,
  onToggleForm, onFormChange, onCreate, onToggleActive, onResetPassword,
}: Props) {
  const roleValue = useMemo(
    () => ROLE_OPTIONS.find((o) => o.value === form.role) ?? null,
    [form.role],
  )

  // ── Reset password modal state ──
  const [resetTarget, setResetTarget] = useState<UserItem | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetting, setResetting] = useState(false)

  const openResetModal = (user: UserItem) => {
    setResetTarget(user)
    setResetPassword('')
    setResetError('')
  }

  const closeResetModal = () => {
    setResetTarget(null)
    setResetPassword('')
    setResetError('')
  }

  const handleResetSubmit = async () => {
    const err = validatePassword(resetPassword)
    if (err) {
      setResetError(err)
      return
    }
    setResetting(true)
    try {
      await onResetPassword(resetTarget!.id, resetPassword)
      closeResetModal()
    } catch {
      setResetError('เกิดข้อผิดพลาด')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>จัดการผู้ใช้</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            เพิ่ม/ปิดใช้งานบัญชีผู้ใช้ · {users.length} คน
          </p>
        </div>
        <Button
          variant={showForm ? 'secondary' : 'primary'}
          size="sm"
          icon={showForm ? <X size={14} /> : <Plus size={14} />}
          onClick={() => onToggleForm(!showForm)}
        >
          {showForm ? 'ปิด' : 'เพิ่มผู้ใช้'}
        </Button>
      </div>

      {/* Add user form */}
      {showForm && (
        <div style={{
          padding: 16, marginBottom: 16,
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border)',
          background: 'var(--surface-raised, #F4F4F5)',
          animation: 'plasm-fade-in 0.2s ease',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12, marginBottom: 16,
          }}>
            <FormInput
              label="ชื่อผู้ใช้"
              required
              placeholder="username"
              value={form.username}
              onChange={(v) => onFormChange('username', v)}
              autoComplete="off"
            />
            <FormInput
              label="ชื่อ-สกุล"
              required
              placeholder="ชื่อที่แสดง"
              value={form.name}
              onChange={(v) => onFormChange('name', v)}
            />
            <div>
              <FormInput
                label="รหัสผ่าน"
                required
                type="password"
                placeholder={`อย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`}
                value={form.password}
                onChange={(v) => onFormChange('password', v)}
                autoComplete="new-password"
              />
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                ขั้นต่ำ {PASSWORD_MIN_LENGTH} ตัวอักษร
              </p>
            </div>
            <SelectDropdown
              label="บทบาท"
              options={ROLE_OPTIONS}
              value={roleValue}
              onChange={(opt) => onFormChange('role', opt?.value ?? 'staff')}
              isClearable={false}
              isSearchable={false}
            />
          </div>

          <Button onClick={onCreate} loading={saving} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้'}
          </Button>
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {users.map((user, idx) => (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: idx < users.length - 1 ? '1px solid var(--border)' : 'none',
              opacity: user.active ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: '50%',
                  background: user.role === 'admin' ? '#DBEAFE' : '#F4F4F5',
                  color: user.role === 'admin' ? '#2563EB' : '#71717A',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {user.name.charAt(0)}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    @{user.username} · {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<KeyRound size={13} />}
                  onClick={() => openResetModal(user)}
                >
                  ตั้งรหัสผ่าน
                </Button>
                <Button
                  variant={user.active ? 'outline-danger' : 'outline-success'}
                  size="sm"
                  icon={user.active ? <UserX size={13} /> : <UserCheck size={13} />}
                  onClick={() => onToggleActive(user)}
                >
                  {user.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reset Password Modal */}
      <Modal
        open={!!resetTarget}
        onClose={closeResetModal}
        title={resetTarget ? `ตั้งรหัสผ่านใหม่ — ${resetTarget.name}` : ''}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            ตั้งรหัสผ่านใหม่ให้ @{resetTarget?.username}
          </p>
          <FormInput
            label="รหัสผ่านใหม่"
            type="password"
            placeholder={`อย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`}
            value={resetPassword}
            onChange={(v) => { setResetPassword(v); setResetError('') }}
            autoComplete="new-password"
            error={resetError || undefined}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeResetModal}>ยกเลิก</Button>
            <Button onClick={handleResetSubmit} loading={resetting} disabled={resetting}>
              {resetting ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}