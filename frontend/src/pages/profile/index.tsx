// ============================================================
//  src/pages/profile/index.tsx
// ============================================================

import { User } from 'lucide-react'
import { useAuth } from '../../Routes/AuthProtected'
import Toast from '../../components/common/Toast'
import useProfile from './services/useProfile'
import ChangePasswordForm from './components/ChangePasswordForm'
import ProfilePinSection from './components/ProfilePinSection'

export default function ProfilePage() {
  const { user } = useAuth()
  const {
    form, saving, toast, errors,
    handleChange, handleSubmit, dismissToast,
  } = useProfile()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <Toast toast={toast} onDismiss={dismissToast} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>โปรไฟล์</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          จัดการข้อมูลบัญชีและรหัสผ่านของคุณ
        </p>
      </div>

      {/* User info card */}
      <div style={{
        background: 'var(--surface, #fff)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 10px)',
        padding: 24, boxShadow: 'var(--shadow-sm)',
        maxWidth: 480, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#2563EB', fontWeight: 700, fontSize: 18,
          }}>
            {user.name?.charAt(0) || <User size={20} />}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'}
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <ChangePasswordForm
        form={form}
        saving={saving}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
       <ProfilePinSection /> 
    </div>
  )
}